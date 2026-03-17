<#
COMO EXECUTAR:
.\scripts\renomear-imagens.ps1 -Pasta "C:\caminho\das\imagens"

SIMULACAO (sem renomear arquivos):
.\scripts\renomear-imagens.ps1 -Pasta "C:\caminho\das\imagens" -WhatIf
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $false)]
    [string]$Pasta,

    [Parameter(Mandatory = $false)]
    [string]$Prefixo = "imagem_20260317_",

    [Parameter(Mandatory = $false)]
    [int]$Digitos = 3
)

if ([string]::IsNullOrWhiteSpace($Pasta)) {
    $Pasta = Read-Host "Informe o caminho da pasta com as imagens"
}

if (-not (Test-Path -LiteralPath $Pasta -PathType Container)) {
    Write-Error "A pasta informada nao existe: $Pasta"
    exit 1
}

$extensoesPermitidas = @(
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tif", ".tiff"
)

$arquivos = Get-ChildItem -LiteralPath $Pasta -File |
    Where-Object { $extensoesPermitidas -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object Name

if (-not $arquivos) {
    Write-Host "Nenhuma imagem encontrada na pasta: $Pasta"
    exit 0
}

$contador = 1
$resultado = @()

foreach ($arquivo in $arquivos) {
    do {
        $indiceFormatado = $contador.ToString("D$Digitos")
        $novoNome = "{0}{1}{2}" -f $Prefixo, $indiceFormatado, $arquivo.Extension.ToLowerInvariant()
        $novoCaminho = Join-Path -Path $arquivo.DirectoryName -ChildPath $novoNome
        $contador++
    } while ((Test-Path -LiteralPath $novoCaminho) -and ($arquivo.FullName -ne $novoCaminho))

    if ($arquivo.FullName -eq $novoCaminho) {
        $resultado += [PSCustomObject]@{
            Original = $arquivo.Name
            Novo     = $novoNome
            Status   = "Sem alteracao"
        }
        continue
    }

    if ($PSCmdlet.ShouldProcess($arquivo.FullName, "Renomear para $novoNome")) {
        Rename-Item -LiteralPath $arquivo.FullName -NewName $novoNome -ErrorAction Stop
    }

    $resultado += [PSCustomObject]@{
        Original = $arquivo.Name
        Novo     = $novoNome
        Status   = "Renomeado"
    }
}

$resultado | Format-Table -AutoSize
Write-Host ""
Write-Host ("Total de imagens processadas: {0}" -f $resultado.Count)
