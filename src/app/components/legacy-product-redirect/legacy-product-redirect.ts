import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { gamePath } from '../../utils/game-slug';

/**
 * Redirection des anciennes URLs `/produitDetails/:id` vers les nouvelles URLs
 * SEO `/produits/<slug>`.
 *
 * Ces anciennes URLs ont pu être indexées par Google : on les conserve donc en
 * redirection permanente côté client (avec `replaceUrl` pour ne pas polluer
 * l'historique). Elles sont également exclues de l'indexation côté robots.txt.
 */
@Component({
  selector: 'app-legacy-product-redirect',
  standalone: true,
  template: `
    <div class="legacy-redirect" role="status" aria-live="polite">
      <p>Redirection vers la fiche produit…</p>
    </div>
  `,
  styles: [
    `
      .legacy-redirect {
        min-height: 50vh;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #d0d0d0;
        font-size: 1rem;
      }
    `
  ]
})
export class LegacyProductRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');

    if (!param) {
      this.router.navigate(['/produits'], { replaceUrl: true });
      return;
    }

    this.gameService.getGameBySlug(param).subscribe({
      next: (game) => {
        this.router.navigateByUrl(gamePath(game), { replaceUrl: true });
      },
      error: () => {
        this.router.navigate(['/produits'], { replaceUrl: true });
      }
    });
  }
}
