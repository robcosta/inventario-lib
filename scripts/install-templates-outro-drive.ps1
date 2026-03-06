param(
  [string]$LibraryId = "13LzSWJkOGp1hqkzU2IhEX2uUjN9vPwNCvJ1S3pGcKisBaOfvsCu8LH6n",
  [int]$LibraryVersion = 0,
  [switch]$DevelopmentMode,
  [string]$Prefix = ""
)

$ErrorActionPreference = "Stop"

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando obrigatorio nao encontrado: $Name"
  }
}

function Write-Step([string]$Text) {
  Write-Host "[installer] $Text" -ForegroundColor Cyan
}

function New-TemplateProject(
  [string]$TemplateName,
  [string]$TemplateFolder,
  [string]$Title
) {
  $repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
  $templatesRoot = Join-Path $repoRoot "templates"
  $sourceFolder = Join-Path $templatesRoot $TemplateFolder
  $manifestTemplate = Join-Path $templatesRoot "appsscript_template.json"

  if (-not (Test-Path $sourceFolder)) {
    throw "Template nao encontrado: $sourceFolder"
  }
  if (-not (Test-Path $manifestTemplate)) {
    throw "Manifest template nao encontrado: $manifestTemplate"
  }

  $workRoot = Join-Path $env:TEMP ("inventario-installer-" + [DateTime]::Now.ToString("yyyyMMdd-HHmmss"))
  $workDir = Join-Path $workRoot $TemplateName
  New-Item -ItemType Directory -Path $workDir -Force | Out-Null

  # Copia apenas scripts de template.
  Get-ChildItem -Path $sourceFolder -Filter *.gs | ForEach-Object {
    Copy-Item $_.FullName -Destination $workDir -Force
  }

  # Gera appsscript.json do template com configuracao da library.
  $manifest = Get-Content -Path $manifestTemplate -Raw | ConvertFrom-Json
  if (-not $manifest.dependencies) {
    $manifest | Add-Member -MemberType NoteProperty -Name dependencies -Value (@{})
  }
  if (-not $manifest.dependencies.libraries -or $manifest.dependencies.libraries.Count -eq 0) {
    throw "Manifest template sem bloco dependencies.libraries"
  }

  $manifest.dependencies.libraries[0].libraryId = $LibraryId
  $manifest.dependencies.libraries[0].version = $LibraryVersion
  $manifest.dependencies.libraries[0].developmentMode = [bool]$DevelopmentMode

  $manifestPath = Join-Path $workDir "appsscript.json"
  ($manifest | ConvertTo-Json -Depth 20) | Set-Content -Path $manifestPath -Encoding UTF8

  Write-Step "Criando projeto Apps Script para $TemplateName ($Title)"
  Push-Location $workDir
  try {
    clasp create --type sheets --title $Title | Out-Host
    clasp push | Out-Host

    $claspConfig = Join-Path $workDir ".clasp.json"
    if (-not (Test-Path $claspConfig)) {
      throw "Falha ao localizar .clasp.json em $workDir"
    }

    $config = Get-Content -Path $claspConfig -Raw | ConvertFrom-Json
    return [PSCustomObject]@{
      Template = $TemplateName
      Title = $Title
      ScriptId = $config.scriptId
      WorkDir = $workDir
    }
  }
  finally {
    Pop-Location
  }
}

Assert-Command "clasp"

Write-Step "Iniciando instalacao de templates em outro Drive (via Apps Script)"
Write-Step "LibraryId: $LibraryId"
Write-Step "LibraryVersion: $LibraryVersion"
Write-Step "DevelopmentMode: $([bool]$DevelopmentMode)"

$adminTitle = if ([string]::IsNullOrWhiteSpace($Prefix)) { "ADMIN: TEMPLATE" } else { "$Prefix ADMIN: TEMPLATE" }
$clientTitle = if ([string]::IsNullOrWhiteSpace($Prefix)) { "CLIENTE: TEMPLATE" } else { "$Prefix CLIENTE: TEMPLATE" }
$reportTitle = if ([string]::IsNullOrWhiteSpace($Prefix)) { "RELATORIO: TEMPLATE" } else { "$Prefix RELATORIO: TEMPLATE" }

$results = @()
$results += New-TemplateProject -TemplateName "admin" -TemplateFolder "admin" -Title $adminTitle
$results += New-TemplateProject -TemplateName "cliente" -TemplateFolder "cliente" -Title $clientTitle
$results += New-TemplateProject -TemplateName "relatorio" -TemplateFolder "relatorio" -Title $reportTitle

Write-Host ""
Write-Host "Instalacao concluida." -ForegroundColor Green
$results | Format-Table Template, Title, ScriptId -AutoSize

Write-Host ""
Write-Host "Observacao: os arquivos planilha criados podem ser movidos manualmente para o Drive/pasta desejada." -ForegroundColor Yellow
