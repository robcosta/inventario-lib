/**
 * ============================================================
 * CSV — CORE COMPARTILHADO
 * ============================================================
 */

function salvarCSV_(nomeArquivo, dataUrl, pastaDestino) {

  if (!nomeArquivo || !nomeArquivo.toLowerCase().endsWith('.csv')) {
    throw new Error('Arquivo inválido. Apenas CSV.');
  }

  if (!dataUrl || !dataUrl.startsWith('data:')) {
    throw new Error('Conteúdo do arquivo inválido.');
  }
  
  if (!pastaDestino) {
    Logger.log('[CSV] ❌ ERRO: Pasta de destino não fornecida. Operação abortada.');
    try {
      SpreadsheetApp.getActive().toast(
        'Erro: Pasta de destino não fornecida. Operação abortada.',
        '❌ Erro ao salvar CSV',
        8
      );
    } catch (e) {}
    throw new Error('Pasta de destino não fornecida.');
  }

  // Log para debug
  Logger.log('[CSV] Salvando arquivo: ' + nomeArquivo);
  Logger.log('[CSV] Pasta destino ID: ' + pastaDestino.getId());
  Logger.log('[CSV] Pasta destino nome: ' + pastaDestino.getName());

  const base64 = dataUrl.split(',')[1];
  const bytes = Utilities.base64Decode(base64);

  const blob = Utilities.newBlob(
    bytes,
    'text/csv',
    nomeArquivo
  );

  const arquivo = pastaDestino.createFile(blob);
  
  Logger.log('[CSV] ✅ Arquivo criado com sucesso!');
  Logger.log('[CSV] Arquivo ID: ' + arquivo.getId());
  Logger.log('[CSV] URL: https://drive.google.com/file/d/' + arquivo.getId());
  
    // Registrar CSV no sistema global
    try {
      adicionarCSVGeralRegistro_({
        nome: nomeArquivo,
        id: arquivo.getId(),
        dataImportacao: new Date().toISOString(),
        linhas: 0, // Pode ser ajustado se necessário
        tamanho: blob.getBytes().length
      });
      Logger.log('[CSV] CSV registrado no sistema global.');
    } catch (e) {
      Logger.log('[CSV] Erro ao registrar CSV no sistema global: ' + e.message);
    }
  
  // Toast de confirmação
  SpreadsheetApp.getActive().toast(
    'CSV salvo em: ' + pastaDestino.getName() + '\n📄 ' + nomeArquivo,
    '✅ Importação Concluída',
    6
  );
}
