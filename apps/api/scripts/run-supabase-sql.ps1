[CmdletBinding()]
param(
  [string]$EnvFile = ".env.local",
  [string[]]$SqlFiles = @("db/schema.sql", "db/private-wipe.sql", "db/rls_tale.sql", "db/rls_post.sql", "db/storage.sql", "db/storage-wipe.sql", "db/auth-wipe.sql", "db/data-api-hardening.sql", "db/app-role-grants.sql"),
  [string]$PsqlPath,
  [string]$SslMode = "require",
  [switch]$OverrideEnv,
  [switch]$SkipRuntimeLoginVerification
)

function Load-EnvFile {
  param([string]$Path)

  if (-not (Test-Path -Path $Path)) {
    throw "Env file not found: $Path"
  }

  $loadedNames = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

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
      [void]$loadedNames.Add($name)
      $envPath = "env:$name"
      if ($OverrideEnv -or -not (Test-Path -Path $envPath)) {
        Set-Item -Path $envPath -Value $value
      }
    }
  }

  return $loadedNames
}

function Clear-AbsentOptionalEnv {
  param(
    [System.Collections.Generic.HashSet[string]]$LoadedNames,
    [string[]]$Names
  )

  foreach ($name in $Names) {
    if (-not $LoadedNames.Contains($name)) {
      Remove-Item -Path "env:$name" -ErrorAction SilentlyContinue
    }
  }
}

function Assert-SupabasePoolerUser {
  param(
    [string]$HostName,
    [string]$UserName,
    [string]$VariableName
  )

  if ($HostName -like "*.pooler.supabase.com" -and $UserName -notmatch "^[^.]+\.[a-z0-9]{20}$") {
    throw "$VariableName must include the Supabase project ref when the configured host uses the pooler. Expected format: role.<project-ref>. Use -OverrideEnv if your current shell has stale DB variables."
  }
}

function Get-EnvOrDefault {
  param(
    [string]$Name,
    [string]$DefaultValue
  )

  $value = [Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    return $DefaultValue
  }

  return $value
}

function Get-EndpointSource {
  param(
    [string]$HostVariableName,
    [string]$PortVariableName
  )

  $hostValue = [Environment]::GetEnvironmentVariable($HostVariableName)
  $portValue = [Environment]::GetEnvironmentVariable($PortVariableName)
  if ([string]::IsNullOrWhiteSpace($hostValue) -and [string]::IsNullOrWhiteSpace($portValue)) {
    return "DB_HOST/DB_PORT"
  }

  return "$HostVariableName/$PortVariableName"
}

