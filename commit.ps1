# Facilita commits seguindo padrão Conventional Commits
# Uso: .\commit.ps1 tipo escopo "mensagem"
# Exemplo: .\commit.ps1 feat admin "adicionar menu de contextos"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('feat','fix','refactor','docs','style','test','chore','perf','ci','build','revert')]
    [string]$Tipo,
    
    [Parameter(Mandatory=$false)]
    [string]$Escopo,
    
    [Parameter(Mandatory=$true)]
    [string]$Mensagem,
    
    [Parameter(Mandatory=$false)]
    [string]$Descricao
)

# Montar mensagem do commit
$commitMsg = "$Tipo"
if ($Escopo) {
    $commitMsg += "($Escopo)"
}
$commitMsg += ": $Mensagem"

# Adicionar descrição se fornecida
if ($Descricao) {
    $commitMsg += "`n`n$Descricao"
}

Write-Host "📝 Commit: " -ForegroundColor Cyan
Write-Host $commitMsg -ForegroundColor Yellow
Write-Host ""

# Perguntar confirmação
$confirma = Read-Host "Confirmar commit? (s/N)"
if ($confirma -eq 's' -or $confirma -eq 'S') {
    git add -A
    git commit -m $commitMsg
    
    Write-Host "✅ Commit realizado!" -ForegroundColor Green
    
    # Perguntar se quer fazer push
    $push = Read-Host "`nFazer push? (s/N)"
    if ($push -eq 's' -or $push -eq 'S') {
        $branch = git branch --show-current
        git push origin $branch
        Write-Host "✅ Push realizado para $branch!" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Commit cancelado" -ForegroundColor Red
}
