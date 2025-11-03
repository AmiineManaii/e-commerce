import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Order, User } from '../../../Models/user.model';
import { UserProfileService } from '../../../services/user-profile.service';
import { AuthService } from '../../../services/auth.service';
import { GameService } from '../../../services/game.service';
import { Observable, of } from 'rxjs';
import { Game } from '../../../Models/game.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  currentUser: User | null = null;
  games: Game[] = [];
  loading = true;
  error = '';


  constructor(private userProfileService: UserProfileService, private authService: AuthService,private gameService: GameService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.currentUser.id) {
      this.error = 'Utilisateur non authentifié';
      this.loading = false;
      return;
    }
    
    this.userProfileService.getOrders(this.currentUser.id).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
        console.error(err);
      }
    });
    this.loadgames();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }



  loadgames() {
    this.gameService.getAllGames().subscribe({
      next: (games) => {
        this.games = games;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des jeux :', err);
      }
    });
  }
  getGameTitle(gameId: number) {
    return this.games.find(game => game.id === gameId)?.title || '';
  }
}