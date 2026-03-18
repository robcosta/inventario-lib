# 📘 MANUAL DO ADMINISTRADOR  
*(Planilha do Inventário Patrimonial - ADMIN)*

---

## 🎯 Objetivo

A planilha **ADMIN** é o **centro de comando do contexto de inventário**.

Por meio dela, você controla:

- Estrutura do contexto (**ADMIN, CLIENTE e RELATÓRIO**)
- Importação e preparação das planilhas
- Gerenciamento de acessos por perfil
- Processamento de imagens com integração ao **VISION**
- Monitoramento por logs e relatórios

---

## 📌 Menu Principal

Ao abrir a planilha ADMIN, utilize o menu:

🏛️ **Inventário - Administração**

> ⚠️ Todas as rotinas oficiais devem ser executadas pelo menu.  
> Evite procedimentos manuais fora dele.

---

## 🧭 Fluxo Recomendado (Ordem de Execução)

1. Criar ou selecionar o contexto correto  
2. Importar os CSV's da **GERAL** e da **ADMIN**  
3. Formatar as planilhas (**ADMIN e GERAL**)  
4. Definir ou validar a pasta ativa de fotos  
5. Executar **Processar Imagem**  
6. Validar resultados no controle e relatórios  
7. Utilizar o diagnóstico em caso de inconsistências  

---

## 🧩 Menu Detalhado

### 🔷 Seleção e Contexto

#### 🔁 Selecionar Contexto  
Altera o contexto ativo da planilha ADMIN.  
Utilize ao alternar entre unidades ou localidades.

#### ➕ Criar Novo Contexto  
Cria toda a estrutura inicial (planilhas, pastas e metadados).  
Use apenas na criação de um novo ambiente.

#### 🔧 Reparar Contexto  
Reconstrói referências internas quando houver inconsistências, movimentações ou corrupção de estrutura.

---

### 🔷 🔐 Gerenciar Acessos

#### 👑 Supervisor  
Permissão ampla de acompanhamento e governança.

#### 🛡️ Administrador  
Permissão de gestão operacional completa.

#### 🧰 Operador  
Permissão para execução das rotinas diárias.

#### 👥 Cliente  
Acesso restrito à interface CLIENTE (sem funções administrativas).

#### 🗑️ Retirar Acessos  
Remove permissões concedidas por e-mail.

---

### 🔷 📂 Área de Fotos

#### 📂 Abrir Pasta Atual  
Abre no Google Drive a pasta vinculada ao contexto ativo.

#### 🔁 Trocar Pasta  
Define uma nova pasta de trabalho (mudança de localidade/unidade).

#### ➕ Criar Nova Pasta  
Cria uma nova pasta dentro da estrutura oficial.

---

### 🔷 🖼️ Processar Imagem (VISION)

Executa o processamento completo da pasta ativa:

1. Valida contexto, planilhas e pasta  
2. Aciona o motor **VISION**  
3. Identifica o bem (nome do arquivo e OCR)  
4. Busca o item nas planilhas ADMIN/GERAL  
5. Renomeia o arquivo conforme regra  
6. Destaca registros nas planilhas  
7. Registra logs na aba de controle  

📊 Ao final, o sistema apresenta: total processado, sucessos e erros.

---

### 🔷 📘 Planilha GERAL

#### 📂 Abrir Planilha  
Abre a planilha GERAL do contexto.

#### 📤 Importar CSV  
Importa dados da base geral.

#### 🎨 Formatar  
Padroniza estrutura e layout para funcionamento do sistema.

#### 🧱 Criar / Recriar  
Reconstrói a planilha GERAL.  
> ⚠️ Operação sensível.

---

### 🔷 📕 Planilha ADMIN

#### 📤 Importar CSV  
Importa os dados administrativos.

#### 📊 Popular  
Distribui os dados nas abas internas.

#### 🎨 Formatar  
Aplica estrutura necessária para processamento.

---

### 🔷 📗 Planilha CLIENTE

#### 📂 Abrir Planilha  
Abre a planilha CLIENTE.

#### 🎨 Formatar  
Padroniza layout e interface.

---

### 🔷 📙 Planilha RELATÓRIO

#### 📂 Abrir Planilha  
Abre a planilha de relatórios.

#### 📈 Visão Geral  
Relatório consolidado do inventário.

#### 📌 Bens Pendentes  
Itens ainda não processados.

#### ✅ Bens Encontrados  
Itens identificados com sucesso.

#### 📍 Bens de Outra Localidade  
Itens fora da unidade esperada.

