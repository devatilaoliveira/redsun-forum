[CmdletBinding()]
param(
  [string]$EnvFile = ".env.local",
  [string[]]$SeedFiles = @("db/seed.sql"),
  [string]$PsqlPath,
  [switch]$OverrideEnv,
  [switch]$SkipSeed
)

function Load-EnvFile {
  param([string]$Path)

  if (-not (Test-Path -Path $Path)) {
    throw "Env file not found: $Path"
  }

  Get-Content -Path $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) {
      return
    }

    $idx = $line.IndexOf("=")
    if ($idx -lt 1) {
      return
    }

    $name = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()

    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if ($name -ne "") {
      $envPath = "env:$name"
      if ($OverrideEnv -or -not (Test-Path -Path $envPath)) {
        Set-Item -Path $envPath -Value $value
      }
    }
  }
}

function Get-ToolCommand {
  param(
    [string]$ExplicitPath,
    [string]$CommandName
  )

  if ($ExplicitPath) {
    return $ExplicitPath
  }

  $cmd = Get-Command $CommandName -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  throw "$CommandName not found. Install PostgreSQL client tools or pass -PsqlPath to this script."
}

function Assert-RequiredEnv {
  param([string[]]$Names)

  $missing = @()
  foreach ($key in $Names) {
    $value = [Environment]::GetEnvironmentVariable($key)
    if ([string]::IsNullOrWhiteSpace($value)) {
      $missing += $key
    }
  }

  if ($missing.Count -gt 0) {
    throw "Missing required env vars: $($missing -join ", ")"
  }
}

function Assert-LocalHost {
  param([string]$HostName)

  $localHosts = @("localhost", "127.0.0.1", "::1")
  if ($HostName -notin $localHosts) {
    throw "Refusing to reset local Supabase against non-local host '$HostName'."
  }
}

function Assert-NotProduction {
  $profile = [Environment]::GetEnvironmentVariable("SPRING_PROFILES_ACTIVE")
  $appEnv = [Environment]::GetEnvironmentVariable("APP_ENV")
  $envName = [Environment]::GetEnvironmentVariable("ENV")
  $markers = @($profile, $appEnv, $envName) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

  foreach ($marker in $markers) {
    if ($marker -match "(^|,|\s)(prod|production)(,|\s|$)") {
      throw "Refusing to reset local Supabase because production environment marker was found: $marker"
    }
  }
}

function Assert-ValidRoleName {
  param([string]$RoleName)

  if ($RoleName -notmatch "^[A-Za-z_][A-Za-z0-9_]*$") {
    throw "DB_APP_ROLE must be a simple PostgreSQL identifier for local role creation. Actual value: $RoleName"
  }
}

function Ensure-LocalRuntimeRole {
  param([string]$PsqlCommand)

  Assert-ValidRoleName -RoleName $env:DB_APP_ROLE
  $roleName = $env:DB_APP_ROLE.Replace("'", "''")
  $rolePassword = $env:DB_PASSWORD.Replace("'", "''")
  $roleSql = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$roleName') THEN
    EXECUTE format('CREATE ROLE %I WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', '$roleName', '$rolePassword');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', '$roleName', '$rolePassword');
  END IF;
END
`$`$;
"@

  Write-Host "Ensuring local runtime role $($env:DB_APP_ROLE) exists..."
  & $PsqlCommand `
    -h $env:DB_HOST `
    -p $env:DB_PORT `
    -U $env:DB_ADMIN_USER `
    -d $env:DB_NAME `
    -v ON_ERROR_STOP=1 `
    -q `
    -c $roleSql
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to create or update local runtime role $($env:DB_APP_ROLE)."
  }
}

function Invoke-SqlFile {
  param(
    [string]$PsqlCommand,
    [string]$SqlFile
  )

  if (-not (Test-Path -Path $SqlFile)) {
    throw "SQL file not found: $SqlFile"
  }

  Write-Host "Running $SqlFile..."
  & $PsqlCommand `
    -h $env:DB_HOST `
    -p $env:DB_PORT `
    -U $env:DB_ADMIN_USER `
    -d $env:DB_NAME `
    -v ON_ERROR_STOP=1 `
    -f $SqlFile
  if ($LASTEXITCODE -ne 0) {
    throw "psql failed while running $SqlFile"
  }
}

try {
  $startingDirectory = (Get-Location).Path
  $envFilePath = if ([System.IO.Path]::IsPathRooted($EnvFile)) {
    $EnvFile
  } else {
    Join-Path -Path $startingDirectory -ChildPath $EnvFile
  }

  Load-EnvFile -Path $envFilePath
  Assert-RequiredEnv -Names @("DB_HOST", "DB_PORT", "DB_NAME", "DB_ADMIN_USER", "DB_ADMIN_PASSWORD", "DB_APP_ROLE", "DB_USER", "DB_PASSWORD")
  Assert-NotProduction
  Assert-LocalHost -HostName $env:DB_HOST

  $psqlCmd = Get-ToolCommand -ExplicitPath $PsqlPath -CommandName "psql"
  $prevPgPassword = $env:PGPASSWORD
  $prevPgSslMode = $env:PGSSLMODE
  $env:PGPASSWORD = $env:DB_ADMIN_PASSWORD
  $env:PGSSLMODE = "disable"

  Ensure-LocalRuntimeRole -PsqlCommand $psqlCmd

  $scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
  $apiRoot = Split-Path -Parent $scriptRoot

  Push-Location $apiRoot
  try {
    & (Join-Path -Path $scriptRoot -ChildPath "run-supabase-sql.ps1") `
      -EnvFile $envFilePath `
      -OverrideEnv `
      -SslMode "disable"
    if ($LASTEXITCODE -ne 0) {
      throw "run-supabase-sql.ps1 failed."
    }

    if (-not $SkipSeed) {
      foreach ($seedFile in $SeedFiles) {
        if (Test-Path -Path $seedFile) {
          Invoke-SqlFile -PsqlCommand $psqlCmd -SqlFile $seedFile
        } else {
          Write-Warning "Seed file not found, skipping: $seedFile"
        }
      }
    }
  }
  finally {
    Pop-Location
  }

  Write-Host "Local Supabase reset complete."
}
finally {
  if ($null -ne $prevPgPassword) {
    $env:PGPASSWORD = $prevPgPassword
  } else {
    Remove-Item -Path env:PGPASSWORD -ErrorAction SilentlyContinue
  }
  if ($null -ne $prevPgSslMode) {
    $env:PGSSLMODE = $prevPgSslMode
  } else {
    Remove-Item -Path env:PGSSLMODE -ErrorAction SilentlyContinue
  }
}
