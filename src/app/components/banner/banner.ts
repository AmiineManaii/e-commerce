import { Component, OnInit } from '@angular/core';
import { Game } from '../../Models/game.model';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.scss'
})
export class Banner implements OnInit{
  promoGames: Game[] = [];
  error: string = '';
  currentSlide: number = 0;
  private slideInterval: any;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.loadPromoGames();
  }



  loadPromoGames(): void {
    this.gameService.getPromoGames().subscribe({
      next: (games) => {
        this.promoGames = games;
        console.log(this.promoGames);
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
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // 5 secondes
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.promoGames.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.promoGames.length) % this.promoGames.length;
  }
}
