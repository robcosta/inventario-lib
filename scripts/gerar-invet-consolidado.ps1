param(
  [string]$SourceRoot = "C:\projects\inventario\src",
  [string]$OutputRoot = "C:\projects\invet_consolidado",
  [string]$OutputFileName = "invent_consolidado.gs"
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

  Write-Step "Lendo arquivos .gs em: $sourceRootResolved"
  $files = Get-ChildItem -Path $sourceRootResolved -Recurse -File -Filter "*.gs" |
    Sort-Object FullName

  if (-not $files -or $files.Count -eq 0) {
    throw "Nenhum arquivo .gs encontrado em: $sourceRootResolved"
  }

  New-Item -ItemType Directory -Path $OutputRootParam -Force | Out-Null
  $outputFile = Join-Path $OutputRootParam $OutputFileNameParam

  $linhas = New-Object System.Collections.Generic.List[string]
  $linhas.Add("/**")
  $linhas.Add(" * INVENTARIO CONSOLIDADO")
  $linhas.Add(" * Gerado em: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))")
  $linhas.Add(" * Origem: $sourceRootResolved")
  $linhas.Add(" * Total de arquivos .gs: $($files.Count)")
  $linhas.Add(" */")
  $linhas.Add("")

  foreach ($file in $files) {
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

  return [PSCustomObject]@{
    SourceRoot = $sourceRootResolved
    OutputRoot = (Resolve-Path $OutputRootParam).Path
    OutputFile = $outputFile
    FileCount = $files.Count
  }
}

Write-Step "Iniciando consolidacao"
$resultado = New-InventarioConsolidado `
  -SourceRootParam $SourceRoot `
  -OutputRootParam $OutputRoot `
  -OutputFileNameParam $OutputFileName

Write-Step "Concluido"
Write-Host "Arquivo gerado: $($resultado.OutputFile)" -ForegroundColor Green
Write-Host "Arquivos consolidados: $($resultado.FileCount)" -ForegroundColor Green
