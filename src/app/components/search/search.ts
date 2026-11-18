import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Game } from '../../Models/game.model';
import { GameService } from '../../services/game.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { GameImagePipe } from "../../pipes/game-image.pipe";
import { ImgFallbackDirective } from "../../directives/img-fallback.directive";
import { categoryPath, gamePath, slugify } from '../../utils/game-slug';


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer, GameImagePipe, ImgFallbackDirective],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent implements OnInit {
  searchTerm: string = '';
  games: Game[] = [];
  filteredGames: Game[] = [];
  categories: { label: string; path: string }[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private gameService: GameService, private analytics: AnalyticsService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = (params['q'] || '').trim();
      if (this.searchTerm) {
        this.analytics.trackEvent('search', { search_term: this.searchTerm });
      }
      this.gameService.getAllGames().subscribe(allGames => {
        this.games = allGames;
        this.categories = [...new Set(allGames.map(game => game.genre).filter(Boolean))]
          .slice(0, 10)
          .map(genre => ({ label: genre, path: categoryPath(genre) }));
        this.filterGames();
        if (this.searchTerm) {
          this.analytics.trackEvent('view_search_results', {
            search_term: this.searchTerm,
            items: this.filteredGames.map(g => ({
              item_id: g.id,
              item_name: g.title,
              item_category: g.genre,
              price: g.price
            }))
          });
        }
      });
    });
  }

  /**
   * Recherche tolérante : accents, casse, apostrophes et mots dans le désordre.
   * Le champ couvert inclut le titre, la description, le genre, la plateforme
   * et les tags — ce qui améliore fortement la pertinence par rapport à une
   * simple recherche sur le titre.
   */
  filterGames(): void {
    const tokens = this.normalize(this.searchTerm)
      .split(/\s+/)
      .filter(Boolean);

    if (tokens.length === 0) {
      this.filteredGames = this.games;
      return;
    }

    this.filteredGames = this.games.filter(game => {
      const haystack = this.normalize([
        game.title,
        game.description,
        game.genre,
        game.platform,
        ...(Array.isArray(game.tags) ? game.tags : []),
        game.release_date
      ].filter(Boolean).join(' '));

      return tokens.every(token => haystack.includes(token));
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  viewGameDetails(game: Game): void {
    if (game) {
      this.analytics.trackEvent('select_item', {
        item_list_name: 'Search results',
        items: [{
          item_id: game.id,
          item_name: game.title,
          item_category: game.genre,
          item_brand: game.platform,
          price: game.price
        }]
      });
    }
    this.router.navigateByUrl(game ? gamePath(game) : '/produits');
  }

  productPath(game: Game): string {
    return gamePath(game);
  }

  private normalize(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/['’`]/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
}
