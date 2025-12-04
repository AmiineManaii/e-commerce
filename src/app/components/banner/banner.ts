import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Game } from '../../Models/game.model';
import { GameService } from '../../services/game.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-banner',
  imports: [CommonModule, RouterLink],
  templateUrl: './banner.html',
  styleUrl: './banner.scss'
})
export class Banner implements OnInit {
  promoGames: Game[] = [];
  error: string = '';
  currentSlide: number = 0;
  private slideInterval: number | undefined; 

  constructor(
    private gameService: GameService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadPromoGames();
  }

  

  loadPromoGames(): void {
    this.gameService.getPromoGames().subscribe({
      next: (games) => {
        //console.log('Jeux en promotion reçus:', games);
        this.promoGames = games;
        if (this.promoGames.length > 1) {
          this.startAutoSlide();
        }
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des jeux en promotion';
        console.error('Erreur:', error);
      }
    });
  }

  startAutoSlide(): void {
    
    this.slideInterval = window.setInterval(() => {
      this.nextSlide();
    }, 5000); 
  }

  

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.promoGames.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.promoGames.length) % this.promoGames.length;
  }

  

  

  addToCart(game: Game): void {
    this.cartService.addToCart(game, 1).subscribe({
      next: () => {
        alert('Ajouté au panier: ' + game.title);
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout au panier:', error);
        alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
      }
    });
  }
}