#### 🏷️ Bens para Nova Etiqueta  
Itens elegíveis para ser etiquetado novamente.

---

### 🔷 🧪 Diagnóstico

#### 📊 Executar Diagnóstico  
Verifica integridade do contexto e possíveis falhas.

#### 🚚 Instalar Modelos em Outro Drive  
Replica estrutura em outro ambiente.

#### 🧪 Testar Planilha GERAL  
Valida estrutura técnica da planilha.

---

### 🔷 ⚙️ Trabalho da Fila

#### ▶️ Processar Fila Agora  
Executa imediatamente os itens pendentes.

#### ⏱️ Instalar Trigger  
Automatiza execução periódica.

#### 🧹 Remover Trigger  
Remove automação.

---

### 🔷 ℹ️ Versão

Exibe a versão do sistema instalada.

---

## 🤖 Status do Processamento (VISION)

### ✅ PROCESSADO  
Item identificado e tratado corretamente.

### ⚠️ INTERVENÇÃO_MANUAL  
Não foi possível identificar o bem.

### 🚫 SEM_PATRIMÔNIO  
Item não patrimoniado.

### ❓ NÃO_LOCALIZADO  
Identificador encontrado, mas não localizado na base.

### 🔴 ERRO_TÉCNICO  
Falha no processamento (API, acesso ou execução).

---

## 🚫 Boas Práticas (Evitar)

- Não editar abas técnicas manualmente  
- Não renomear abas do sistema  
- Não mover arquivos fora da estrutura  
- Não conceder acessos manualmente  
- Não usar `SEM` sem validação  
- Não processar antes de preparar ADMIN e GERAL  

---

## ✅ Resumo

- Use sempre o menu ADMIN  
- Prepare o ambiente antes de processar  
- Utilize padrões corretos de identificação  
- Use `SN` e `SEM` corretamente  
- Execute diagnóstico em caso de erro  


---

## 🏷️ Processamento de Imagens (Regras Detalhadas)

O processamento de imagens segue um fluxo inteligente de identificação e tratamento automático:

### 🔄 Etapas do Processo

1. O sistema analisa inicialmente o **nome do arquivo** em busca de um identificador.  
2. Caso necessário, complementa a análise utilizando **OCR (leitura da imagem)**.  
3. Identificado algum elemento, realiza a busca nas planilhas **ADMIN** e **GERAL**.  
4. Quando localizado, o sistema:
   - destaca a(s) linha(s) correspondente(s)
   - renomeia o arquivo conforme regra de negócio  

---

### 🧾 Regras de Renomeação

| Situação | Nome do Arquivo |
|--------|----------------|
| Encontrado na ADMIN | `Descrição + Tombamento.jpeg` |
| Encontrado apenas na GERAL | `Tombamento + Descrição.jpeg` |
| Não localizado | `NAO LOCALIZADA + número.jpeg` |
| Sem identificação | `INTERVENCAO MANUAL + número.jpeg` |
| Sem patrimônio (manual) | `SEM PATRIMÔNIO + número.jpeg` |

---

### ⚠️ Cenários Especiais

#### 🔍 Identificador encontrado, mas não localizado  
- Não há destaque em planilhas  
- Arquivo renomeado para:  
``` 
NAO LOCALIZADA + número.jpeg
```

#### ⚠️ Nenhum identificador encontrado  
- Arquivo renomeado para:  
```
INTERVENCAO MANUAL + número.jpeg
```

#### 🛠️ Intervenção Manual  
O operador deve:

1. Abrir a imagem  
2. Identificar visualmente algum dado válido  
3. Renomear o arquivo corretamente  
4. Reprocessar  

#### 🚫 Caso não seja possível identificar  
Renomear para:
```
SEM.jpg
```

O sistema irá converter automaticamente para:
```
SEM PATRIMÔNIO + número.jpeg
```

---

### ✅ Regra Final Obrigatória

Ao final do processamento, **somente estes padrões devem existir**:

- `Descrição + Tombamento.jpeg`  
- `Tombamento + Descrição.jpeg`  
- `NAO LOCALIZADA + número.jpeg`  
- `SEM PATRIMÔNIO + número.jpeg`  

❌ Não deve existir:
```
INTERVENCAO MANUAL + número.jpeg
```

---

### 🔁 Exemplos de Renomeação para Reprocessamento

- `2016045290.jpg` → busca por tombamento  
- `123.456.jpg` → convertido para patrimônio antigo  
- `ABC1D23.jpg` → padrão de placa  
- `SN XPTO12345.jpg` → número de série  
- `SEM.jpg` → item não patrimoniado  

