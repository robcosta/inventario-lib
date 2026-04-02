/**
 * ============================================================
 * DIAGNÓSTICO
 * ============================================================
 */
/**
 * Executa diagnóstico do sistema
 */
function executarDiagnostico_() {
  const ui = SpreadsheetApp.getUi();
  const diagnostico = coletarDiagnosticoContexto_();
  ui.alert(renderDiagnosticoContexto_(diagnostico));
}

function renderDiagnosticoContexto_(d) {
  return `
✅ DIAGNÓSTICO DO SISTEMA — INVENTÁRIO

📋 CONTEXTO ADMIN

🧠 ESTADO DO CONTEXTO:
- Contexto válido: ${d.valido ? 'SIM' : 'NÃO'}
- Nome do contexto: ${d.nome}

🆔 IDS DAS PLANILHAS:
- Planilha ADMIN: ${d.planilhas.admin || 'não definido'}
- Planilha CLIENTE: ${d.planilhas.cliente || 'não definido'}
- Planilha RELATÓRIOS: ${d.planilhas.relatorio || 'não definido'}
- Planilha GERAL (global): ${d.planilhas.geral || 'não definido'}

📁 ESTRUTURA DO CONTEXTO (Drive):
- Pasta CONTEXTOS (global): ${d.pastas.contextoGlobal || 'não configurado'}
- Pasta do CONTEXTO (${d.nome}): ${d.pastas.contexto || 'não definido'}
  ├── Pasta PLANILHA: ${d.pastas.planilha || 'não definido'}
  │   └── Pasta CSV_ADMIN: ${d.pastas.csvAdmin || 'não definido'}
  └── Pasta LOCALIDADES: ${d.pastas.localidades || 'não definido'}
      └── Pastas de fotos + cor:
${d.localidades.map(l => `         - ${l.nome || '-'} (${l.id || '?'}) — Cor: ${l.cor || '-'} ${swatchAscii_(l.cor)}`).join('\n') || '         - não encontradas'}

🌍 SISTEMA GLOBAL:
- Pasta RAIZ: ${d.pastas.raiz || 'não configurado'}
- Pasta GERAL: ${d.pastas.geral || 'não configurado'}
- Pasta CSV_GERAL: ${d.pastas.csvGeral || 'não configurado'}

📌 OBSERVAÇÕES:
- Modelo: ID-based
- Diagnóstico não realiza mutações
- Fonte: ScriptProperties + Drive

✅ Diagnóstico concluído!
`;
}

function coletarDiagnosticoContexto_() {
  const sistemaGlobal = obterSistemaGlobal_();
  const contexto = obterContextoAtivo_();
  const valido = contextoAdminValido_();

  return {
    valido,
    nome: contexto?.nome || 'não definido',

    planilhas: {
      admin: contexto?.planilhaAdminId || null,
      cliente: contexto?.planilhaClienteId || null,
      relatorio: contexto?.planilhaRelatorioId || null,
      geral: sistemaGlobal.planilhaGeralId || null
    },

    pastas: {
      contextoGlobal: sistemaGlobal.pastaContextoId || null,
      contexto: contexto?.pastaContextoId || null,
      planilha: contexto?.pastaPlanilhasId || null,
      csvAdmin: contexto?.pastaCSVAdminId || null,
      localidades: contexto?.pastaLocalidadesId || null,
      raiz: sistemaGlobal.pastaRaizId || null,
      geral: sistemaGlobal.pastaGeralId || null,
      csvGeral: sistemaGlobal.pastaCSVGeralId || null
    },
    localidades: coletarPastasLocalidadesDiagnostico_(contexto)
  };
}

function coletarPastasLocalidadesDiagnostico_(contexto) {
  try {
    const pastas = obterPastasVivas_(contexto) || [];
    return pastas.map(p => ({
      id: p.id || '',
      nome: p.nome || '',
      cor: normalizarCorHexLocalidades_(p.cor || '') || '-'
    }));
  } catch (e) {
    return [];
  }
}
function swatchAscii_(hex) {
  const c = normalizarCorHexLocalidades_(hex);
  if (!c) return '';
  // Usa um emoji de quadrado aproximado para exibir cor em texto (alert).
  const palette = [
    { emoji: '🟥', hue: 0 },
    { emoji: '🟧', hue: 30 },
    { emoji: '🟨', hue: 60 },
    { emoji: '🟩', hue: 120 },
    { emoji: '🟦', hue: 210 },
    { emoji: '🟪', hue: 270 },
    { emoji: '⬜', hue: 0 },  // fallback claro
    { emoji: '⬛', hue: 0 }   // fallback escuro
  ];

  // Converte HEX para HSL para escolher emoji próximo.
  function hexToRgb(h) {
    const v = h.replace('#','');
    return {
      r: parseInt(v.substring(0,2),16),
      g: parseInt(v.substring(2,4),16),
      b: parseInt(v.substring(4,6),16)
    };
  }
  function rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min){ h=s=0; }
    else {
      const d=max-min;
      s=l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h=(g-b)/d+(g<b?6:0); break;
        case g: h=(b-r)/d+2; break;
        case b: h=(r-g)/d+4; break;
      }
      h*=60;
    }
    return {h:h,s:s,l:l};
  }

  const rgb = hexToRgb(c);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  // Escolhe emoji pela menor distância angular de hue.
  let best = palette[0];
  let bestDiff = 999;
  palette.forEach(p => {
    const diff = Math.min(
      Math.abs(hsl.h - p.hue),
      360 - Math.abs(hsl.h - p.hue)
    );
    if (diff < bestDiff) {
      bestDiff = diff;
      best = p;
    }
  });
  return best.emoji;
}

