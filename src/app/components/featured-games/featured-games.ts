import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Game } from '../../Models/game.model';

@Component({
  selector: 'app-featured-games',
  imports: [CommonModule],
  templateUrl: './featured-games.html',
  styleUrl: './featured-games.scss'
})
export class FeaturedGames implements OnInit {
  games: Game[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.loadFeaturedGames();
  }

  loadFeaturedGames(): void {
    this.loading = true;
    this.gameService.getPopularGames().subscribe({
      next: (games) => {
        this.games = games;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des jeux';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

 
  addToCart(game: Game): void {
    console.log('Ajouter au panier:', game.title);
    
  }
}
