import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProfileService } from '../../../services/user-profile.service';
import { GameService } from '../../../services/game.service';
import { Game } from '../../../Models/game.model';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../Models/user.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.scss']
})
export class WishlistComponent implements OnInit {
  wishlistItems: Game[] = [];
  user:User|null = null;
  token:string|null = null;

  loading = true;
  error = '';

  constructor(
    private userProfileService: UserProfileService,
    private gameService: GameService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.error = '';
    this.user=this.authService.getCurrentUser()!!.user;
    this.token=this.authService.getCurrentUser()!!.token;

    if (!this.user || !this.user.id) {
      this.error = 'Utilisateur non authentifié';
      this.loading = false;
      return;
    }

    this.userProfileService.getWishlist(this.user.id.toString()).subscribe({
      next: (gameIds) => {
        if (gameIds.length === 0) {
          this.wishlistItems = [];
          this.loading = false;
          return;
        }

        this.loadGameDetails(gameIds.map(id => Number(id)));
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la liste de souhaits';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadGameDetails(gameIds: number[]): void {
    const games: Game[] = [];
    let completedRequests = 0;

    gameIds.forEach(gameId => {
      this.gameService.getGameById(gameId.toString()).subscribe({
        next: (game) => {
          if (game) {
            games.push(game);
          }
          completedRequests++;

          // Quand toutes les requêtes sont terminées
          if (completedRequests === gameIds.length) {
            this.wishlistItems = games;
            this.loading = false;
          }
        },
        error: (err) => {
          console.error(`Erreur lors du chargement du jeu ${gameId}:`, err);
          completedRequests++;


          if (completedRequests === gameIds.length) {
            this.wishlistItems = games;
            this.loading = false;
            
            if (games.length === 0) {
              this.error = 'Erreur lors du chargement des jeux favoris';
            }
          }
        }
      });
    });
  }

  removeFromWishlist(gameId: string): void {
    if (!this.user || !this.user.id) {
      this.error = 'Utilisateur non authentifié';
      return;
    }
    this.userProfileService.removeFromWishlist(this.user.id.toString(),gameId.toString()).subscribe({
      next: () => {
        this.wishlistItems = this.wishlistItems.filter(game => game.id !== gameId.toString());
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du jeu de la liste de souhaits:', err);
      }
    });
  }
}