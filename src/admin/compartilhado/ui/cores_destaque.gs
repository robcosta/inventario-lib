/**
 * ============================================================
 * CORES OFICIAIS DE DESTAQUE — INVENTÁRIO
 * ============================================================
 *
 * Paleta viva e saturada, com bom contraste para texto preto.
 * Máximo de 8 cores por contexto.
 */
const CORES_DESTAQUE = {
  AZUL:     '#0066FF',   // Azul vivo
  VERDE:    '#10B981',   // Verde vivo
  AMARELO:  '#FBBF24',   // Amarelo vivo
  LARANJA:  '#F97316',   // Laranja vivo
  ROSA:     '#EC4899',   // Rosa vivo
  ROXO:     '#A855F7',   // Roxo vivo
  VERMELHO: '#DC2626',   // Vermelho vivo
  TURQUESA: '#14B8A6'    // Turquesa vivo
};

/**
 * Ordem cíclica (indexada)
 */
const CORES_DESTAQUE_LISTA = Object.values(CORES_DESTAQUE);
/**
 * TESTE: Valida que há exatamente 8 cores claras e mostra qual será atribuída
 */
function teste_validarCoresDestaque() {
  console.log('=== VALIDAÇÃO DE CORES DE DESTAQUE ===');
  console.log('Total de cores disponíveis por contexto:', CORES_DESTAQUE_LISTA.length);
  console.log('Cores (em Hex):', JSON.stringify(CORES_DESTAQUE_LISTA, null, 2));
  
  if (CORES_DESTAQUE_LISTA.length !== 8) {
    console.error('❌ ERRO: Esperado 8 cores, encontrado ' + CORES_DESTAQUE_LISTA.length);
  } else {
    console.log('✅ OK: Exatamente 8 cores definidas');
  }
  
  // Validar formato hex
  const corInvalida = CORES_DESTAQUE_LISTA.find(cor => !/^#[0-9A-Fa-f]{6}$/.test(cor));
  if (corInvalida) {
    console.error('❌ ERRO: Cor inválida encontrada: ' + corInvalida);
  } else {
    console.log('✅ OK: Todas as cores estão em formato hex válido');
  }
  
  // Exibir mapa de cores com nomes
  console.log('\n=== MAPA DE CORES ===');
  Object.entries(CORES_DESTAQUE).forEach(([nome, cor]) => {
    console.log(`${nome.padEnd(10)}: ${cor}`);
  });
  
  return {
    total: CORES_DESTAQUE_LISTA.length,
    cores: CORES_DESTAQUE_LISTA,
    valido: CORES_DESTAQUE_LISTA.length === 8,
    mapa: CORES_DESTAQUE
  };
}

/**
 * TESTE: Simula a atribuição de cores para 8 pastas em um contexto
 */
function teste_simularAtribuicaoCores() {
  console.log('=== SIMULAÇÃO: ATRIBUIÇÃO DE CORES POR CONTEXTO ===');
  
  const coresDisponiveis = [...CORES_DESTAQUE_LISTA];
  const coresEmUso = [];
  
  for (let i = 0; i < 8; i++) {
    const corEscolhida = coresDisponiveis.find(cor => !coresEmUso.includes(cor));
    if (corEscolhida) {
      coresEmUso.push(corEscolhida);
      const nomePasta = `Pasta ${String(i + 1).padStart(2, '0')}`;
      const nomeColorido = Object.keys(CORES_DESTAQUE).find(k => CORES_DESTAQUE[k] === corEscolhida);
      console.log(`✅ ${nomePasta} → ${nomeColorido} (${corEscolhida})`);
    }
  }
  
  console.log(`\n📊 Resumo: ${coresEmUso.length} pastas com cores atribuídas`);
  
  // Tentar uma 9ª
  const cor9 = coresDisponiveis.find(cor => !coresEmUso.includes(cor));
  if (!cor9) {
    console.warn('⚠️ Pasta 09 → ❌ Sem cores disponíveis (limite atingido)');
  }
  
  return {
    coresAtribuidas: coresEmUso.length,
    totalCores: CORES_DESTAQUE_LISTA.length,
    limiteAtingido: coresEmUso.length >= CORES_DESTAQUE_LISTA.length
  };
}