function processarImagem() {

  const contexto = obterContextoAtivo_();
  if (!contexto) {
    SpreadsheetApp.getUi().alert('Nenhum contexto ativo.');
    return;
  }

  const payload = {
    imagemId: '1n8EF6UNOQ0B-D1xG9Xv7Tofo7LL33b6X',

    contexto: {
      UNIDADE_RESPONSAVEL: contexto.planilhaOperacionalId,
      planilhaContextoId: contexto.planilhaOperacionalId,
      planilhaGeralId: obterPlanilhaGeralId_(),
      ABA_CONTROLE: '__CONTROLE_PROCESSAMENTO__'
    },

    regras: {
      permitirOCR: false,
      renomearImagem: false,
      destacarPlanilhas: false
    }
  };

  const resultado = vision.visionProcessarImagem(payload);

  SpreadsheetApp.getUi().alert(
    'Resultado:\n' + JSON.stringify(resultado, null, 2)
  );
}
