[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [Parameter(Mandatory = $true)]
  [string]$ConfirmRestore,
  [string]$EnvFile = ".env",
  [string]$PgRestorePath,
  [string]$SslMode = "require",
  [switch]$OverrideEnv,
  [switch]$AllowRemote,
  [switch]$NoClean
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

  throw "$CommandName not found. Install PostgreSQL client tools or pass -PgRestorePath to this script."
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

function Assert-NotProduction {
  $profile = [Environment]::GetEnvironmentVariable("SPRING_PROFILES_ACTIVE")
  $appEnv = [Environment]::GetEnvironmentVariable("APP_ENV")
  $envName = [Environment]::GetEnvironmentVariable("ENV")
  $markers = @($profile, $appEnv, $envName) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

  foreach ($marker in $markers) {
    if ($marker -match "(^|,|\s)(prod|production)(,|\s|$)") {
      throw "Refusing to restore because production environment marker was found: $marker"
    }
  }
}

function Assert-LocalHostUnlessAllowed {
  param([string]$HostName)

  if ($AllowRemote) {
    return
  }

  $localHosts = @("localhost", "127.0.0.1", "::1")
  if ($HostName -notin $localHosts) {
    throw "Refusing to restore to remote host '$HostName'. Pass -AllowRemote only for a non-production test database."
  }
}

try {
  Load-EnvFile -Path $EnvFile
  Assert-RequiredEnv -Names @("DB_HOST", "DB_PORT", "DB_NAME", "DB_ADMIN_USER", "DB_ADMIN_PASSWORD")
  Assert-NotProduction
  Assert-LocalHostUnlessAllowed -HostName $env:DB_HOST

  $expectedConfirmation = "RESTORE $($env:DB_NAME)"
  if ($ConfirmRestore -ne $expectedConfirmation) {
    throw "Invalid confirmation. Re-run with -ConfirmRestore `"$expectedConfirmation`" if you really want to replace data in this database."
  }

  if (-not (Test-Path -Path $BackupFile)) {
    throw "Backup file not found: $BackupFile"
  }

  $backupPath = (Resolve-Path -Path $BackupFile).Path
  $pgRestoreCmd = Get-ToolCommand -ExplicitPath $PgRestorePath -CommandName "pg_restore"

  $prevPgPassword = $env:PGPASSWORD
  $prevPgSslMode = $env:PGSSLMODE
  $env:PGPASSWORD = $env:DB_ADMIN_PASSWORD
  if ($SslMode -and $SslMode -ne "") {
    $env:PGSSLMODE = $SslMode
  }

  $restoreArgs = @(
    "-h", $env:DB_HOST,
    "-p", $env:DB_PORT,
    "-U", $env:DB_ADMIN_USER,
    "-d", $env:DB_NAME,
    "--no-owner",
    "--no-acl",
    "--exit-on-error"
  )

  if (-not $NoClean) {
    $restoreArgs += "--clean"
    $restoreArgs += "--if-exists"
  }

  Write-Host "Restoring $backupPath into $($env:DB_HOST):$($env:DB_PORT)/$($env:DB_NAME)..."
  & $pgRestoreCmd @restoreArgs $backupPath
  if ($LASTEXITCODE -ne 0) {
    throw "pg_restore failed"
  }

  Write-Host "Restore complete."
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
