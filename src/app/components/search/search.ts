import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../../Models/game.model';
import { GameService } from '../../services/game.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { GameImagePipe } from "../../pipes/game-image.pipe";
import { ImgFallbackDirective } from "../../directives/img-fallback.directive";


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, Header, Footer, GameImagePipe, ImgFallbackDirective],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent implements OnInit {
  searchTerm: string = '';
  games: Game[] = [];
  filteredGames: Game[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private gameService: GameService, private analytics: AnalyticsService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'];
      if (this.searchTerm) {
        this.analytics.trackEvent('search', { search_term: this.searchTerm });
      }
      this.gameService.getAllGames().subscribe(allGames => {
        this.games = allGames;
        this.filterGames();
        if (this.searchTerm) {
          this.analytics.trackEvent('view_search_results', {
            search_term: this.searchTerm,
            items: this.filteredGames.map(g => ({ item_id: g.id, item_name: g.title }))
          });
        }
      });
    });
  }

  filterGames(): void {

    if (this.searchTerm!== '') {

      this.filteredGames = this.games.filter(game =>

        game.title.toLowerCase().includes(this.searchTerm!.toLowerCase()) ||
        (game.description.toLowerCase().includes(this.searchTerm!.toLowerCase()))
      );
    } else {
      this.filteredGames = this.games;
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  viewGameDetails(id: number): void {
    const game = this.filteredGames.find(g => g.id === id);
    if (game) {
      this.analytics.trackEvent('select_item', {
        item_list_name: 'Search results',
        items: [{ item_id: game.id, item_name: game.title }]
      });
    }
    this.router.navigate(['/produitDetails', id]);
  }
}

