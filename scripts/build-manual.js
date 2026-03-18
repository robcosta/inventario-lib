/**
 * ==============================================================
 * BUILD SCRIPT — DOCUMENTAÇÃO MARKDOWN → GOOGLE APPS SCRIPT
 * ==============================================================
 *
 * Responsabilidade:
 * --------------------------------------------------------------
 * Converte automaticamente todos os arquivos .md da pasta /docs
 * em arquivos .gs compatíveis com o Google Apps Script.
 *
 * Fluxo:
 * --------------------------------------------------------------
 * docs/*.md
 *      ↓
 * src/core/docs_generated/*_texto.gs
 *
 * O script:
 * - Lê todos os arquivos Markdown da pasta /docs
 * - Escapa caracteres incompatíveis com template string
 * - Gera constantes JS contendo o conteúdo Markdown
 * - Cria funções getter no padrão:
 *     obterTexto_<nome>()
 *
 * Objetivo Arquitetural:
 * --------------------------------------------------------------
 * - Manter a documentação fonte em Markdown puro
 * - Evitar mistura de conteúdo com lógica de negócio
 * - Permitir versionamento adequado no Git
 * - Possibilitar futura exportação (HTML, PDF, sidebar, etc.)
 *
 * Observações Importantes:
 * --------------------------------------------------------------
 * ⚠️ Os arquivos gerados em /docs_generated NÃO devem ser
 * editados manualmente.
 *
 * ⚠️ Sempre que um .md for alterado, execute:
 *
 *     npm run build:docs
 *
 * Antes de rodar:
 *
 *     clasp push
 *
 * Dependências:
 * --------------------------------------------------------------
 * - Node.js
 * - Estrutura padrão do projeto inventario
 *
 * Autor: Sistema Inventário Patrimonial
 * ==============================================================
 */


const fs = require("fs");
const path = require("path");

const docsDir = path.join(__dirname, "../docs");
const outputDir = path.join(__dirname, "../src/core/docs_generated");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(docsDir).filter(f => f.endsWith(".md"));

files.forEach(file => {

  const baseName = path.basename(file, ".md");
  const content = fs.readFileSync(path.join(docsDir, file), "utf8");

  const escaped = content.replace(/`/g, "\\`");

  const output = `
/**
 * ⚠️ ARQUIVO GERADO AUTOMATICAMENTE
 */
const ${baseName.toUpperCase()}_MD = \`
${escaped}
\`;

function obterTexto_${baseName}() {
  return ${baseName.toUpperCase()}_MD;
}
`;

  fs.writeFileSync(
    path.join(outputDir, `${baseName}_texto.gs`),
    output
  );

  console.log(`✔ Gerado: ${baseName}_texto.gs`);
});
