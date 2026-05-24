[CmdletBinding()]
param(
  [string]$EnvFile = ".env.local",
  [string]$OutputDir = "backups",
  [string[]]$Schemas = @("public", "private"),
  [string]$PgDumpPath,
  [string]$SslMode = "require",
  [switch]$OverrideEnv
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

  throw "$CommandName not found. Install PostgreSQL client tools or pass -PgDumpPath to this script."
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

try {
  Load-EnvFile -Path $EnvFile
  Assert-RequiredEnv -Names @("DB_HOST", "DB_PORT", "DB_NAME", "DB_ADMIN_USER", "DB_ADMIN_PASSWORD")

  if ($Schemas.Count -eq 0) {
    throw "At least one schema must be provided."
  }

  $pgDumpCmd = Get-ToolCommand -ExplicitPath $PgDumpPath -CommandName "pg_dump"
  $backupRoot = New-Item -ItemType Directory -Force -Path $OutputDir
  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $backupPath = Join-Path -Path $backupRoot.FullName -ChildPath "$($env:DB_NAME)-$timestamp.dump"

  $prevPgPassword = $env:PGPASSWORD
  $prevPgSslMode = $env:PGSSLMODE
  $env:PGPASSWORD = $env:DB_ADMIN_PASSWORD
  if ($SslMode -and $SslMode -ne "") {
    $env:PGSSLMODE = $SslMode
  }

  $schemaArgs = @()
  foreach ($schema in $Schemas) {
    $schemaArgs += "--schema=$schema"
  }

  Write-Host "Writing database backup to $backupPath..."
  & $pgDumpCmd `
    -h $env:DB_HOST `
    -p $env:DB_PORT `
    -U $env:DB_ADMIN_USER `
    -d $env:DB_NAME `
    --format=custom `
    --blobs `
    --no-owner `
    --no-acl `
    @schemaArgs `
    --file $backupPath
  if ($LASTEXITCODE -ne 0) {
    throw "pg_dump failed"
  }

  Write-Host "Backup complete: $backupPath"
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
