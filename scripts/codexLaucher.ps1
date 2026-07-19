[CmdletBinding()]
param(
  [ValidateSet("all", "web", "api", "repo")]
  [string]$App = "repo",
  [string[]]$Core = @("methodical"),
  [string[]]$Project,
  [string[]]$Stack,
  [string[]]$Skill,
  [string]$Model,
  [ValidateSet("none", "low", "medium", "high", "xhigh")]
  [string]$ReasoningEffort,
  [ValidateSet("Frontier", "Balanced", "Mini")]
  [string]$ModelPreset,
  [Alias("NoExec")]
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$layersRoot = Join-Path $repoRoot ".agents"

if (-not [string]::IsNullOrWhiteSpace($Model) -and -not [string]::IsNullOrWhiteSpace($ModelPreset)) {
  throw "Use either -Model or -ModelPreset, not both."
}

function Resolve-LayerFiles {
  param(
    [string]$Folder,
    [string[]]$Names
  )

  $resolved = @()
  $folderPath = Join-Path $layersRoot $Folder

  foreach ($name in $Names) {
    if ([string]::IsNullOrWhiteSpace($name)) {
      continue
    }

    $filename = if ($name.EndsWith(".md")) { $name } else { "$name.md" }
    $path = Join-Path $folderPath $filename

    if (-not (Test-Path $path)) {
      throw "Layer file not found: $path"
    }

    $resolved += (Resolve-Path $path).Path
  }

  return $resolved
}

function Resolve-SkillFiles {
  param(
    [string[]]$Names
  )

  $resolved = @()
  $skillsRoot = Join-Path $layersRoot "skills"

  foreach ($name in $Names) {
    if ([string]::IsNullOrWhiteSpace($name)) {
      continue
    }

    $normalizedName = $name.Replace("/", "\")
    $filename = if ($normalizedName.EndsWith(".md")) { $normalizedName } else { "$normalizedName.md" }
    $directPath = Join-Path $skillsRoot $filename

    if (Test-Path $directPath) {
      $resolved += (Resolve-Path $directPath).Path
      continue
    }

    $leafName = Split-Path $filename -Leaf
    $matches = @(Get-ChildItem -Path $skillsRoot -Recurse -File -Filter $leafName -ErrorAction SilentlyContinue)

    if ($matches.Count -eq 0) {
      throw "Layer file not found: $directPath"
    }

    if ($matches.Count -gt 1) {
      $matchList = ($matches | ForEach-Object { $_.FullName }) -join ", "
      throw "Skill layer name is ambiguous: $name. Matches: $matchList"
    }

    $resolved += $matches[0].FullName
  }

  return $resolved
}

function Get-DefaultProjects {
  switch ($App) {
    "web" { return @("redsun-web") }
    "api" { return @("redsun-api", "domain-map") }
    "repo" { return @() }
    default { return @("redsun-web", "redsun-api", "domain-map") }
  }
}

function Get-DefaultStacks {
  switch ($App) {
    "web" { return @("angular") }
    "api" { return @("spring-boot", "persistence-storage") }
    "repo" { return @() }
    default { return @("angular", "spring-boot", "persistence-storage") }
  }
}

$selectedSkillLayers = @($Skill | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
$selectedCoreLayers = @($Core | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
$selectedProjectLayers = if ($PSBoundParameters.ContainsKey("Project")) {
  @($Project | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
} else {
  Get-DefaultProjects
}
$selectedStackLayers = if ($PSBoundParameters.ContainsKey("Stack")) {
  @($Stack | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
} else {
  Get-DefaultStacks
}

$layerFiles = @()

if ($selectedSkillLayers.Count -gt 0) {
  $layerFiles += Resolve-SkillFiles -Names $selectedSkillLayers
}

if ($selectedCoreLayers.Count -gt 0) {
  $layerFiles += Resolve-LayerFiles -Folder "core" -Names $selectedCoreLayers
}

if ($selectedProjectLayers.Count -gt 0) {
  $layerFiles += Resolve-LayerFiles -Folder "projects" -Names $selectedProjectLayers
}

if ($selectedStackLayers.Count -gt 0) {
  $layerFiles += Resolve-LayerFiles -Folder "stacks" -Names $selectedStackLayers
}

$relativeFiles = $layerFiles | ForEach-Object {
  $_.Substring($repoRoot.Length + 1).Replace("\", "/")
}

$layerSections = foreach ($path in $layerFiles) {
  $relativePath = $path.Substring($repoRoot.Length + 1).Replace("\", "/")
  $content = Get-Content $path -Raw

@"
## Active Layer: $relativePath

$content
"@
}

$activeFilesList = if ($relativeFiles.Count -gt 0) {
  ($relativeFiles | ForEach-Object { "- $_" }) -join "`n"
} else {
  "- none"
}

$sessionPrompt = @"
Session setup for this repository.

Use the following instruction layers for the entire session.
If instructions conflict, apply this precedence:
1. Explicit task and user instructions.
2. Skill-specific layer files.
3. Core layer files.
4. Project-specific layer files.
5. Stack-specific layer files.

Active app selection: $App

Active layers:
$activeFilesList

$($layerSections -join "`n")

There is no implementation task yet.
Acknowledge the active layers briefly, then wait for the next user request.
"@

$codexArgs = @(
  "-C", $repoRoot,
  "--sandbox", "workspace-write",
  "--ask-for-approval", "never",
  "--enable", "experimental_windows_sandbox",
  "--search"
)

$presetModels = @{
  Frontier = "gpt-5.6-sol"
  Balanced = "gpt-5.4"
  Mini     = "gpt-5.4-mini"
}

$resolvedModel = if (-not [string]::IsNullOrWhiteSpace($Model)) {
  $Model
} elseif (-not [string]::IsNullOrWhiteSpace($ModelPreset)) {
  $presetModels[$ModelPreset]
} else {
  "gpt-5.6-sol"
}

if (-not [string]::IsNullOrWhiteSpace($resolvedModel)) {
  $codexArgs += @("--model", $resolvedModel)
}

if (-not [string]::IsNullOrWhiteSpace($ReasoningEffort)) {
  $codexArgs += @("-c", "model_reasoning_effort=`"$ReasoningEffort`"")
}

if ($layerFiles.Count -gt 0) {
  $codexArgs += $sessionPrompt
}

if ($DryRun) {
  Write-Host "Dry run: Codex was not started."
  Write-Host "App: $App"
  Write-Host "Active layers:"
  foreach ($relativeFile in $relativeFiles) {
    Write-Host "- $relativeFile"
  }
  return
}

& codex @codexArgs
