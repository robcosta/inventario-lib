function validarEstruturaContexto_(contexto) {

  if (!contexto) return false;

  try {

    // 1️⃣ Validar pasta raiz do contexto
    const pastaContexto = DriveApp.getFolderById(contexto.pastaContextoId);
    if (pastaContexto.isTrashed()) return false;

    // 2️⃣ Validar subpastas obrigatórias
    const planilhas = DriveApp.getFolderById(contexto.pastaPlanilhasId);
    const localidades = DriveApp.getFolderById(contexto.pastaLocalidadesId);

    if (planilhas.isTrashed() || localidades.isTrashed()) return false;

    // 3️⃣ Validar CSV_ADMIN
    const csv = DriveApp.getFolderById(contexto.pastaCSVAdminId);
    if (csv.isTrashed()) return false;

    // 4️⃣ Validar Planilha ADMIN
    const planilhaAdmin = DriveApp.getFileById(contexto.planilhaAdminId);
    if (planilhaAdmin.isTrashed()) return false;

    // 5️⃣ Validar hierarquia real
    if (!planilhas.getParents().hasNext()) return false;
    if (!localidades.getParents().hasNext()) return false;

    return true;

  } catch (e) {
    return false;
  }
}
