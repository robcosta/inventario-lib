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

/**
 * ============================================================
 * Gera (e sincroniza) mapa de cores por contexto
 * ============================================================
 * Regras:
 * - Cor é imutável por pasta (folderId -> cor)
 * - Cor de pasta excluída volta para o pool e pode ser reaproveitada
 * - Nunca repete cor entre pastas vivas no mesmo contexto
 * - Paleta é expansível (além das 8 cores-base), mas o contexto segue
 *   limitado a 8 pastas vivas.
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

function sincronizarMapaCoresPastasNoContexto_(contexto, pastasVivas) {
  const lista = Array.isArray(pastasVivas) ? pastasVivas.slice() : [];

  if (lista.length > LIMITE_MAX_LOCALIDADES_CONTEXTO) {
    throw new Error('Limite máximo de 8 pastas por contexto excedido.');
  }

  const estadoAnterior = obterEstadoCoresDoContexto_(contexto);
  const mapaAnterior = estadoAnterior.mapa;
  const banidasAnteriores = estadoAnterior.banidas;

  const banidasSet = criarSetCores_(banidasAnteriores);
  const usadasSet = {};
  const vivosSet = {};
  const mapaNovo = {};

  const ordenadas = [...lista]
    .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || '')));

  ordenadas.forEach(p => {
    if (!p || !p.id) return;
    vivosSet[String(p.id)] = true;
  });

  // 1) Pastas removidas: cor volta para o pool (não é banida).
  //    Mantemos apenas banidas que já existiam explicitamente.

  // 2) Preserva cor existente das pastas vivas (imutabilidade).
  ordenadas.forEach(pasta => {
    const folderId = String(pasta.id || '');
    if (!folderId) return;

    const corAnterior = normalizarCorHexLocalidades_(mapaAnterior[folderId]);
    if (!corAnterior) return;
    if (usadasSet[corAnterior]) return; // legado com duplicidade: normaliza abaixo

    mapaNovo[folderId] = corAnterior;
    usadasSet[corAnterior] = true;
  });

  // 3) Nenhuma cor ativa pode permanecer banida.
  Object.keys(usadasSet).forEach(cor => {
    delete banidasSet[cor];
  });

  // 4) Atribui novas cores para pastas sem cor, respeitando banidas.
  let indiceGerador = 0;
  ordenadas.forEach(pasta => {
    const folderId = String(pasta.id || '');
    if (!folderId) return;
    if (mapaNovo[folderId]) return;

    const corNova = gerarCorDisponivel_(usadasSet, banidasSet, indiceGerador);
    mapaNovo[folderId] = corNova;
    usadasSet[corNova] = true;
    indiceGerador++;
  });

  const banidasNovas = Object.keys(banidasSet).sort();
  const alterado =
    serializarMapaCores_(mapaAnterior) !== serializarMapaCores_(mapaNovo) ||
    serializarListaCores_(banidasAnteriores) !== serializarListaCores_(banidasNovas);

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

  const banidas = normalizarListaCoresBanidas_(contexto && contexto.coresBanidasPastas);

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

function gerarCorDisponivel_(usadasSet, banidasSet, indiceInicial) {
  let indice = Number(indiceInicial || 0);
  let tentativas = 0;

  while (tentativas < 5000) {
    const candidata = normalizarCorHexLocalidades_(obterCorExpansivelPorIndice_(indice));
    indice++;
    tentativas++;
    if (!candidata) continue;
    if (usadasSet[candidata]) continue;
    if (banidasSet[candidata]) continue;
    return candidata;
  }

  throw new Error('Não foi possível gerar uma cor disponível para a localidade.');
}

function obterCorExpansivelPorIndice_(indice) {
  const idx = Math.max(0, Number(indice || 0));

  if (idx < CORES_DESTAQUE_LISTA.length) {
    return CORES_DESTAQUE_LISTA[idx];
  }

  // Paleta expansível baseada em golden-angle + variação de saturação/luz.
  const base = idx - CORES_DESTAQUE_LISTA.length;
  const hue = (base * 137.508) % 360;
  const sat = 62 + (base % 3) * 8;   // 62, 70, 78
  const light = 42 + (base % 4) * 7; // 42, 49, 56, 63

  return hslParaHexLocalidades_(hue, sat, light);
}

function hslParaHexLocalidades_(h, s, l) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, Number(s)));
  const lig = Math.max(0, Math.min(100, Number(l)));

  const c = (1 - Math.abs((2 * lig / 100) - 1)) * (sat / 100);
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = (lig / 100) - (c / 2);

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hue < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (hue < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (hue < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (hue < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (hue < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
    .join('');
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
