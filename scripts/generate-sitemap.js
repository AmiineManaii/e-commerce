/**
 * Génère `sitemap.xml` (racine) et `public/sitemap.xml` à partir de `api/db.json`.
 *
 * Objectif : garantir que toutes les pages indexables sont présentes et que les
 * URLs produits utilisent les nouveaux slugs SEO (`/produits/gta_v`) au lieu des
 * anciens identifiants numériques (`/produitDetails/1`).
 *
 * Usage : `npm run sitemap` (appelé automatiquement par `npm run build`).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'api', 'db.json');
const SITE_URL = 'https://gamemarttn.netlify.app';

const SLUG_OVERRIDES = {
  'grand-theft-auto-v': 'gta_v',
  'grand-theft-auto-5': 'gta_v'
};

function slugify(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '')
    .replace(/&/g, ' et ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function gameSlug(game) {
  const explicit = slugify(game.slug);
  if (explicit) return explicit;

  const byTitle = SLUG_OVERRIDES[slugify(game.title)];
  if (byTitle) return byTitle;

  return slugify(game.title) || slugify(game.id);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].join('\n');
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
    console.warn(`[sitemap] api/db.json introuvable : ${DB_PATH}`);
    return { games: [] };
  }

  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function buildSitemap() {
  const db = readDatabase();
  const games = Array.isArray(db.games) ? db.games : [];
  const lastmod = new Date().toISOString().slice(0, 10);

  const genres = uniqueBySlug(games, (game) => slugify(game.genre));
  const platforms = uniqueBySlug(games, (game) => slugify(game.platform));
  const products = uniqueBySlug(games, gameSlug);

  const entries = [
    urlEntry(`${SITE_URL}/`, lastmod, 'daily', '1.0'),
    urlEntry(`${SITE_URL}/produits`, lastmod, 'daily', '0.9'),
    urlEntry(`${SITE_URL}/promotions`, lastmod, 'daily', '0.8'),
    ...genres.map((game) =>
      urlEntry(`${SITE_URL}/categorie/${slugify(game.genre)}`, lastmod, 'weekly', '0.8')
    ),
    ...platforms.map((game) =>
      urlEntry(`${SITE_URL}/plateforme/${slugify(game.platform)}`, lastmod, 'weekly', '0.8')
    ),
    ...products.map((game) =>
      urlEntry(`${SITE_URL}/produits/${gameSlug(game)}`, lastmod, 'weekly', '0.7')
    )
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    ''
  ].join('\n');

  const targets = [
    path.join(ROOT, 'sitemap.xml'),
    path.join(ROOT, 'public', 'sitemap.xml')
  ];

  for (const target of targets) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, xml, 'utf8');
  }

  buildRedirects(products);

  console.log(
    `[sitemap] ${entries.length} URLs générées (${products.length} produits, ` +
      `${genres.length} catégories, ${platforms.length} plateformes).`
  );
}

/**
 * Génère `public/_redirects` (Netlify) avec de vraies redirections HTTP 301
 * pour les anciennes URL numériques. Contrairement à une redirection Angular
 * côté client, la 301 est vue immédiatement par Googlebot : les anciennes URL
 * déjà connues transmettent leur popularité aux nouvelles URL en slug.
 */
function buildRedirects(products) {
  const lines = [
    '# Redirections SEO générées par scripts/generate-sitemap.js',
    '# Anciennes fiches produits numériques -> nouvelles URL en slug (301 permanent)',
    ...products.flatMap((game) => [
      `/produitDetails/${game.id}  /produits/${gameSlug(game)}  301`,
      `/produitDetails/${game.id}/  /produits/${gameSlug(game)}  301`
    ]),
    '',
    '# Identifiant obsolète inconnu : retour au catalogue',
    '/produitDetails/*  /produits  301',
    '',
    '# Application Angular (SPA) : toutes les autres routes servent index.html',
    '/*  /index.html  200',
    ''
  ];

  const target = path.join(ROOT, 'public', '_redirects');
  fs.writeFileSync(target, lines.join('\n'), 'utf8');
}

buildSitemap();
