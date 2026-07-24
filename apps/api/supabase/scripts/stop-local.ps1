[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$supabaseRoot = Split-Path -Parent $PSScriptRoot
$apiRoot = Split-Path -Parent $supabaseRoot
$composeFile = Join-Path -Path $apiRoot -ChildPath "docker-compose.yml"
$containerEnvFile = Join-Path -Path $apiRoot -ChildPath ".env.local.container"
$previousAppEnvFile = [Environment]::GetEnvironmentVariable("APP_ENV_FILE", "Process")

function Get-RequiredCommand {
  param(
    [Parameter(Mandatory)]
    [string]$Name,
    [Parameter(Mandatory)]
    [string]$InstallHint
  )

  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $command) {
    throw "$Name was not found. $InstallHint"
  }

  return $command.Source
}

function Invoke-CheckedCommand {
  param(
    [Parameter(Mandatory)]
    [string]$Command,
    [Parameter(Mandatory)]
    [string[]]$Arguments,
    [Parameter(Mandatory)]
    [string]$FailureMessage
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw $FailureMessage
  }
}

try {
  $docker = Get-RequiredCommand `
    -Name "docker" `
    -InstallHint "Install Docker Desktop before managing the local API."
  $supabase = Get-RequiredCommand `
    -Name "supabase" `
    -InstallHint "Install the Supabase CLI before managing the local stack."

  if ($null -eq $previousAppEnvFile -and -not (Test-Path -LiteralPath $containerEnvFile)) {
    [Environment]::SetEnvironmentVariable("APP_ENV_FILE", ".env.template", "Process")
  }

  Write-Host "Stopping the RedSun API Compose project..."
  Invoke-CheckedCommand `
    -Command $docker `
    -Arguments @("compose", "--project-directory", $apiRoot, "--file", $composeFile, "down") `
    -FailureMessage "Docker Compose could not stop the RedSun API project."

  Write-Host "Stopping the local Supabase stack while preserving local data..."
  Invoke-CheckedCommand `
    -Command $supabase `
    -Arguments @("stop", "--workdir", $apiRoot) `
    -FailureMessage "Supabase could not stop the local stack."

  Write-Host "Local services stopped. Supabase volumes and local data were preserved."
}
finally {
  if ($null -ne $previousAppEnvFile) {
    [Environment]::SetEnvironmentVariable("APP_ENV_FILE", $previousAppEnvFile, "Process")
  } else {
    [Environment]::SetEnvironmentVariable("APP_ENV_FILE", $null, "Process")
  }
}