function Test-RuntimeDatabaseLogin {
  param(
    [string]$PsqlCommand,
    [int]$MaxAttempts = 6,
    [int]$DelaySeconds = 5
  )

  Write-Host "Verifying runtime database login for $($env:DB_USER)..."
  $env:PGPASSWORD = $env:DB_PASSWORD

  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    $psqlOutput = & $PsqlCommand `
      -h $env:DB_HOST `
      -p $env:DB_PORT `
      -U $env:DB_USER `
      -d $env:DB_NAME `
      -v ON_ERROR_STOP=1 `
      -q `
      -c "SELECT 1;" 2>&1

    if ($LASTEXITCODE -eq 0) {
      return
    }

    $psqlMessage = ($psqlOutput | Out-String).Trim()
    if ($psqlMessage -match "ECIRCUITBREAKER|too many authentication failures") {
      throw "Runtime database login hit the Supabase pooler authentication circuit breaker. Stop app instances or scripts using stale DB credentials, wait for the pooler block to clear, then verify DB_USER/DB_PASSWORD and rerun the grants or reset command."
    }
    if ($psqlMessage -match "password authentication failed") {
      throw "Runtime database login failed because Supabase rejected DB_USER/DB_PASSWORD. Stop retrying, verify the runtime role password in Supabase/Postgres, then rerun only db/app-role-bootstrap.sql,db/app-role-grants.sql."
    }

    if ($attempt -lt $MaxAttempts) {
      if ($psqlMessage) {
        Write-Warning $psqlMessage
      }
      Write-Warning "Runtime database login attempt $attempt of $MaxAttempts failed. Retrying in $DelaySeconds seconds..."
      Start-Sleep -Seconds $DelaySeconds
    }
  }

  throw "Runtime database login failed for DB_USER after app-role grants. Confirm DB_HOST/DB_PORT and DB_ADMIN_HOST/DB_ADMIN_PORT point to the same Supabase project, wait for pooler credential propagation after any password rotation, and restart old app instances that may still be using stale credentials."
}

try {
  $loadedEnvNames = Load-EnvFile -Path $EnvFile
  if ($OverrideEnv) {
    Clear-AbsentOptionalEnv -LoadedNames $loadedEnvNames -Names @("DB_ADMIN_HOST", "DB_ADMIN_PORT")
  }

  $required = @("DB_HOST", "DB_PORT", "DB_NAME", "DB_ADMIN_USER", "DB_ADMIN_PASSWORD", "DB_APP_ROLE", "DB_USER", "DB_PASSWORD")
  $missing = @()
  foreach ($key in $required) {
    $value = [Environment]::GetEnvironmentVariable($key)
    if ([string]::IsNullOrWhiteSpace($value)) {
      $missing += $key
    }
  }
  if ($missing.Count -gt 0) {
    throw "Missing required env vars: $($missing -join ", ")"
  }

  $adminHost = Get-EnvOrDefault -Name "DB_ADMIN_HOST" -DefaultValue $env:DB_HOST
  $adminPort = Get-EnvOrDefault -Name "DB_ADMIN_PORT" -DefaultValue $env:DB_PORT
  $adminEndpointSource = Get-EndpointSource -HostVariableName "DB_ADMIN_HOST" -PortVariableName "DB_ADMIN_PORT"

  Assert-SupabasePoolerUser -HostName $adminHost -UserName $env:DB_ADMIN_USER -VariableName "DB_ADMIN_USER"
  Assert-SupabasePoolerUser -HostName $env:DB_HOST -UserName $env:DB_USER -VariableName "DB_USER"

  $psqlCmd = $null
  if ($PsqlPath) {
    $psqlCmd = $PsqlPath
  } else {
    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) {
      $psqlCmd = $cmd.Source
    }
  }
  if (-not $psqlCmd) {
    throw "psql not found. Install PostgreSQL client tools or pass -PsqlPath to this script."
  }

  $prevPgPassword = $env:PGPASSWORD
  $prevPgSslMode = $env:PGSSLMODE
  $env:PGPASSWORD = $env:DB_ADMIN_PASSWORD
  if ($SslMode -and $SslMode -ne "") {
    $env:PGSSLMODE = $SslMode
  }

  Write-Host "Using admin database endpoint $($adminHost):$($adminPort) from $adminEndpointSource."
  foreach ($file in $SqlFiles) {
    if (-not (Test-Path -Path $file)) {
      throw "SQL file not found: $file"
    }

    Write-Host "Running $file..."
    & $psqlCmd `
      -h $adminHost `
      -p $adminPort `
      -U $env:DB_ADMIN_USER `
      -d $env:DB_NAME `
      -v ON_ERROR_STOP=1 `
      -v "APP_DB_NAME=$env:DB_NAME" `
      -v "APP_DB_ROLE=$env:DB_APP_ROLE" `
      -v "APP_DB_USER=$env:DB_USER" `
      -v "APP_DB_PASSWORD=$env:DB_PASSWORD" `
      -f $file
    if ($LASTEXITCODE -ne 0) {
      throw "psql failed while running $file"
    }
  }

  $runsAppRoleBootstrapSql = $SqlFiles | Where-Object { (Split-Path -Path $_ -Leaf) -eq "app-role-bootstrap.sql" }
  $runsAppRoleGrantsSql = $SqlFiles | Where-Object { (Split-Path -Path $_ -Leaf) -eq "app-role-grants.sql" }
  if ($runsAppRoleGrantsSql -and $runsAppRoleBootstrapSql) {
    Write-Warning "Skipped immediate runtime database login verification because app-role-bootstrap.sql ran and Supabase pooler credentials may need time to propagate. Wait a few minutes, then verify with db/app-role-grants.sql only."
  } elseif ($runsAppRoleGrantsSql -and -not $SkipRuntimeLoginVerification) {
    Test-RuntimeDatabaseLogin -PsqlCommand $psqlCmd
  } elseif ($runsAppRoleGrantsSql) {
    Write-Warning "Skipped runtime database login verification because -SkipRuntimeLoginVerification was provided."
  }

  Write-Host "Done."
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
