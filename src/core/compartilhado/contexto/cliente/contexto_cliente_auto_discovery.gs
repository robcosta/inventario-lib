function descobrirContextoClienteAutomaticamente_() {

  try {

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const arquivo = DriveApp.getFileById(ss.getId());

    let pastaAtual = arquivo.getParents().hasNext()
      ? arquivo.getParents().next()
      : null;

    if (!pastaAtual) {
      throw new Error('Planilha fora de pasta.');
    }

    let pastaContexto = null;
    let pastaLocalidades = null;
    let pastaPlanilha = null;

    while (pastaAtual) {

      const subPastas = pastaAtual.getFolders();

      while (subPastas.hasNext()) {

        const p = subPastas.next();

        if (p.getName().toUpperCase() === 'LOCALIDADES') {
          pastaLocalidades = p;
        }

        if (p.getName().toUpperCase() === 'PLANILHA') {
          pastaPlanilha = p;
        }
      }

      if (pastaLocalidades && pastaPlanilha) {
        pastaContexto = pastaAtual;
        break;
      }

      const pais = pastaAtual.getParents();
      pastaAtual = pais.hasNext()
        ? pais.next()
        : null;
    }

    if (!pastaContexto || !pastaLocalidades || !pastaPlanilha) {
      throw new Error('Estrutura de contexto inválida.');
    }

    // Encontrar planilha ADMIN
    const arquivos = pastaPlanilha.getFiles();
    let planilhaAdminId = null;

    while (arquivos.hasNext()) {
      const file = arquivos.next();
      if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
        planilhaAdminId = file.getId();
        break;
      }
    }

    if (!planilhaAdminId) {
      throw new Error('Planilha ADMIN não encontrada.');
    }

    const contexto = {
      id: pastaContexto.getId(),
      nome: pastaContexto.getName(),
      pastaLocalidadesId: pastaLocalidades.getId(),
      planilhaAdminId: planilhaAdminId,
      planilhaGeralId: obterPlanilhaGeralId_(),
      planilhaClienteId: ss.getId()
    };

    salvarContextoCliente_(contexto);

    return contexto;

  } catch (e) {

    console.error('Auto-discovery falhou:', e.message);
    return null;
  }
}
