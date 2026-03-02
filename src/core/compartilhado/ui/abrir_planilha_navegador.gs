/**
 * ============================================================
 * UI — ABRIR PLANILHA NO NAVEGADOR (NOVA ABA)
 * ============================================================
 *
 * Abre uma planilha do Google Sheets em nova aba
 * exibindo o nome da planilha no modal.
 *
 * @param {string} spreadsheetId
 */

function abrirPlanilhaNoNavegador_(spreadsheetId) {

  if (!spreadsheetId) {
    SpreadsheetApp.getUi().alert('❌ ID da planilha inválido.');
    return;
  }

  let nomePlanilha = 'Planilha';

  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    nomePlanilha = ss.getName();
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      '❌ Não foi possível acessar a planilha.\n\n' + e.message
    );
    return;
  }

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/view`;

  const payload = {
    spreadsheetId,
    nomePlanilha,
    url,
    ttlMs: 30 * 60 * 1000
  };

  const payloadJson = JSON.stringify(payload).replace(/<\//g, '<\\/');

  const html = HtmlService.createHtmlOutput(`
    <script>
      const data = ${payloadJson};

      function obterChave(id) {
        return 'inventario:planilha:aberta:' + id;
      }

      function limparRegistrosExpirados(prefixo) {
        try {
          const agora = Date.now();
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const chave = localStorage.key(i);
            if (!chave || !chave.startsWith(prefixo)) continue;

            const valor = localStorage.getItem(chave);
            if (!valor) {
              localStorage.removeItem(chave);
              continue;
            }

            const registro = JSON.parse(valor);
            if (!registro || !registro.abertoEm || (agora - registro.abertoEm) > data.ttlMs) {
              localStorage.removeItem(chave);
            }
          }
        } catch (e) {
        }
      }

      (function abrirOuAvisar() {
        const prefixo = 'inventario:planilha:aberta:';
        limparRegistrosExpirados(prefixo);

        const chave = obterChave(data.spreadsheetId);
        const registroAtual = localStorage.getItem(chave);

        if (registroAtual) {
          alert('ℹ️ A planilha "' + data.nomePlanilha + '" já se encontra aberta no navegador.');
          google.script.host.close();
          return;
        }

        localStorage.setItem(
          chave,
          JSON.stringify({
            abertoEm: Date.now(),
            nome: data.nomePlanilha,
            url: data.url
          })
        );

        window.open(data.url, '_blank');
        google.script.host.close();
      })();
    </script>
  `).setWidth(10).setHeight(10);

  SpreadsheetApp
    .getUi()
    .showModalDialog(html, `Abrindo planilha: ${nomePlanilha}`);
}
