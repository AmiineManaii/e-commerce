import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private router = inject(Router);
  private gaId = environment.googleAnalyticsId;
  private gtmId = environment.googleTagManagerId;

  init(): void {
    if (typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];

    if (this.gaId) {
      window.gtag =
        window.gtag ||
        function (...args: any[]) {
          window.dataLayer.push(args);
        };
    }

    // Premier page view (chargement initial)
    this.trackPageView(this.router.url || '/');

    // Page views suivants (navigation SPA)
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.trackPageView(e.urlAfterRedirects);
      });
  }

  trackPageView(path: string): void {
    if (typeof window === 'undefined') return;

    if (this.gaId && typeof window.gtag === 'function') {
      window.gtag('config', this.gaId, { page_path: path });
    }

    if (this.gtmId) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: path,
        page_location: window.location.origin + path,
        page_title: document.title
      });
    }
  }

  trackEvent(name: string, params?: Record<string, any>): void {
    if (typeof window === 'undefined') return;

    const payload: Record<string, any> = { ...(params || {}) };

    // GA4 n'affiche pas le tableau `items` dans l'aperçu temps réel.
    // On ajoute donc aussi le nom/id du jeu en paramètres "plats" pour les voir directement.
    const items = payload['items'];
    if (Array.isArray(items) && items.length > 0) {
      payload['item_name'] = this.truncate(
        items.map((i: any) => i?.item_name).filter(Boolean).join(', ')
      );
      payload['item_id'] = this.truncate(
        items.map((i: any) => i?.item_id).filter((v: any) => v !== undefined && v !== null).join(', ')
      );
    }

    if (this.gaId && typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
    }

    if (this.gtmId) {
      window.dataLayer.push({ event: name, ...payload });
    }
  }

  private truncate(value: string, max = 100): string {
    return value.length > max ? value.slice(0, max) : value;
  }
}
