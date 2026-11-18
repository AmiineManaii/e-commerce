/**
 * Données et utilitaires partagés par les scripts de génération SEO :
 * sitemap, redirections Netlify et pages statiques.
 *
 * La logique de slug doit rester identique à `src/app/utils/game-slug.ts`
 * (source de vérité côté application) pour que les URL générées ici soient
 * exactement celles produites par le routeur Angular.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DB_PATH = path.join(ROOT, 'api', 'db.json');
const SITE_URL = 'https://gamemarttn.netlify.app';

/** Titres dont le slug est imposé explicitement (ex. gta_v). */
const SLUG_OVERRIDES = {
  'grand-theft-auto-v': 'gta_v',
  'grand-theft-auto-5': 'gta_v'
};

function slugify(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2019`]/g, '')
    .replace(/&/g, ' et ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function gameSlug(game) {
  const explicit = slugify(game?.slug);
  if (explicit) return explicit;

  const byTitle = SLUG_OVERRIDES[slugify(game?.title)];
  if (byTitle) return byTitle;

  return slugify(game?.title) || slugify(game?.id);
}

function uniqueBySlug(items, keyFn) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function readDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    console.warn(`[catalogue] api/db.json introuvable : ${DB_PATH}`);
    return { games: [], reviews: [] };
  }

  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

/** Même formatage que `formatPrice()` dans `product-content.service.ts`. */
function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) return '';
  return `${price.toFixed(price % 1 === 0 ? 0 : 2)} DT`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteUrl(routePath) {
  const clean = String(routePath || '/').startsWith('/') ? routePath : `/${routePath}`;
  return `${SITE_URL}${clean === '/' ? '/' : clean}`;
}

/** Statistiques d'avis par jeu, utilisées pour le JSON-LD Product. */
function reviewsByGame(reviews) {
  const map = new Map();

  for (const review of Array.isArray(reviews) ? reviews : []) {
    const key = String(review?.gameId);
    const note = Number(review?.note);
    if (!key || !Number.isFinite(note) || note <= 0) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(review);
  }

  return map;
}

module.exports = {
  ROOT,
  DB_PATH,
  SITE_URL,
  slugify,
  gameSlug,
  uniqueBySlug,
  readDatabase,
  formatPrice,
  escapeHtml,
  absoluteUrl,
  reviewsByGame
};
