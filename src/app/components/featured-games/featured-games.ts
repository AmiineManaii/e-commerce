import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Game } from '../../Models/game.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-featured-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-games.html',
  styleUrl: './featured-games.scss'
})
export class FeaturedGamesComponent implements OnInit {
  games: Game[] = [];
  loading: boolean = true;
  error: string | null = null;

  // Expose Math to the template
  Math = Math;

  constructor(private gameService: GameService) {}

  getRoundedRating(rating: number | undefined): number {
    return Math.round(rating ?? 0);
  }

  ngOnInit(): void {
    this.loadFeaturedGames();
  }

  loadFeaturedGames(): void {
    this.loading = true;
    this.error = null;
    this.gameService.getPopularGames().subscribe({
      next: (games) => {
        this.games = games;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load games. Please try again later.';
        this.loading = false;
        console.error('Error loading featured games:', err);
      },
    });
  }
}
  

