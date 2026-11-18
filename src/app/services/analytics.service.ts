import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/** Paramètres e-commerce reconnus par GA4 dans l'objet `ecommerce`. */
const ECOMMERCE_KEYS = [
  'currency',
  'value',
  'transaction_id',
  'shipping',
  'tax',
  'coupon',
  'payment_type',
  'shipping_tier',
  'items'
];

/**
 * Centralise l'envoi des événements vers Google Analytics 4 (gtag.js) et
 * Google Tag Manager (dataLayer).
 *
 * - GA4 direct : `gtag('event', ...)`.
 * - GTM : événement poussé dans `dataLayer` avec un objet `ecommerce`
 *   conforme au format recommandé par Google, exploitable par une balise
 *   GA4 « Événement » ou par Google Ads / remarketing.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private router = inject(Router);
  private gaId = environment.googleAnalyticsId;
  private gtmId = environment.googleTagManagerId;
  private started = false;
  private currentPagePath = '';
  private pageViewTimer: ReturnType<typeof setTimeout> | undefined;

  init(): void {
    if (typeof window === 'undefined' || this.started) return;
    this.started = true;

    window.dataLayer = window.dataLayer || [];

    // Filet de sécurité lorsque gtag.js n'est pas chargé par index.html.
    if (this.gaId && typeof window.gtag !== 'function') {
      window.gtag = (...args: any[]) => {
        window.dataLayer.push(args);
      };
    }

    // Le premier page_view est envoyé par l'événement NavigationEnd de la
    // navigation initiale (évite un page_view "/" erroné sur les liens profonds).
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.clearPageViewTimer());

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const url = (e.urlAfterRedirects || '/').split('?')[0].split('#')[0];

        // Ancienne URL produit : redirigée immédiatement vers /produits/<slug>,
        // inutile de compter une vue sur une URL obsolète.
        if (url.startsWith('/produitDetails')) return;

        // Pages dont le title est défini après chargement des données (produit,
        // catégorie, plateforme, promotions) : le composant envoie lui-même le
        // page_view avec le vrai titre. Un délai de secours garantit qu'une vue
        // est comptée même si l'API est lente.
        if (this.isDynamicPage(url)) {
          this.schedulePageView(url, 1200);
          return;
        }

        this.trackPageView(url);
      });
  }

  /** Routes dont le SEO (et donc le titre) dépend de données chargées en async. */
  private isDynamicPage(url: string): boolean {
    return (
      /^\/produits\/[^/]+/.test(url) ||
      url.startsWith('/categorie/') ||
      url.startsWith('/plateforme/') ||
      url === '/promotions'
    );
  }

  private schedulePageView(path: string, delay: number): void {
    this.clearPageViewTimer();
    this.pageViewTimer = setTimeout(() => this.trackPageView(path), delay);
  }

  private clearPageViewTimer(): void {
    if (this.pageViewTimer !== undefined) {
      clearTimeout(this.pageViewTimer);
      this.pageViewTimer = undefined;
    }
  }

  trackPageView(path: string): void {
    if (typeof window === 'undefined') return;

    const pagePath = path || '/';
    if (pagePath === this.currentPagePath) return;

    this.clearPageViewTimer();
    this.currentPagePath = pagePath;

    const payload = {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title
    };

    if (this.gaId && typeof window.gtag === 'function') {
      // `send_page_view: false` est configuré dans index.html : on gère donc
      // nous-mêmes les page_view pour éviter tout double comptage en SPA.
      window.gtag('event', 'page_view', payload);
    }

    if (window.dataLayer) {
      window.dataLayer.push({ event: 'page_view', ...payload });
    }
  }

  /**
   * Envoie un événement e-commerce (GA4 + GTM).
   *
   * @param name Nom de l'événement GA4 (`add_to_cart`, `remove_from_cart`,
   *             `begin_checkout`, `purchase`, `add_review`, ...).
   * @param params Paramètres GA4, avec éventuellement un tableau `items`.
   */
  trackEvent(name: string, params?: Record<string, any>): void {
    if (typeof window === 'undefined') return;

    const payload: Record<string, any> = { ...(params || {}) };

    // GA4 n'affiche pas toujours le tableau `items` dans l'aperçu temps réel.
    // On ajoute donc aussi le nom/id du jeu en paramètres "plats" pour les voir
    // directement dans les rapports et dans GTM Preview.
    const items = payload['items'];
    if (Array.isArray(items) && items.length > 0) {
      payload['item_name'] = this.truncate(
        items.map((i: any) => i?.item_name).filter(Boolean).join(', ')
      );
      payload['item_id'] = this.truncate(
        items
          .map((i: any) => i?.item_id)
          .filter((v: any) => v !== undefined && v !== null)
          .join(', ')
      );
    }

    if (this.gaId && typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
    }

    if (!window.dataLayer) window.dataLayer = [];

    const ecommerce = this.buildEcommerce(payload);
    if (ecommerce) {
      // Réinitialise l'objet e-commerce pour éviter que GTM ne réutilise
      // les items d'un événement précédent.
      window.dataLayer.push({ ecommerce: null });
    }

    window.dataLayer.push({
      event: name,
      ...payload,
      ...(ecommerce ? { ecommerce } : {})
    });
  }

  /** Indique si GTM est configuré (utile pour l'affichage conditionnel). */
  hasTagManager(): boolean {
    return !!this.gtmId;
  }

  /** Indique si GA4 direct est configuré. */
  hasAnalytics(): boolean {
    return !!this.gaId;
  }

  private buildEcommerce(payload: Record<string, any>): Record<string, any> | null {
    const items = payload['items'];
    if (!Array.isArray(items) || items.length === 0) return null;

    const ecommerce: Record<string, any> = {
      currency: payload['currency'] || 'TND'
    };

    for (const key of ECOMMERCE_KEYS) {
      if (key === 'currency') continue;
      if (payload[key] !== undefined && payload[key] !== null) {
        ecommerce[key] = payload[key];
      }
    }

    if (ecommerce['value'] === undefined) {
      ecommerce['value'] = items.reduce(
        (sum: number, item: any) =>
          sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1),
        0
      );
    }

    return ecommerce;
  }

  private truncate(value: string, max = 100): string {
    return value.length > max ? value.slice(0, max) : value;
  }
}
