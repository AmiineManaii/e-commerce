import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../services/game.service';
import { Game } from '../Models/game.model';
import { CommonModule } from '@angular/common';
import { Header } from "../components/header/header";
import { Footer } from "../components/footer/footer";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-produit-details',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterLink],
  templateUrl: './produit-details.html',
  styleUrl: './produit-details.scss'
})
export class ProduitDetailsComponent implements OnInit {
  produit: Game | undefined;
  error: string = '';
  currentImageIndex: number = 0;
  private slideshowInterval: any;
  trailerUrl: SafeResourceUrl | undefined;
  similarProducts: Game[] = [];

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.gameService.getGameById(id).subscribe({
          next: (game) => {
            this.produit = game;
            if (this.produit && this.produit.images && this.produit.images.length > 0) {
              this.startSlideshow();
               }
            if (this.produit && this.produit.url_trailer) {
               this.trailerUrl = this.getYouTubeEmbedUrl(this.produit.url_trailer);
             }
            this.loadSimilarProducts();
          },
          error: (err) => {
            this.error = 'Failed to load product details.';
            console.error('Error loading product details:', err);
          }
        });
      } else {
        this.error = 'Product ID not provided.';
      }
    });
  }

  loadSimilarProducts(): void {
    if (this.produit && this.produit.tags && this.produit.tags.length > 0) {
      this.gameService.getAllGames().subscribe({
        next: (allGames) => {
          this.similarProducts = allGames.filter(game =>
            game.id !== this.produit!.id &&
            game.tags &&
            game.tags.some(tag => this.produit!.tags!.includes(tag))
          );
        },
        error: (err) => {
          console.error('Error loading similar products:', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  changeImage(direction: number): void {
    if (this.produit && this.produit.images && this.produit.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + direction + this.produit.images.length) % this.produit.images.length;
      this.stopSlideshow();
      this.startSlideshow();
    }
  }

  startSlideshow(): void {
    this.stopSlideshow();
    this.slideshowInterval = setInterval(() => {
      this.changeImage(1);
    }, 5000); 
  }

  stopSlideshow(): void {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
   
    let videoId: string | undefined;
    const regExp = /^(?:https?:\/\/(?:www\.)?youtube\.com\/watch\?v=|https?:\/\/(?:www\.)?youtu\.be\/)([a-zA-Z0-9_-]+)(?:&.*)?$/;
    
    
    const match = url.match(regExp);

    if (match && match[1]) {
      videoId = match[1];
    } 

    if (videoId) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;


      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {

       return this.sanitizer.bypassSecurityTrustResourceUrl(''); 
      
      }
  }

  addToCart(quantity: number): void {
    if (this.produit) {
      console.log(`Added ${quantity} of ${this.produit.title} to cart.`);
      // Here you would typically add logic to interact with a cart service
    }
  }
}
