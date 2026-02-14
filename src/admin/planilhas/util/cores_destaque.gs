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

/**
 * ============================================================
 * Gera mapa de cores únicas por contexto
 * ============================================================
 * - Ordena alfabeticamente
 * - Atribui cores sequenciais
 * - Nunca repete
 */
function obterMapaCoresPorContexto_(pastasVivas) {

  if (!pastasVivas || !pastasVivas.length) {
    return {};
  }

  const ordenadas = [...pastasVivas]
    .sort((a, b) => a.nome.localeCompare(b.nome));

  if (ordenadas.length > CORES_DESTAQUE_LISTA.length) {
    throw new Error('Limite máximo de 8 pastas por contexto excedido.');
  }

  const mapa = {};

  ordenadas.forEach((pasta, index) => {
    mapa[pasta.id] = CORES_DESTAQUE_LISTA[index];
  });

  console.log('=== 🎨 MAPA FINAL DE CORES ===');
  ordenadas.forEach(p => {
    console.log(`${p.nome} → ${mapa[p.id]}`);
  });
  console.log('==============================');

  return mapa;
}
