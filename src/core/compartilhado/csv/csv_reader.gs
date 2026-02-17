/**
 * ============================================================
 * CSV — LEITURA
 * ============================================================
 */

function lerCSV_(file) {
  const content = file.getBlob().getDataAsString('UTF-8');
  return Utilities.parseCsv(content);
}

function nomeAbaPorCSV_(nomeArquivo) {
  return nomeArquivo.replace(/\.csv$/i, '').substring(0, 99);
}

/**
 * Edita o CSV para adicionar "Localização" entre "Situação" e "Termo"
 * @param {File} file - Arquivo CSV
 * @returns {Array<Array>} Dados do CSV modificados
 */
function lerCSVComEdicao_(file) {
  let content = file.getBlob().getDataAsString('UTF-8');
  
  // Padrão mais flexível que permite variações de espaços
  // Busca: Tombamento,...Situação,Termo,...
  // Substitui por: Tombamento,...Situação,Localização,Termo,...
  
  const padrao = /Tombamento,Denominação,,Aquisição,Marca\/\s*Editora,,Situação,Termo,/g;
  const substitui = 'Tombamento,Denominação,,Aquisição,Marca/ Editora,,Situação,Localização,Termo,';
  
  content = content.replace(padrao, substitui);
  
  return Utilities.parseCsv(content);
}
