/**
 * ============================================================
 * TESTES — SELECIONAR CONTEXTO
 * ============================================================
 * Testes automatizados (unitários) para a lógica de seleção
 */

function runTestsSelecionarContexto_() {
  const resultados = [];

  resultados.push(test_montarMensagem_semContextos_());
  resultados.push(test_montarMensagem_apenasAtual_());
  resultados.push(test_montarMensagem_listaOutros_());
  resultados.push(test_obterIndiceEmoji_());

  const falhas = resultados.filter(r => !r.ok);
  const resumo =
    'TESTES — Selecionar Contexto\n' +
    'Total: ' + resultados.length + '\n' +
    '✅ Passou: ' + (resultados.length - falhas.length) + '\n' +
    '❌ Falhou: ' + falhas.length + '\n\n' +
    (falhas.length ? 'Falhas:\n' + falhas.map(f => '- ' + f.nome + ': ' + f.erro).join('\n') : 'Tudo certo!');

  Logger.log(resumo);
}

function test_montarMensagem_semContextos_() {
  return assertEquals_(
    'montarMensagem: sem contextos',
    'sem_contextos',
    montarMensagemSelecaoContexto_({}, []).erro
  );
}

function test_montarMensagem_apenasAtual_() {
  const contextoAtual = { id: 'A1', nome: 'TESTE - DEV' };
  const contextos = [
    { nome: 'TESTE - DEV', planilhaOperacionalId: 'A1' }
  ];

  return assertEquals_(
    'montarMensagem: apenas atual',
    'apenas_atual',
    montarMensagemSelecaoContexto_(contextoAtual, contextos).erro
  );
}

function test_montarMensagem_listaOutros_() {
  const contextoAtual = { id: 'A1', nome: 'TESTE - DEV' };
  const contextos = [
    { nome: 'TESTE - DEV', planilhaOperacionalId: 'A1' },
    { nome: 'TESTE2 - DEV', planilhaOperacionalId: 'B2' }
  ];

  const resultado = montarMensagemSelecaoContexto_(contextoAtual, contextos);
  const ok1 = assertEquals_('montarMensagem: outrosContextos length', 1, resultado.outrosContextos.length);
  const ok2 = assertIncludes_('montarMensagem: mensagem com emoji', resultado.mensagem, '1️⃣ - TESTE2 - DEV');

  return mergeResults_('montarMensagem: lista outros', [ok1, ok2]);
}

function test_obterIndiceEmoji_() {
  const ok1 = assertEquals_('emoji 1', '1️⃣', obterIndiceEmoji_(0));
  const ok2 = assertEquals_('emoji 10', '🔟', obterIndiceEmoji_(9));
  const ok3 = assertEquals_('emoji fallback', '11', obterIndiceEmoji_(10));
  return mergeResults_('obterIndiceEmoji', [ok1, ok2, ok3]);
}

function assertEquals_(nome, esperado, atual) {
  const ok = esperado === atual;
  return {
    nome,
    ok,
    erro: ok ? '' : ('Esperado: ' + esperado + ' | Atual: ' + atual)
  };
}

function assertIncludes_(nome, texto, trecho) {
  const ok = String(texto).indexOf(trecho) !== -1;
  return {
    nome,
    ok,
    erro: ok ? '' : ('Trecho não encontrado: ' + trecho)
  };
}

function mergeResults_(nome, resultados) {
  const falhas = resultados.filter(r => !r.ok);
  return {
    nome,
    ok: falhas.length === 0,
    erro: falhas.map(f => f.erro).join(' | ')
  };
}
