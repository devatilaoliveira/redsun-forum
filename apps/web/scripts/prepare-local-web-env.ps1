[CmdletBinding()]
param(
  [string]$SupabaseWorkdir,
  [string]$SupabaseStatusFile = "supabase-status.env",
  [string]$BaseUrl = "http://localhost:4200",
  [string]$ApiBaseUrl = "http://localhost:8080",
  [string]$SupabaseUrl = "http://127.0.0.1:54321"
)

function Get-LocalSupabasePublishableKey {
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
  $publishableKey = ($status |
    Where-Object { $_ -match "^[A-Z0-9_]*ANON[A-Z0-9_]*KEY=" -or $_ -match "^[A-Z0-9_]*PUBLISHABLE[A-Z0-9_]*KEY=" } |
    Select-Object -First 1) -replace "^[^=]+=", ""

  $publishableKey = $publishableKey.Trim().Trim('"').Trim("'")
  if ([string]::IsNullOrWhiteSpace($publishableKey)) {
    Write-Host "Supabase status output:"
    Get-Content -Path $StatusFile
    throw "Could not find the local Supabase anon/publishable key in status output."
  }

  return $publishableKey
}

if ([string]::IsNullOrWhiteSpace($SupabaseWorkdir)) {
  $scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
  $webRoot = Split-Path -Parent $scriptRoot
  $SupabaseWorkdir = Split-Path -Parent (Split-Path -Parent $webRoot)
}

$env:BASE_URL = $BaseUrl
$env:API_BASE_URL = $ApiBaseUrl
$env:SUPABASE_URL = $SupabaseUrl
$env:SUPABASE_PUBLISHABLE_KEY = Get-LocalSupabasePublishableKey -StatusFile $SupabaseStatusFile -Workdir $SupabaseWorkdir

node scripts/write-env.js
Write-Host "Wrote local web runtime environment to public/env.js."
