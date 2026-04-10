/**
 * ============================================================
 * CORES OFICIAIS DE DESTAQUE — INVENTÁRIO
 * ============================================================
 */

const CORES_DESTAQUE = {
  AZUL:     '#0066FF',
  VERDE:    '#10B981',
  AMARELO:  '#FBBF24',
  LARANJA:  '#F97316',
  ROSA:     '#EC4899',
  ROXO:     '#A855F7',
  VERMELHO: '#DC2626',
  TURQUESA: '#14B8A6'
};

const CORES_DESTAQUE_LISTA = Object.values(CORES_DESTAQUE);
const LIMITE_MAX_LOCALIDADES_CONTEXTO = 8;
const TOTAL_CORES_FIXAS_DESTAQUE = 8;

/**
 * ============================================================
 * Gera (e sincroniza) mapa de cores por contexto (regra fixa)
 * ============================================================
 * Regras:
 * - Exatamente 8 cores oficiais e exatamente 8 pastas máximas por contexto.
 * - Cor é imutável por pasta (folderId -> cor) enquanto a pasta existir.
 * - Cor de pasta excluída volta para o pool e pode ser reaproveitada.
 * - Nunca repete cor entre pastas vivas no mesmo contexto.
 */
function obterMapaCoresPorContexto_(contextoOuPastas, pastasVivasOpcional) {
  let contexto = null;
  let pastasVivas = contextoOuPastas;

  if (Array.isArray(pastasVivasOpcional)) {
    contexto = contextoOuPastas || null;
    pastasVivas = pastasVivasOpcional;
  }

  const estado = sincronizarMapaCoresPastasNoContexto_(contexto, pastasVivas);
  return estado.mapa;
}

function validarConfiguracaoCoresFixas_() {
  const totalCores = CORES_DESTAQUE_LISTA.length;
  if (totalCores !== TOTAL_CORES_FIXAS_DESTAQUE) {
    throw new Error(
      'Configuração inválida: CORES_DESTAQUE deve ter exatamente ' +
      TOTAL_CORES_FIXAS_DESTAQUE + ' cores.'
    );
  }

  if (LIMITE_MAX_LOCALIDADES_CONTEXTO !== TOTAL_CORES_FIXAS_DESTAQUE) {
    throw new Error(
      'Configuração inválida: LIMITE_MAX_LOCALIDADES_CONTEXTO deve ser ' +
      TOTAL_CORES_FIXAS_DESTAQUE + '.'
    );
  }
}

function corEhDaPaletaFixa_(cor) {
  const normalizada = normalizarCorHexLocalidades_(cor);
  if (!normalizada) return false;

  const set = {};
  CORES_DESTAQUE_LISTA.forEach(item => {
    const c = normalizarCorHexLocalidades_(item);
    if (c) set[c] = true;
  });

  return !!set[normalizada];
}

function sincronizarMapaCoresPastasNoContexto_(contexto, pastasVivas) {
  validarConfiguracaoCoresFixas_();

  const lista = Array.isArray(pastasVivas) ? pastasVivas.slice() : [];

  if (lista.length > LIMITE_MAX_LOCALIDADES_CONTEXTO) {
    throw new Error('Limite máximo de 8 pastas por contexto excedido.');
  }

  const estadoAnterior = obterEstadoCoresDoContexto_(contexto);
  const mapaAnterior = estadoAnterior.mapa;
  const usadasSet = {};
  const mapaNovo = {};

  const ordenadas = [...lista]
    .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || '')));

  // 1) Preserva cor existente das pastas vivas (imutabilidade).
  ordenadas.forEach(pasta => {
    const folderId = String(pasta.id || '');
    if (!folderId) return;

    const corAnterior = normalizarCorHexLocalidades_(mapaAnterior[folderId]);
    if (!corAnterior) return;
    if (!corEhDaPaletaFixa_(corAnterior)) return;
    if (usadasSet[corAnterior]) return; // legado com duplicidade: normaliza abaixo

    mapaNovo[folderId] = corAnterior;
    usadasSet[corAnterior] = true;
  });

  // 2) Atribui novas cores para pastas sem cor.
  ordenadas.forEach(pasta => {
    const folderId = String(pasta.id || '');
    if (!folderId) return;
    if (mapaNovo[folderId]) return;

    const corNova = gerarCorDisponivel_(usadasSet);
    mapaNovo[folderId] = corNova;
    usadasSet[corNova] = true;
  });

  // 3) Não existe banimento permanente no contrato fixo.
  const banidasNovas = [];
  const alterado =
    serializarMapaCores_(mapaAnterior) !== serializarMapaCores_(mapaNovo) ||
    serializarListaCores_(estadoAnterior.banidas) !== serializarListaCores_(banidasNovas);

  if (alterado) {
    persistirEstadoCoresNoContexto_(contexto, mapaNovo, banidasNovas);
  }

  return {
    mapa: mapaNovo,
    banidas: banidasNovas,
    alterado: alterado
  };
}

