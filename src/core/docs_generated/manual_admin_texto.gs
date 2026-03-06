
/**
 * ⚠️ ARQUIVO GERADO AUTOMATICAMENTE
 */
const MANUAL_ADMIN_MD = `
# 📘 MANUAL DO ADMINISTRADOR
(Planilha do Inventario Patrimonial - ADMIN)

## 🎯 Objetivo

Esta planilha ADMIN e o ponto central de configuracao e operacao do inventario.

Nela voce consegue:

- criar e selecionar contexto de trabalho
- importar e formatar planilhas
- gerenciar acessos
- executar diagnosticos
- acompanhar relatorios

---

## 📌 Menu principal

Ao abrir a planilha, utilize o menu:

📦 **Inventario Patrimonial**

Todas as operacoes devem ser feitas por esse menu.

---

## 🧭 Fluxo recomendado de uso

1. Criar ou selecionar o contexto correto.
2. Importar CSVs da ADMIN e da GERAL.
3. Formatar planilhas quando necessario.
4. Gerenciar acessos dos perfis.
5. Validar diagnostico em caso de inconsistencias.

---

## 🔷 Contexto

### Criar Contexto de Trabalho

Cria a estrutura completa do contexto (ADMIN, CLIENTE e RELATORIO).

### Selecionar Contexto de Trabalho

Permite abrir e operar outro contexto existente.

### Reparar Contexto ADMIN

Reconstrui dados do contexto quando houver divergencia estrutural.

---

## 🔷 Acessos

### Gerenciar Acessos

Perfis suportados:

- Supervisor
- Administrador
- Operador
- Admin
- Cliente

### Retirar Acessos

Permite remover compartilhamentos por email.

---

## 🔷 Planilha GERAL

### Importar CSV GERAL

Importa arquivos globais da pasta de CSV da GERAL.

### Formatar Planilha GERAL

Aplica padrao visual e estrutural.

### Criar ou Recriar Planilha GERAL

Operacao potencialmente destrutiva. Recria a planilha a partir dos CSVs.

---

## 🔷 Planilha ADMIN

### Importar CSV ADMIN

Importa arquivos de contexto para abas da ADMIN.

### Popular Planilha ADMIN

Atualiza abas conforme arquivos de contexto.

### Formatar Planilha ADMIN

Padroniza estrutura, cabecalhos e layout.

---

## 🔷 Relatorios e apoio

- Abrir Planilha CLIENTE
- Abrir Planilha RELATORIO
- Gerar Visao Geral
- Executar Diagnostico

---

## 🚫 O que nao fazer

- Nao editar abas tecnicas manualmente.
- Nao mover arquivos para fora da estrutura oficial.
- Nao renomear abas de controle.
- Nao aplicar compartilhamento manual fora do fluxo de acessos.

---

## ✅ Resumo rapido

- Sempre use o menu ADMIN.
- Contexto correto vem antes de qualquer importacao.
- Em erro, rode diagnostico antes de tentar corrigir manualmente.

`;

function obterTexto_manual_admin() {
  return MANUAL_ADMIN_MD;
}
