/**
 * ============================================================
 * ÁREA DE FOTOS — UTILITÁRIOS
 * ============================================================
 * - Verifica se a pasta existe
 * - Sincroniza todas as pastas da Localidade do contexto
 */

function verificarSePastaExiste_(pastaId) {
  try {
    DriveApp.getFolderById(pastaId);
    return true;
  } catch (e) {
    return false;
  }
}

function sincronizarLocalidadeAtiva_(contexto) {

  if (!contexto || !contexto.localidadeAtivaId) {
    return contexto;
  }

  try {

    const pasta = DriveApp.getFolderById(contexto.localidadeAtivaId);

    // 1️⃣ Verifica se está na lixeira
    if (pasta.isTrashed()) {
      throw new Error('Pasta está na lixeira.');
    }

    // 2️⃣ Verifica se ainda pertence à pastaLocalidadesId
    const pai = pasta.getParents();
    let pertence = false;

    while (pai.hasNext()) {
      if (pai.next().getId() === contexto.pastaLocalidadesId) {
        pertence = true;
        break;
      }
    }

    if (!pertence) {
      throw new Error('Pasta não pertence mais ao contexto.');
    }

    return contexto;

  } catch (e) {

    console.warn('⚠️ Localidade ativa inválida. Removendo do contexto.');

    const novoContexto = {
      ...contexto,
      localidadeAtivaId: null,
      localidadeAtivaNome: null
    };

    atualizarContextoAdmin_({
      localidadeAtivaId: null,
      localidadeAtivaNome: null
    });

    return novoContexto;
  }
}

