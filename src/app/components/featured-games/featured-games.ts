import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Game } from '../../Models/game.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-featured-games',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-games.html',
  styleUrl: './featured-games.scss'
})
export class FeaturedGamesComponent implements OnInit {
  games: Game[] = [];
  loading: boolean = true;
  error: string | null = null;


  constructor(private gameService: GameService) {}

  

  ngOnInit(): void {
    this.loadFeaturedGames();
  }

  loadFeaturedGames(): void {
    this.gameService.getPopularGames().subscribe({
      next: (games) => {
        this.games = games;
      },
      error: (err) => {
        this.error = 'Failed to load games. Please try again later.';

        console.error('Error loading featured games:', err);
      },
    });
  }
  
}
  

