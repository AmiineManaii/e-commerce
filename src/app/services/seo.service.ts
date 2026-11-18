import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Game } from '../Models/game.model';
import { gamePath } from '../utils/game-slug';

export interface PageSeo {
  /** Titre affiché dans l'onglet et dans les résultats Google. */
  title: string;
  /** Meta description (environ 150-160 caractères). */
  description: string;
  /** Mots-clés ciblés (balise meta keywords + longue traîne). */
  keywords?: string | string[];
  /** Image de partage (Open Graph / Twitter). */
  image?: string;
  /** Chemin canonique explicite (sinon l'URL courante est utilisée). */
  path?: string;
  /** Type Open Graph : `website` (défaut) ou `product`. */
  type?: 'website' | 'product';
}

export interface ProductReviewJsonLd {
  note?: number;
  msg?: string;
  date?: string;
  authorName?: string;
}

export interface ProductJsonLdOptions {
  description?: string;
  reviews?: ProductReviewJsonLd[];
  averageRating?: number;
  reviewCount?: number;
  url?: string;
}

export interface FaqJsonLdItem {
  question: string;
  answer: string;
}

export interface BreadcrumbJsonLdItem {
  name: string;
  path: string;
}

/**
 * Gère les balises SEO de la SPA : title, meta description, keywords, robots,
 * canonical, Open Graph, Twitter Card et données structurées JSON-LD.
 *
 * Sans ce service, toutes les routes partageraient le même title défini
 * dans index.html — ce qui provoque des titles dupliqués aux yeux de Google.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private doc = inject(DOCUMENT);
  private router = inject(Router);

  readonly siteUrl = 'https://gamemarttn.netlify.app';
  private readonly defaultImage = this.siteUrl + '/assets/og/gamemart-og.jpg';
  private readonly defaultDescription =
    "GameMart, votre boutique en ligne de jeux vidéo en Tunisie : jeux PC, PlayStation 5, Xbox et Nintendo Switch au meilleur prix.";

  private started = false;

  /** Routes privées, transactionnelles ou sans valeur SEO : exclues de l'indexation. */
  private readonly noindexPrefixes = [
    '/cart',
    '/checkout',
    '/order-confirmation',
    '/user',
    '/login',
    '/register',
    '/search',
    // Ancienne URL des fiches produits : redirigée vers /produits/<slug>
    '/produitDetails'
  ];

  init(): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;

    // Les JSON-LD dynamiques (produit, fil d'Ariane, FAQ) sont retirés dès le
    // début de la navigation, puis réinjectés par la page de destination.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.clearProductJsonLd());

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.applyRouteSeo());

    // Premier affichage (avant toute navigation)
    this.applyRouteSeo();
  }

  /** À appeler quand une page possède des données dynamiques (ex : fiche produit). */
  setPage(seo: PageSeo): void {
    if (typeof window === 'undefined') return;

    const path = seo.path ?? this.currentPath();
    const canonical = this.absoluteUrl(path);
    const description = this.clamp(seo.description || this.defaultDescription, 160);
    const image = this.absoluteImage(seo.image);

    this.setTitle(seo.title);
    this.setMeta('name', 'description', description);
    this.setMeta('name', 'robots', this.robotsFor(path));
    this.setKeywords(seo.keywords);
    this.setCanonical(canonical);

    this.setMeta('property', 'og:type', seo.type ?? 'website');
    this.setMeta('property', 'og:site_name', 'GameMart');
    this.setMeta('property', 'og:title', this.doc.title);
    this.setMeta('property', 'og:description', description);
    this.setMeta('property', 'og:url', canonical);
    this.setMeta('property', 'og:image', image);
    this.setMeta('property', 'og:image:alt', this.doc.title);
    this.setMeta('property', 'og:locale', 'fr_FR');

    if (image === this.defaultImage) {
      this.setMeta('property', 'og:image:width', '1200');
      this.setMeta('property', 'og:image:height', '630');
    } else {
      this.removeMeta('property', 'og:image:width');
      this.removeMeta('property', 'og:image:height');
    }

    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', this.doc.title);
    this.setMeta('name', 'twitter:description', description);
    this.setMeta('name', 'twitter:image', image);
  }

  /** Injecte un JSON-LD Product complet (prix, stock, avis, note moyenne). */
  setProductJsonLd(game: Game, options: ProductJsonLdOptions = {}): void {
    if (typeof window === 'undefined' || !game) return;

    const url = options.url ? this.absoluteUrl(options.url) : this.siteUrl + gamePath(game);
    const images = this.productImages(game);
    const reviews = (options.reviews ?? [])
      .filter((review) => Number(review?.note) > 0)
      .slice(0, 5);
    const reviewCount = options.reviewCount ?? options.reviews?.length ?? 0;
    const averageRating = options.averageRating ?? this.computeAverageRating(options.reviews ?? []);
    const price = Number(game.price);
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const data: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: game.title,
      url,
      sku: `GM-${game.id}`,
      image: images,
      description: this.clamp(options.description || game.description || '', 500),
      brand: {
        '@type': 'Brand',
        name: 'GameMart'
      },
      category: game.genre,
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'TND',
        price: Number.isFinite(price) ? price.toFixed(2) : '0.00',
        priceValidUntil: validUntil.toISOString().slice(0, 10),
        availability:
          Number(game.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'GameMart',
          url: this.siteUrl + '/'
        }
      }
    };

    if (reviewCount > 0 && averageRating > 0) {
      data['aggregateRating'] = {
        '@type': 'AggregateRating',
        ratingValue: Number(averageRating.toFixed(1)),
        reviewCount,
        bestRating: 5,
        worstRating: 1
      };
    }

    if (reviews.length > 0) {
      data['review'] = reviews.map((review) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: Number(review.note) || 5,
          bestRating: 5,
          worstRating: 1
        },
        author: {
          '@type': 'Person',
          name: review.authorName || 'Joueur GameMart'
        },
        ...(review.date ? { datePublished: review.date } : {}),
        ...(review.msg ? { reviewBody: this.clamp(review.msg, 500) } : {})
      }));
    }

    this.setJsonLd('product-jsonld', data);
  }

  /** Injecte le fil d'Ariane structuré (BreadcrumbList). */
  setBreadcrumbJsonLd(items: BreadcrumbJsonLdItem[]): void {
    if (typeof window === 'undefined' || !items?.length) return;

    const data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: this.absoluteUrl(item.path)
      }))
    };

    this.setJsonLd('breadcrumb-jsonld', data);
  }

  /** Injecte la FAQ structurée et alignée avec la FAQ visible de la page. */
  setFaqJsonLd(items: FaqJsonLdItem[]): void {
    if (typeof window === 'undefined' || !items?.length) return;

    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    };

    this.setJsonLd('product-faq-jsonld', data);
  }

  /** Supprime les JSON-LD propres aux pages dynamiques. */
  clearProductJsonLd(): void {
    this.removeJsonLd('product-jsonld');
    this.removeJsonLd('product-faq-jsonld');
    this.removeJsonLd('breadcrumb-jsonld');
  }

  private applyRouteSeo(): void {
    const data = this.routeData();

    // Les pages catégorie / plateforme / promotions construisent un title et
    // une description dynamiques (nombre de jeux, genre réel...) dans le
    // composant `Produits` : on ne les écrase pas ici.
    const catalogMode = data['catalogMode'];
    if (catalogMode === 'genre' || catalogMode === 'platform' || catalogMode === 'promo') {
      return;
    }

    this.setPage({
      title: (data['title'] as string) || 'GameMart — Boutique de jeux vidéo en Tunisie',
      description: (data['description'] as string) || this.defaultDescription,
      keywords: data['keywords'] as string | string[] | undefined
    });
  }

  /** Fusionne les `data` de la route racine jusqu'à la route active. */
  private routeData(): Record<string, any> {
    const merged: Record<string, any> = {};
    let snapshot = this.router.routerState.root.snapshot;

    while (snapshot) {
      Object.assign(merged, snapshot.data || {});
      snapshot = snapshot.firstChild as any;
    }

    return merged;
  }

  private currentPath(): string {
    const url = this.router.url.split('?')[0].split('#')[0];
    return url && url !== '/' ? url.replace(/\/$/, '') : '/';
  }

  private robotsFor(path: string): string {
    const isPrivate = this.noindexPrefixes.some(
      (prefix) => path === prefix || path.startsWith(prefix + '/')
    );
    return isPrivate ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  }

  private setTitle(title: string): void {
    this.doc.title = title;
  }

  private setMeta(attribute: 'name' | 'property', key: string, content: string): void {
    let tag = this.doc.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;

    if (!tag) {
      tag = this.doc.createElement('meta');
      tag.setAttribute(attribute, key);
      this.doc.head.appendChild(tag);
    }

    tag.setAttribute('content', content);
  }

  private setKeywords(keywords?: string | string[]): void {
    const value = Array.isArray(keywords)
      ? keywords.filter(Boolean).join(', ')
      : (keywords || '').trim();

    if (!value) {
      this.removeMeta('name', 'keywords');
      return;
    }

    this.setMeta('name', 'keywords', value);
  }

  private removeMeta(attribute: 'name' | 'property', key: string): void {
    const tag = this.doc.head.querySelector(`meta[${attribute}="${key}"]`);
    if (tag) tag.remove();
  }

  private setCanonical(url: string): void {
    let link = this.doc.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private setJsonLd(id: string, data: unknown): void {
    this.removeJsonLd(id);

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  private removeJsonLd(id: string): void {
    const existing = this.doc.getElementById(id);
    if (existing) existing.remove();
  }

  private productImages(game: Game): string[] {
    const sources = [game.coverImage, ...(Array.isArray(game.images) ? game.images : [])];
    const images = sources
      .filter((src): src is string => typeof src === 'string' && src.trim().length > 0)
      .map((src) => this.absoluteImage(src));

    return Array.from(new Set(images));
  }

  private computeAverageRating(reviews: ProductReviewJsonLd[]): number {
    const notes = reviews.map((review) => Number(review?.note) || 0).filter((note) => note > 0);
    if (notes.length === 0) return 0;
    return notes.reduce((sum, note) => sum + note, 0) / notes.length;
  }

  private absoluteImage(image?: string): string {
    if (!image) return this.defaultImage;
    if (/^https?:\/\//i.test(image)) return image;
    return this.absoluteUrl(image);
  }

  private absoluteUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    return this.siteUrl + (path.startsWith('/') ? path : '/' + path);
  }

  private clamp(value: string, max: number): string {
    const clean = (value || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;

    const cut = clean.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(' ');

    // Coupe sur un mot entier pour éviter les « … » au milieu d'un mot dans la SERP
    return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
  }
}
