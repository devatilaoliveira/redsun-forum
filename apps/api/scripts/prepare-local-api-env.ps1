[CmdletBinding()]
param(
  [string]$OutputFile = ".env.local.ci",
  [string]$GitHubEnvFile = $env:GITHUB_ENV,
  [string]$SupabaseStatusFile = "supabase-status.env",
  [string]$SupabaseWorkdir,
  [string]$AppTestCleanupToken = "ci-test-cleanup-token"
)

function Get-LocalSupabaseServiceRoleKey {
  param(
    [string]$StatusFile,
    [string]$Workdir
  )

  if ([string]::IsNullOrWhiteSpace($Workdir)) {
    supabase status -o env | Out-File -FilePath $StatusFile -Encoding utf8
  } else {
    supabase status --workdir $Workdir -o env | Out-File -FilePath $StatusFile -Encoding utf8
  }

  $status = Get-Content -Path $StatusFile
  $serviceRoleKey = ($status |
    Where-Object { $_ -match "^[A-Z0-9_]*SERVICE[A-Z0-9_]*ROLE[A-Z0-9_]*KEY=" } |
    Select-Object -First 1) -replace "^[^=]+=", ""

  $serviceRoleKey = $serviceRoleKey.Trim().Trim('"').Trim("'")
  if ([string]::IsNullOrWhiteSpace($serviceRoleKey)) {
    Write-Host "Supabase status output:"
    Get-Content -Path $StatusFile
    throw "Could not find the local Supabase service role key in status output."
  }

  return $serviceRoleKey
}

function Write-EnvFile {
  param(
    [string]$Path,
    [System.Collections.IDictionary]$Values
  )

  $lines = foreach ($key in $Values.Keys) {
    "$key=$($Values[$key])"
  }
  $lines | Set-Content -Path $Path -Encoding utf8
}

function Add-GitHubEnv {
  param(
    [string]$Path,
    [System.Collections.IDictionary]$Values
  )

  if ([string]::IsNullOrWhiteSpace($Path)) {
    return
  }

  foreach ($key in $Values.Keys) {
    "$key=$($Values[$key])" | Out-File -FilePath $Path -Append -Encoding utf8
  }
}

if ([string]::IsNullOrWhiteSpace($SupabaseWorkdir)) {
  $scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
  $apiRoot = Split-Path -Parent $scriptRoot
  $SupabaseWorkdir = Split-Path -Parent (Split-Path -Parent $apiRoot)
}

$serviceRoleKey = Get-LocalSupabaseServiceRoleKey -StatusFile $SupabaseStatusFile -Workdir $SupabaseWorkdir

$envValues = [ordered]@{
  SERVER_PORT = "8080"
  SPRING_PROFILES_ACTIVE = "local"
  APP_FRONTEND_URL = "http://localhost:4200"
  APP_LOGOUT_REDIRECT = "http://localhost:4200"
  CORS_ALLOWED_ORIGINS = "http://localhost:4200"
  DB_HOST = "127.0.0.1"
  DB_PORT = "54322"
  DB_NAME = "postgres"
  DB_ADMIN_USER = "postgres"
  DB_ADMIN_PASSWORD = "postgres"
  DB_APP_ROLE = "redsun_dev"
  DB_USER = "redsun_dev"
  DB_PASSWORD = "local-redsun-password"
  SUPABASE_URL = "http://127.0.0.1:54321"
  SUPABASE_STORAGE_URL = "http://127.0.0.1:54321/storage/v1/object/public/"
  SUPABASE_SECRET_KEY = $serviceRoleKey
  SPRING_DATASOURCE_URL = "jdbc:postgresql://127.0.0.1:54322/postgres?sslmode=disable"
  BREVO_API_KEY = "ci-placeholder"
  BREVO_SENDER_EMAIL = "ci-placeholder@redsun.invalid"
  BREVO_SENDER_NAME = "RedSun_CI"
  APP_TEST_CLEANUP_TOKEN = $AppTestCleanupToken
}

Write-EnvFile -Path $OutputFile -Values $envValues
Add-GitHubEnv -Path $GitHubEnvFile -Values $envValues

Write-Host "Wrote local API environment to $OutputFile."