function obterEstadoCoresDoContexto_(contexto) {
  const mapaCru = (contexto && typeof contexto.mapaCoresPastas === 'object')
    ? contexto.mapaCoresPastas
    : {};

  const mapa = {};
  Object.keys(mapaCru || {}).forEach(folderId => {
    const id = String(folderId || '').trim();
    const cor = normalizarCorHexLocalidades_(mapaCru[folderId]);
    if (!id || !cor) return;
    mapa[id] = cor;
  });

  // Contrato fixo: sem banimento de cor.
  const banidas = [];

  return { mapa: mapa, banidas: banidas };
}

function persistirEstadoCoresNoContexto_(contexto, mapa, banidas) {
  if (!contexto) return;

  const patch = {
    mapaCoresPastas: mapa,
    coresBanidasPastas: banidas,
    ultimaAtualizacao: new Date().toISOString()
  };

  // Contexto ADMIN persistido por planilha (ScriptProperties).
  if (contextoAdminComCamposMinimos_(contexto)) {
    try {
      const base = { ...contexto };
      delete base.tipo;
      delete base.origem;

      const atualizado = {
        ...base,
        ...patch
      };
      salvarContextoAdmin_(contexto.planilhaAdminId, atualizado);
      return;
    } catch (e) {
      Logger.log('[CORES][PERSISTENCIA][ADMIN][AVISO] ' + e.message);
    }
  }

  // Fallback CLIENTE (DocumentProperties).
  if (contexto.tipo === 'CLIENTE' && typeof atualizarContextoCliente_ === 'function') {
    try {
      atualizarContextoCliente_(patch);
    } catch (e) {
      Logger.log('[CORES][PERSISTENCIA][CLIENTE][AVISO] ' + e.message);
    }
  }
}

function contextoAdminComCamposMinimos_(contexto) {
  if (!contexto) return false;
  return !!(
    contexto.planilhaAdminId &&
    contexto.pastaContextoId &&
    contexto.pastaPlanilhasId &&
    contexto.pastaCSVAdminId &&
    contexto.pastaLocalidadesId
  );
}

function gerarCorDisponivel_(usadasSet) {
  validarConfiguracaoCoresFixas_();

  for (let i = 0; i < CORES_DESTAQUE_LISTA.length; i++) {
    const candidata = normalizarCorHexLocalidades_(CORES_DESTAQUE_LISTA[i]);
    if (!candidata) continue;
    if (usadasSet[candidata]) continue;
    return candidata;
  }

  throw new Error('Não há cor disponível para nova localidade. Limite de 8 pastas atingido.');
}

function normalizarCorHexLocalidades_(cor) {
  const texto = String(cor || '').trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(texto) ? texto : '';
}

function normalizarListaCoresBanidas_(lista) {
  if (!Array.isArray(lista)) return [];
  const set = {};
  lista.forEach(cor => {
    const normalizada = normalizarCorHexLocalidades_(cor);
    if (normalizada) set[normalizada] = true;
  });
  return Object.keys(set).sort();
}

function criarSetCores_(lista) {
  const set = {};
  (lista || []).forEach(cor => {
    const normalizada = normalizarCorHexLocalidades_(cor);
    if (normalizada) set[normalizada] = true;
  });
  return set;
}

function serializarMapaCores_(mapa) {
  const chaves = Object.keys(mapa || {}).sort();
  const partes = [];
  chaves.forEach(k => {
    partes.push(k + '=' + normalizarCorHexLocalidades_(mapa[k]));
  });
  return partes.join('|');
}

function serializarListaCores_(lista) {
  return normalizarListaCoresBanidas_(lista).join('|');
}
