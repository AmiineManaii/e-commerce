import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface PageSeo {
  /** Titre affiché dans l'onglet et dans les résultats Google. */
  title: string;
  /** Meta description (environ 150-160 caractères). */
  description: string;
  /** Image de partage (Open Graph / Twitter). */
  image?: string;
  /** Chemin canonique explicite (sinon l'URL courante est utilisée). */
  path?: string;
  /** Type Open Graph : `website` (défaut) ou `product`. */
  type?: 'website' | 'product';
}

/**
 * Gère les balises SEO de la SPA : title, meta description, robots,
 * canonical, Open Graph et Twitter Card.
 *
 * Sans ce service, toutes les routes partageraient le même title défini
 * dans index.html — ce qui provoque des titles dupliqués aux yeux de Google.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private doc = inject(DOCUMENT);
  private router = inject(Router);

  private readonly siteUrl = 'https://gamemarttn.netlify.app';
  private readonly defaultImage = this.siteUrl + '/assets/og/gamemart-og.jpg';
  private readonly defaultDescription =
    "GameMart, votre boutique en ligne de jeux vidéo en Tunisie : jeux PC, PlayStation 5, Xbox et Nintendo Switch au meilleur prix.";

  private started = false;

  /** Routes privées ou sans intérêt SEO : exclues de l'indexation. */
  private readonly noindexPrefixes = [
    '/cart',
    '/checkout',
    '/order-confirmation',
    '/user',
    '/login',
    '/register',
    '/search'
  ];

  init(): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;

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
    const canonical = this.siteUrl + path;
    const description = this.clamp(seo.description || this.defaultDescription, 160);
    const image = this.absoluteImage(seo.image);

    this.setTitle(seo.title);
    this.setMeta('name', 'description', description);
    this.setMeta('name', 'robots', this.robotsFor(path));
    this.setCanonical(canonical);

    this.setMeta('property', 'og:type', seo.type ?? 'website');
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

  /** Injecte un JSON-LD Product pour la fiche produit courante. */
  setProductJsonLd(game: any): void {
    if (typeof window === 'undefined' || !game) return;

    const data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: game.title,
      image: [this.absoluteImage(game.coverImage)],
      description: this.clamp(game.description || '', 300),
      brand: {
        '@type': 'Brand',
        name: 'GameMart'
      },
      category: game.genre,
      offers: {
        '@type': 'Offer',
        url: this.siteUrl + '/produitDetails/' + game.id,
        priceCurrency: 'TND',
        price: Number(game.price).toFixed(2),
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'GameMart'
        }
      }
    };

    this.removeJsonLd('product-jsonld');

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'product-jsonld';
    script.textContent = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  /** Supprime le JSON-LD produit (appelé sur les autres pages). */
  clearProductJsonLd(): void {
    this.removeJsonLd('product-jsonld');
  }

  private applyRouteSeo(): void {
    const data = this.routeData();

    this.clearProductJsonLd();

    this.setPage({
      title: (data['title'] as string) || 'GameMart — Boutique de jeux vidéo en Tunisie',
      description: (data['description'] as string) || this.defaultDescription
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

  private removeJsonLd(id: string): void {
    const existing = this.doc.getElementById(id);
    if (existing) existing.remove();
  }

  private absoluteImage(image?: string): string {
    if (!image) return this.defaultImage;
    if (image.startsWith('http')) return image;
    return this.siteUrl + (image.startsWith('/') ? image : '/' + image);
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
