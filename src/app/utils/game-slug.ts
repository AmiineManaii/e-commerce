import { Game } from '../Models/game.model';

/**
 * Slugs SEO des fiches produits.
 *
 * Objectif : remplacer les URLs techniques `/produitDetails/1` par des URLs
 * lisibles et indexables, par exemple `/produits/gta_v` ou
 * `/produits/cyberpunk-2077`.
 *
 * La valeur est calculée côté client à partir du titre afin de fonctionner
 * aussi bien avec le json-server local qu'avec l'API Spring/Render qui ne
 * renvoie pas forcément de champ `slug`.
 */

/** Slugs courts imposés pour certains titres très recherchés. */
const SLUG_OVERRIDES: Record<string, string> = {
  'grand-theft-auto-v': 'gta_v',
  'grand-theft-auto-5': 'gta_v'
};

/**
 * Alias acceptés en entrée (anciennes URLs, recherches abrégées, fautes de
 * frappe courantes). La valeur cible est le titre exact du jeu.
 */
const SLUG_ALIASES: Record<string, string> = {
  'gta-v': 'Grand Theft Auto V',
  'gta-5': 'Grand Theft Auto V',
  'gta5': 'Grand Theft Auto V',
  'gtav': 'Grand Theft Auto V',
  'grand-theft-auto-5': 'Grand Theft Auto V',
  'rdr2': 'Red Dead Redemption 2',
  'red-dead-redemption-ii': 'Red Dead Redemption 2',
  'witcher-3': 'The Witcher 3: Wild Hunt',
  'the-witcher-3': 'The Witcher 3: Wild Hunt',
  'fifa-24': 'EA Sports FC 24',
  'fifa-25': 'EA Sports FC 25',
  'fc-24': 'EA Sports FC 24',
  'fc-25': 'EA Sports FC 25',
  'cod-warzone': 'Call of Duty: Warzone',
  'call-of-duty-warzone': 'Call of Duty: Warzone',
  'spiderman-2': 'Spider-Man 2',
  'spider-man-2': 'Spider-Man 2',
  'god-of-war-ragnarok': 'God of War Ragnarök',
  'gow-ragnarok': 'God of War Ragnarök',
  'tlou-2': 'The Last of Us Part II',
  'tlou-1': 'The Last of Us Part I',
  'last-of-us-2': 'The Last of Us Part II',
  'last-of-us-1': 'The Last of Us Part I'
};

/** Convertit un texte libre en slug URL (accents, apostrophes, espaces...). */
export function slugify(value: string | number | null | undefined): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '')
    .replace(/&/g, ' et ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Nettoie un slug reçu dans l'URL. */
export function normalizeSlug(value: string | number | null | undefined): string {
  let raw = String(value ?? '').trim();
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* valeur déjà décodée ou invalide : on garde la valeur brute */
  }
  return raw
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-');
}

type SlugGame = Pick<Game, 'id' | 'title'> & { slug?: string };

/** Slug public d'un jeu. */
export function gameSlug(game: SlugGame): string {
  if (!game) return '';

  const explicit = normalizeSlug(game.slug);
  if (explicit) return explicit;

  const byTitle = SLUG_OVERRIDES[slugify(game.title)];
  if (byTitle) return byTitle;

  return slugify(game.title) || normalizeSlug(game.id);
}

/** Chemin public d'une fiche produit : `/produits/cyberpunk-2077`. */
export function gamePath(game: SlugGame): string {
  const slug = gameSlug(game);
  return slug ? `/produits/${slug}` : '/produits';
}

/** Tous les slugs acceptés pour un jeu (canonique, titre complet, id). */
export function gameSlugCandidates(game: SlugGame): string[] {
  const candidates = [
    gameSlug(game),
    slugify(game?.title),
    normalizeSlug(game?.id)
  ].filter(Boolean);

  return Array.from(new Set(candidates));
}

/** Vérifie si un slug d'URL correspond à un jeu. */
export function matchesGameSlug(game: SlugGame, slug: string): boolean {
  if (!game) return false;

  const target = normalizeSlug(slug);
  if (!target) return false;

  const variants = new Set([
    target,
    target.replace(/_/g, '-'),
    target.replace(/-/g, '_')
  ]);

  const candidates = gameSlugCandidates(game);

  for (const variant of variants) {
    if (candidates.includes(variant)) return true;

    const aliasTitle = SLUG_ALIASES[variant];
    if (aliasTitle && slugify(aliasTitle) === slugify(game.title)) {
      return true;
    }
  }

  return false;
}

/** Slugs de catégories (genres) et plateformes utilisés par le routeur. */
export function categoryPath(genre: string): string {
  return `/categorie/${slugify(genre)}`;
}

export function platformPath(platform: string): string {
  return `/plateforme/${slugify(platform)}`;
}
