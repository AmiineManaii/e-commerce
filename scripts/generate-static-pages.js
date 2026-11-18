/**
 * Génère une version statique de chaque page publique dans `dist/`.
 *
 * Problème résolu : l'application est une SPA. Netlify renvoie donc le même
 * `index.html` (titre générique « GameMart — Boutique de jeux vidéo… ») pour
 * toutes les URL. Google et — surtout — Facebook / WhatsApp / X ne lisent pas
 * le JavaScript : ils voyaient un titre et une image identiques partout.
 *
 * Ici, chaque route publique reçoit un fichier HTML avec son propre <title>,
 * sa meta description, ses mots-clés, son canonical, ses balises Open Graph /
 * Twitter et son JSON-LD (Product, BreadcrumbList). Ces valeurs sont exactement
 * celles que l'application applique côté client : le rendu ne change pas, seule
 * la première lecture (robots, aperçus sociaux) devient correcte.
 *
 * Usage : `npm run static-pages` (exécuté après `ng build` dans `npm run build`).
 */
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  slugify,
  gameSlug,
  uniqueBySlug,
  readDatabase,
  formatPrice,
  escapeHtml,
  absoluteUrl,
  reviewsByGame
} = require('./lib/catalog');

const DIST = path.join(ROOT, 'dist', 'e-commerce', 'browser');
const TEMPLATE = path.join(DIST, 'index.html');
const PUBLIC_REDIRECTS = path.join(ROOT, 'public', '_redirects');

function clamp(text, max) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Remplace le contenu d'une balise meta existante (sans créer de doublon). */
function setMeta(html, attribute, key, value) {
  if (value === undefined || value === null || value === '') return html;

  const pattern = new RegExp(`<meta ${attribute}="${escapeRegExp(key)}" content="[^"]*">`);
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}">`;

  if (!pattern.test(html)) return html;
  return html.replace(pattern, () => tag);
}

function setCanonical(html, url) {
  const pattern = /<link rel="canonical" href="[^"]*">/;
  if (!pattern.test(html)) return html;
  return html.replace(pattern, () => `<link rel="canonical" href="${escapeHtml(url)}">`);
}

