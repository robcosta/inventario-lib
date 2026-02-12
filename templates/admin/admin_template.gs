/**
 * ============================================================
 * ÁREA DE FOTOS — TROCAR PASTA ATIVA (ORDENADO)
 * ============================================================
 * - Lista pastas do Drive
 * - Remove pasta ativa da listagem
 * - Ordena alfabeticamente (A → Z)
 * - Atualiza contexto ID-based
 */

function trocarPastaFotos_() {

  const ui = SpreadsheetApp.getUi();
  const contexto = obterContextoAtivo_();

  if (!contexto || !contexto.pastaLocalidadesId) {
    ui.alert('❌ Nenhum contexto válido encontrado.');
    return;
  }

  const pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);
  const it = pastaRaiz.getFolders();

  const pastaAtivaId = contexto.localidadeAtivaId || null;
  const pastaAtivaNome = contexto.localidadeAtivaNome || 'NENHUMA';

  const pastas = [];

  // 1️⃣ Coletar pastas ignorando a ativa
  while (it.hasNext()) {
    const pasta = it.next();

    if (pasta.getId() === pastaAtivaId) continue;

    pastas.push({
      id: pasta.getId(),
      nome: pasta.getName()
    });
  }

  if (pastas.length === 0) {
    ui.alert(
      '⚠️ Nenhuma outra pasta disponível para troca.\n\n' +
      'A pasta atual já é a única existente.'
    );
    return;
  }

  // 2️⃣ Ordenar alfabeticamente (case-insensitive)
  pastas.sort((a, b) =>
    a.nome.toUpperCase().localeCompare(b.nome.toUpperCase())
  );

  // 3️⃣ Montar mapa indexado
  const mapa = {};
  const lista = [];

  pastas.forEach((pasta, i) => {
    const index = i + 1;
    lista.push(`${index} - ${pasta.nome}`);
    mapa[index] = pasta;
  });

  const mensagem =
    'Pasta ativa: ' + pastaAtivaNome +
    '\n\nEscolha a nova pasta:\n\n' +
    lista.join('\n');

  const resp = ui.prompt(
    'Trocar Pasta de Fotos',
    mensagem,
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() !== ui.Button.OK) return;

  const numero = Number(resp.getResponseText());
  const pastaEscolhida = mapa[numero];

  if (!pastaEscolhida) {
    ui.alert('❌ Opção inválida.');
    return;
  }

  atualizarContextoAdmin_({
    localidadeAtivaId: pastaEscolhida.id,
    localidadeAtivaNome: pastaEscolhida.nome
  });

  ui.alert(
    '✅ Pasta ativa definida:\n\n' +
    pastaEscolhida.nome
  );
}
