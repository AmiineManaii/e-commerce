import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalyticsService } from './services/analytics.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('e-commerce');
  private analytics = inject(AnalyticsService);
  private seo = inject(SeoService);

  ngOnInit(): void {
    // SEO d'abord : le title doit être à jour avant l'envoi du page_view
    this.seo.init();
    this.analytics.init();
  }
}