function applyPage(template, page) {
  const url = absoluteUrl(page.route);
  const image = page.image || 'https://gamemarttn.netlify.app/assets/og/gamemart-og.jpg';

  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtml(page.title)}</title>`);
  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'name', 'keywords', page.keywords);
  html = setCanonical(html, url);

  html = setMeta(html, 'property', 'og:type', page.ogType || 'website');
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'property', 'og:image:secure_url', image);
  html = setMeta(html, 'property', 'og:image:alt', page.imageAlt || page.title);
  html = html.replace(/<link rel="image_src" href="[^"]*">/, () =>
    `<link rel="image_src" href="${escapeHtml(image)}">`
  );

  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  html = setMeta(html, 'name', 'twitter:image', image);

  const jsonLd = (page.jsonLd || [])
    .map(
      (entry) =>
        `  <script type="application/ld+json" id="${entry.id}">\n${JSON.stringify(
          entry.data,
          null,
          2
        )}\n  </script>`
    )
    .join('\n');

  if (jsonLd) {
    html = html.replace('</head>', () => `${jsonLd}\n</head>`);
  }

  return html;
}

function productJsonLd(game, route, reviews, averageRating, reviewCount) {
  const url = absoluteUrl(route);
  const price = Number(game.price);
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  const images = [game.cover_image, ...(Array.isArray(game.images) ? game.images : [])]
    .filter((src) => typeof src === 'string' && src.trim().length > 0);

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: game.title,
    url,
    sku: `GM-${game.id}`,
    image: Array.from(new Set(images)),
    description: clamp(game.description, 500),
    brand: { '@type': 'Brand', name: 'GameMart' },
    category: game.genre,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'TND',
      price: Number.isFinite(price) ? price.toFixed(2) : '0.00',
      priceValidUntil: validUntil.toISOString().slice(0, 10),
      availability:
        Number(game.stock) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'GameMart',
        url: 'https://gamemarttn.netlify.app/'
      }
    }
  };

  if (reviewCount > 0 && averageRating > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  return { id: 'product-jsonld', data };
}

function breadcrumbJsonLd(trail) {
  return {
    id: 'breadcrumb-jsonld',
    data: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.route)
      }))
    }
  };
}

function buildProductPage(game, reviewList) {
  const route = `/produits/${gameSlug(game)}`;
  const price = formatPrice(game.price);
  const inStock = Number(game.stock) > 0;
  const notes = (reviewList || []).map((review) => Number(review.note)).filter((n) => n > 0);
  const averageRating = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;

  const description = clamp(
    [
      `Achetez ${game.title} sur ${game.platform} chez GameMart Tunisie.`,
      `Jeu ${String(game.genre || '').toLowerCase()}.`,
      price ? `Prix ${price}.` : '',
      inStock ? 'En stock, livraison rapide.' : 'Disponible sur commande.',
      game.promo ? 'Promotion en cours.' : ''
    ]
      .filter(Boolean)
      .join(' '),
    158
  );

  return {
    route,
    title: `${game.title} ${game.platform} — Acheter en Tunisie | GameMart`,
    description,
    keywords: [
      game.title,
      `${game.title} ${game.platform}`,
      `acheter ${game.title}`,
      `${game.title} Tunisie`,
      `${game.title} prix`,
      `jeu ${String(game.genre || '').toLowerCase()}`,
      `jeu ${game.platform}`,
      'jeux vidéo Tunisie',
      'GameMart'
    ].join(', '),
    image: game.cover_image,
    imageAlt: `${game.title} sur ${game.platform} — GameMart Tunisie`,
    ogType: 'product',
    jsonLd: [
      productJsonLd(game, route, reviewList, averageRating, notes.length),
      breadcrumbJsonLd([
        { name: 'Accueil', route: '/' },
        { name: 'Catalogue', route: '/produits' },
        { name: game.genre || 'Jeux', route: `/categorie/${slugify(game.genre)}` },
        { name: game.title, route }
      ])
    ]
  };
}

function buildCataloguePage() {
  return {
    route: '/produits',
    title: 'Catalogue de jeux vidéo - PC, PS5, Xbox, Switch | GameMart',
    description:
      'Parcourez tout le catalogue GameMart : jeux PC, PlayStation 5, Xbox et Nintendo Switch, prix en dinars tunisiens, stock en temps réel et promotions.',
    keywords:
      'catalogue jeux vidéo, tous les jeux vidéo, jeux PC Tunisie, jeux PS5 Tunisie, jeux Xbox Tunisie, jeux Switch Tunisie, acheter jeu vidéo, GameMart'
  };
}

function buildPromoPage(count) {
  return {
    route: '/promotions',
    title: 'Promotions jeux vidéo — Bons plans en Tunisie | GameMart',
    description: clamp(
      `Profitez de ${count} promotions jeux vidéo chez GameMart : réductions sur PC, PS5, Xbox et Nintendo Switch, prix en DT et stock limité.`,
      158
    ),
    keywords:
      'promotions jeux vidéo, jeux vidéo en promo, jeux pas cher Tunisie, bon plan jeux vidéo, réduction jeu PC, réduction jeu PS5, réduction jeu Xbox, GameMart promotions'
  };
}

function buildGenrePage(genre, count) {
  return {
    route: `/categorie/${slugify(genre)}`,
    title: `Jeux ${genre} — Acheter en Tunisie au meilleur prix | GameMart`,
    description: clamp(
      `Découvrez ${count} jeux ${genre} sur GameMart : prix en dinars tunisiens, plateformes PC, PS5, Xbox et Switch, avis des joueurs et promotions en cours.`,
      158
    ),
    keywords: [
      `jeux ${genre}`,
      `jeu ${genre}`,
      `acheter jeu ${genre}`,
      `jeux ${genre} pas cher`,
      `jeux ${genre} Tunisie`,
      `jeu ${genre} PC`,
      `jeu ${genre} PS5`,
      `jeux ${genre} 2026`,
      'GameMart'
    ].join(', ')
  };
}

function buildPlatformPage(platform, count) {
  return {
    route: `/plateforme/${slugify(platform)}`,
    title: `Jeux ${platform} — Acheter en Tunisie | GameMart`,
    description: clamp(
      `Tous les jeux ${platform} disponibles chez GameMart : prix en DT, stock en temps réel, avis des joueurs et promotions. Livraison rapide en Tunisie.`,
      158
    ),
    keywords: [
      `jeux ${platform}`,
      `jeu ${platform}`,
      `acheter jeu ${platform}`,
      `jeu ${platform} Tunisie`,
      `jeu ${platform} pas cher`,
      `promotion jeu ${platform}`,
      'GameMart'
    ].join(', ')
  };
}

/** Ajoute les règles de réécriture Netlify vers les fichiers statiques. */
function updateRedirects(pages) {
  const marker = '/*  /index.html  200';
  const base = fs.existsSync(PUBLIC_REDIRECTS)
    ? fs.readFileSync(PUBLIC_REDIRECTS, 'utf8')
    : fs.readFileSync(path.join(DIST, '_redirects'), 'utf8');

  if (!base.includes(marker)) return;

  const rules = [
    '# Pages statiques générées par scripts/generate-static-pages.js',
    '# Même URL publique, HTML avec les bonnes balises SEO dès la première requête.',
    ...pages.map((page) => `${page.route}  ${page.route}.html  200`),
    ''
  ].join('\n');

  fs.writeFileSync(path.join(DIST, '_redirects'), base.replace(marker, () => `${rules}${marker}`), 'utf8');
}

function main() {
  if (!fs.existsSync(TEMPLATE)) {
    console.error(`[pages] ${TEMPLATE} introuvable : lancez « ng build » avant.`);
    process.exitCode = 1;
    return;
  }

  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const db = readDatabase();
  const games = Array.isArray(db.games) ? db.games : [];
  const reviewsMap = reviewsByGame(db.reviews);

  const genres = uniqueBySlug(games, (game) => slugify(game.genre));
  const platforms = uniqueBySlug(games, (game) => slugify(game.platform));
  const products = uniqueBySlug(games, gameSlug);

  const pages = [
    buildCataloguePage(),
    buildPromoPage(games.filter((game) => game.promo).length),
    ...genres.map((game) =>
      buildGenrePage(game.genre, games.filter((g) => g.genre === game.genre).length)
    ),
    ...platforms.map((game) =>
      buildPlatformPage(game.platform, games.filter((g) => g.platform === game.platform).length)
    ),
    ...products.map((game) => buildProductPage(game, reviewsMap.get(String(game.id))))
  ];

  for (const page of pages) {
    const target = path.join(DIST, `${page.route}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, applyPage(template, page), 'utf8');
  }

  updateRedirects(pages);

  console.log(
    `[pages] ${pages.length} pages statiques générées ` +
      `(${products.length} produits, ${genres.length} catégories, ${platforms.length} plateformes, catalogue, promotions).`
  );
}

main();
