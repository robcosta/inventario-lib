<#
COMO RODAR - INVENTARIO
1) Abra PowerShell em C:\projects\inventario
2) Execute:
   .\scripts\gerar-inventario-consolidado.ps1

COM PARAMETROS (opcional):
.\scripts\gerar-inventario-consolidado.ps1 `
  -SourceRoot "C:\projects\inventario\src" `
  -OutputRoot "C:\projects\consolidados" `
  -OutputFileName "inventario_consolidado.gs"

Se a execucao de script estiver bloqueada:
powershell -ExecutionPolicy Bypass -File .\scripts\gerar-inventario-consolidado.ps1
#>

param(
  [string]$SourceRoot = "C:\projects\dev\inventario\src",
  [string]$OutputRoot = "C:\projects\consolidados",
  [string]$OutputFileName = "inventario_consolidado.gs"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Step([string]$Text) {
  Write-Host "[consolidado] $Text" -ForegroundColor Cyan
}

function New-InventarioConsolidado(
  [string]$SourceRootParam,
  [string]$OutputRootParam,
  [string]$OutputFileNameParam
) {
  if (-not (Test-Path -Path $SourceRootParam -PathType Container)) {
    throw "Pasta de origem nao encontrada: $SourceRootParam"
  }

  $sourceRootResolved = (Resolve-Path $SourceRootParam).Path.TrimEnd("\")

  Write-Step "Lendo arquivos em: $sourceRootResolved"
  $files = @(
    Get-ChildItem -Path $sourceRootResolved -Recurse -File |
      Sort-Object FullName
  )

  if ($files.Count -eq 0) {
    throw "Nenhum arquivo encontrado em: $sourceRootResolved"
  }

  $gsFiles = @($files | Where-Object { $_.Extension -eq '.gs' })
  $nonGsFiles = @($files | Where-Object { $_.Extension -ne '.gs' })

  if ($gsFiles.Count -eq 0) {
    throw "Nenhum arquivo .gs encontrado em: $sourceRootResolved"
  }

  New-Item -ItemType Directory -Path $OutputRootParam -Force | Out-Null
  $outputFile = Join-Path $OutputRootParam $OutputFileNameParam

  $linhas = New-Object System.Collections.Generic.List[string]
  $linhas.Add("/**")
  $linhas.Add(" * INVENTARIO CONSOLIDADO")
  $linhas.Add(" * Gerado em: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))")
  $linhas.Add(" * Origem: $sourceRootResolved")
  $linhas.Add(" * Total de arquivos .gs: $($gsFiles.Count)")
  $linhas.Add(" */")
  $linhas.Add("")

  foreach ($file in $gsFiles) {
    $relativePath = $file.FullName.Substring($sourceRootResolved.Length).TrimStart("\")
    $conteudo = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $conteudo = $conteudo.TrimEnd("`r", "`n")

    $linhas.Add("/** >>> BEGIN FILE: $relativePath >>> */")
    if (-not [string]::IsNullOrEmpty($conteudo)) {
      $linhas.Add($conteudo)
    }
    $linhas.Add("/** <<< END FILE: $relativePath <<< */")
    $linhas.Add("")
  }

  $conteudoFinal = [string]::Join("`r`n", $linhas)
  $utf8SemBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($outputFile, $conteudoFinal, $utf8SemBom)

  Write-Step "Exportando arquivos nao-.gs em separado"
  $exportedNonGsCount = 0
  $pastaCsvCore = (Join-Path $sourceRootResolved 'core\compartilhado\csv').TrimEnd('\')

  foreach ($file in $nonGsFiles) {
    if ($file.FullName.StartsWith($pastaCsvCore, [System.StringComparison]::OrdinalIgnoreCase)) {
      continue
    }

    $relativePath = $file.FullName.Substring($sourceRootResolved.Length).TrimStart("\")
    $destinationFile = Join-Path $OutputRootParam $relativePath
    $destinationDir = Split-Path -Path $destinationFile -Parent

    if (-not (Test-Path -Path $destinationDir -PathType Container)) {
      New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }

    Copy-Item -Path $file.FullName -Destination $destinationFile -Force
    $exportedNonGsCount++
  }

  # csv_upload.html deve ficar na raiz de consolidacao.
  $csvUploadSource = Join-Path $sourceRootResolved 'core\compartilhado\csv\csv_upload.html'
  if (Test-Path -Path $csvUploadSource -PathType Leaf) {
    Copy-Item -Path $csvUploadSource -Destination (Join-Path $OutputRootParam 'csv_upload.html') -Force
    $exportedNonGsCount++
  }

  return [PSCustomObject]@{
    SourceRoot = $sourceRootResolved
    OutputRoot = (Resolve-Path $OutputRootParam).Path
    OutputFile = $outputFile
    TotalFileCount = $files.Count
    GsFileCount = $gsFiles.Count
    NonGsFileCount = $exportedNonGsCount
  }
}

Write-Step "Iniciando consolidacao"
$resultado = New-InventarioConsolidado `
  -SourceRootParam $SourceRoot `
  -OutputRootParam $OutputRoot `
  -OutputFileNameParam $OutputFileName

Write-Step "Concluido"
Write-Host "Arquivo gerado: $($resultado.OutputFile)" -ForegroundColor Green
Write-Host "Arquivos .gs consolidados: $($resultado.GsFileCount)" -ForegroundColor Green
Write-Host "Arquivos nao-.gs exportados: $($resultado.NonGsFileCount)" -ForegroundColor Green
Write-Host "Arquivos totais processados: $($resultado.TotalFileCount)" -ForegroundColor Green
