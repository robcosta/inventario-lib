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

    const atualizacao = {
      localidadeAtivaId: null,
      localidadeAtivaNome: null
    };

    // 🔥 Persistência inteligente
    persistirContextoAtual_(atualizacao);

    return {
      ...contexto,
      ...atualizacao
    };
  }
}

function listarPastasLocalidadesOrdenadas_(contexto) {
  if (!contexto || !contexto.pastaLocalidadesId) return [];

  let pastaRaiz;
  try {
    pastaRaiz = DriveApp.getFolderById(contexto.pastaLocalidadesId);
  } catch (e) {
    return [];
  }

  const it = pastaRaiz.getFolders();
  const lista = [];

  while (it.hasNext()) {
    const pasta = it.next();
    lista.push({
      id: String(pasta.getId() || '').trim(),
      nome: String(pasta.getName() || '').trim()
    });
  }

  lista.sort((a, b) => {
    const nomeCmp = a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
    if (nomeCmp !== 0) return nomeCmp;
    return a.id.localeCompare(b.id);
  });

  return lista;
}

function calcularVersaoLocalidadesDoDrive_(contexto) {
  const pastas = listarPastasLocalidadesOrdenadas_(contexto);
  const assinaturaBase = pastas.map(p => `${p.id}|${p.nome}`).join('\n');

  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    assinaturaBase || 'SEM_PASTAS'
  );

  const hex = bytes
    .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
    .join('');

  return hex.substring(0, 24);
}


