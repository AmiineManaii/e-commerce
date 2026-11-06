const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Noms d'env possibles (Netlify / local)
const gaId = process.env.GA_MEASUREMENT_ID || process.env.GOOGLE_ANALYTICS_ID || process.env.NG_APP_GA_ID || '';
const gtmId = process.env.GTM_CONTAINER_ID || process.env.GOOGLE_TAG_MANAGER_ID || process.env.NG_APP_GTM_ID || '';
const gscCode = process.env.GSC_VERIFICATION_CODE || process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION || process.env.NG_APP_GSC_CODE || '';

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (to && content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', path.relative(root, filePath));
  } else {
    console.log('No changes:', path.relative(root, filePath));
  }
}

// Placeholders actuels
const indexHtml = path.join(root, 'src', 'index.html');
replaceInFile(indexHtml, [
  ['G-XXXXXXXXXX', gaId || 'G-XXXXXXXXXX'],
  ['GTM-XXXXXXX', gtmId || 'GTM-XXXXXXX'],
  ['REMPLACER_PAR_VOTRE_CODE_SEARCH_CONSOLE', gscCode || 'REMPLACER_PAR_VOTRE_CODE_SEARCH_CONSOLE']
]);

const envProd = path.join(root, 'src', 'environments', 'environment.prod.ts');
replaceInFile(envProd, [
  ["googleAnalyticsId: 'G-XXXXXXXXXX'", `googleAnalyticsId: '${gaId || 'G-XXXXXXXXXX'}'`],
  ["googleTagManagerId: 'GTM-XXXXXXX'", `googleTagManagerId: '${gtmId || 'GTM-XXXXXXX'}'`],
  ["googleSearchConsoleVerification: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'", `googleSearchConsoleVerification: '${gscCode || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}'`]
]);

console.log('Injection terminée. GA:', gaId || '(placeholder)', '| GTM:', gtmId || '(placeholder)', '| GSC:', gscCode ? 'défini' : '(placeholder)');
