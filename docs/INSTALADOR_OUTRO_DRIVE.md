# Instalador - Outro Drive

Este instalador cria os templates do sistema diretamente no Google Apps Script,
evita o problema de copiar arquivos no Drive e obter apenas `.json`.

## Pre-requisitos

- Node.js instalado
- `clasp` instalado e autenticado
- Acesso a biblioteca `inventario` (libraryId)

Comandos uteis:

```bash
npm i -g @google/clasp
clasp login
```

## Script de instalacao

Arquivo:

`\`scripts/install-templates-outro-drive.ps1\``

Ele cria 3 projetos `type=sheets` e faz `clasp push` para cada um:

- ADMIN: TEMPLATE
- CLIENTE: TEMPLATE
- RELATORIO: TEMPLATE

## Uso basico (PowerShell)

```powershell
pwsh -File scripts/install-templates-outro-drive.ps1
```

## Uso com parametros

```powershell
pwsh -File scripts/install-templates-outro-drive.ps1 `
  -LibraryId "13LzSWJkOGp1hqkzU2IhEX2uUjN9vPwNCvJ1S3pGcKisBaOfvsCu8LH6n" `
  -LibraryVersion 0 `
  -DevelopmentMode `
  -Prefix "INSTALACAO1"
```

### Parametros

- `LibraryId`: ID da library `inventario` consumida pelos templates
- `LibraryVersion`: versao da library
- `DevelopmentMode`: usa modo desenvolvimento da library
- `Prefix`: prefixo no titulo dos arquivos criados

## Resultado

Ao final, o script exibe os `scriptId` gerados.

Observacao:

- O Google cria as planilhas no Drive do usuario autenticado.
- Depois, voce pode mover os arquivos manualmente para outra pasta/Drive compartilhado.

## Por que este fluxo funciona

Copiar arquivo de projeto Apps Script no Drive nao replica corretamente os `.gs` em todos os cenarios.
Com `clasp create + clasp push`, o codigo fonte completo e publicado no projeto destino.
