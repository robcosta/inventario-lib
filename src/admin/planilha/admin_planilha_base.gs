/**
 * ============================================================
 * CONFIGURAÇÃO DA PLANILHA BASE (MÃE) PATRIMONIAL
 * ============================================================
 */

function configurarPlanilhaBase_() {

  const ui = SpreadsheetApp.getUi();

  const resp = ui.prompt(
    'Configurar Planilha Base Patrimonial',
    'Informe o ID da planilha Base Patrimonial:',
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const id = (resp.getResponseText() || '').trim();
  if (!id) {
    ui.alert('ID inválido.');
    return;
  }

  try {
    SpreadsheetApp.openById(id);
  } catch (e) {
    ui.alert('Não foi possível acessar a planilha informada.');
    return;
  }

  PropertiesService.getScriptProperties().setProperty(
    'PLANILHA_BASE_PATRIMONIAL_ID',
    id
  );

  ui.alert('Planilha Base Patrimonial configurada com sucesso.');
}

