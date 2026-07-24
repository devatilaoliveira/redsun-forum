[CmdletBinding()]
param(
  [string]$SupabaseWorkdir,
  [string]$SupabaseStatusFile,
  [string]$BaseUrl = "http://localhost:4200",
  [string]$ApiBaseUrl = "http://localhost:8080",
  [string]$SupabaseUrl = "http://127.0.0.1:54321"
)

$ErrorActionPreference = "Stop"
$webRoot = Split-Path -Parent $PSScriptRoot
$writeEnvScript = Join-Path -Path $PSScriptRoot -ChildPath "write-env.js"
$removeStatusFile = $false

function Get-LocalSupabasePublishableKey {
  param(
    [Parameter(Mandatory)]
    [string]$SupabaseCommand,
    [string]$StatusFile,
    [string]$Workdir
  )

  $statusArguments = @("status", "--workdir", $Workdir, "--output", "env")
  $statusErrorFile = "$StatusFile.stderr"
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = "Continue"
    $status = @(& $SupabaseCommand @statusArguments 2> $statusErrorFile)
    $statusExitCode = $LASTEXITCODE
  }
  finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  $statusErrorText = if (Test-Path -LiteralPath $statusErrorFile) {
    (Get-Content -LiteralPath $statusErrorFile | Out-String).Trim()
  } else {
    ""
  }
  Remove-Item -LiteralPath $statusErrorFile -Force -ErrorAction SilentlyContinue

  if ($statusExitCode -ne 0) {
    $statusText = ($status | Out-String).Trim()
    $statusDetails = @($statusText, $statusErrorText) |
      Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    throw "Could not read local Supabase status. Start the local stack with apps/api/supabase/scripts/start-local.ps1 and retry.`n$($statusDetails -join [Environment]::NewLine)"
  }

  [System.IO.File]::WriteAllLines(
    $StatusFile,
    [string[]]$status,
    [System.Text.UTF8Encoding]::new($false)
  )

  $publishableKey = [string](($status |
    Where-Object { $_ -match "^[A-Z0-9_]*ANON[A-Z0-9_]*KEY=" -or $_ -match "^[A-Z0-9_]*PUBLISHABLE[A-Z0-9_]*KEY=" } |
    Select-Object -First 1) -replace "^[^=]+=", "")

  $publishableKey = $publishableKey.Trim().Trim('"').Trim("'")
  if ([string]::IsNullOrWhiteSpace($publishableKey)) {
    throw "Could not find the local Supabase anon/publishable key in status output. No status values were printed because they may contain secrets."
  }

  return $publishableKey
}

try {
  $supabase = Get-Command "supabase" -ErrorAction SilentlyContinue
  if (-not $supabase) {
    throw "Supabase CLI was not found. Install a compatible CLI and start the local stack before running the frontend."
  }
  $node = Get-Command "node" -ErrorAction SilentlyContinue
  if (-not $node) {
    throw "Node was not found. Install the version required by apps/web/package.json."
  }

  if ([string]::IsNullOrWhiteSpace($SupabaseWorkdir)) {
    $appsRoot = Split-Path -Parent $webRoot
    $SupabaseWorkdir = Join-Path -Path $appsRoot -ChildPath "api"
  }

  if ([string]::IsNullOrWhiteSpace($SupabaseStatusFile)) {
    $SupabaseStatusFile = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath "redsun-web-supabase-status-$([guid]::NewGuid().ToString('N')).env"
    $removeStatusFile = $true
  }

  $env:BASE_URL = $BaseUrl
  $env:API_BASE_URL = $ApiBaseUrl
  $env:SUPABASE_URL = $SupabaseUrl
  $env:SUPABASE_PUBLISHABLE_KEY = Get-LocalSupabasePublishableKey `
    -SupabaseCommand $supabase.Source `
    -StatusFile $SupabaseStatusFile `
    -Workdir $SupabaseWorkdir
  $env:APP_ENV = "local"

  & $node.Source $writeEnvScript
  if ($LASTEXITCODE -ne 0) {
    throw "Could not generate the local web runtime environment."
  }
  Write-Host "Wrote local web runtime environment to $(Join-Path -Path $webRoot -ChildPath 'public/env.js')."
}
finally {
  if ($removeStatusFile -and
      -not [string]::IsNullOrWhiteSpace($SupabaseStatusFile) -and
      (Test-Path -LiteralPath $SupabaseStatusFile)) {
    Remove-Item -LiteralPath $SupabaseStatusFile -Force
  }
}
