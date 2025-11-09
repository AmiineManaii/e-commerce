import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Game } from '../../Models/game.model';
import { CommonModule } from '@angular/common';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { User } from '../../Models/user.model';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-produit-details',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterLink, FormsModule],
  templateUrl: './produit-details.html',
  styleUrl: './produit-details.scss'
})
export class ProduitDetailsComponent implements OnInit {
  produit: Game | undefined;
  currentUser: User | null = null;
  error: string = '';
  currentImageIndex: number = 0;
  private slideshowInterval: any;
  trailerUrl: SafeResourceUrl | undefined;
  similarProducts: Game[] = [];
  quantity: number = 1;
  
  @ViewChild('similarProductsScroll') similarProductsScroll!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private sanitizer: DomSanitizer,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
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
            this.error = 'Échec du chargement des détails du produit.';
            console.error('Error loading product details:', err);
          }
        });
      } else {
        this.error = 'ID du produit non fourni.';
      }
    });
  }

  loadSimilarProducts(): void {
    if (this.produit) {
      this.gameService.getAllGames().subscribe({
        next: (allGames) => {
          this.similarProducts = allGames.filter(game =>
            game.id !== this.produit!.id &&
            (game.genre === this.produit!.genre || 
             (game.tags && this.produit!.tags && 
              game.tags.some(tag => this.produit!.tags!.includes(tag))))
          ).slice(0, 8);
        },
        error: (err) => {
          console.error('Error loading similar products:', err);
        }
      });
    }
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
    if (this.produit && this.produit.images && this.produit.images.length > 1) {
      this.slideshowInterval = setInterval(() => {
        this.changeImage(1);
      }, 5000);
    }
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
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
  }

  increaseQuantity(): void {
    if (this.produit && this.quantity < this.produit.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  validateQuantity(): void {
    if (this.produit) {
      if (this.quantity < 1) {
        this.quantity = 1;
      }
      if (this.quantity > this.produit.stock) {
        this.quantity = this.produit.stock;
      }
    }
  }

  scrollSimilar(direction: number): void {
    if (this.similarProductsScroll) {
      const scrollContainer = this.similarProductsScroll.nativeElement;
      const scrollAmount = 300;
      scrollContainer.scrollLeft += direction * scrollAmount;
    }
  }

  addToCart(quantity: number): void {
    if (this.produit) {
      this.cartService.addToCart(this.produit, quantity).subscribe({
        next: () => {
          alert('Produit ajouté au panier avec succès!');
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout au panier:', error);
          alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
        }
      });
    }
  }

  addSimilarToCart(product: Game, quantity: number): void {
    this.cartService.addToCart(product, quantity).subscribe({
      next: () => {
        alert('Produit ajouté au panier avec succès!');
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout au panier:', error);
        alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
      }
    });
  }


  addToWishlist(): void {
    if (!this.currentUser?.id) {
      alert('Vous devez etre connecte pour ajouter a la liste de souhaits');
    }
    
    if (!this.produit) { 
      alert('Produit non disponible.');
      return;
    }
    if(this.currentUser?.id){
      this.userProfileService.addToWishlist(this.currentUser.id, this.produit.id).subscribe({
        next: () => {
          alert('Produit ajoute a la liste de souhaits avec succes');
        },
       error: (err) => {
          alert('Erreur ajout a la liste de souhaits');
          console.error(err);
        }
      });

    }
   
  } 

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, index) => index + 1);
  }

  getStarType(starIndex: number, rating: number): string {
    if (starIndex <= Math.floor(rating)) {
      return 'full';
    } else if (starIndex === Math.ceil(rating) && rating % 1 >= 0.5) {
      return 'half';
    } else {
      return 'empty';
    }
  }




  getPlatformIcon(platform: string): string {
    const platformIcons: { [key: string]: string } = {
      'PC': 'fas fa-desktop',
      'PlayStation 5': 'fab fa-playstation',
      'PlayStation 4': 'fab fa-playstation',
      'Xbox': 'fab fa-xbox',
      'Xbox One': 'fab fa-xbox',
      'Nintendo Switch': 'fas fa-gamepad',
      'Mobile': 'fas fa-mobile-alt'
    };
    
    return platformIcons[platform] || 'fas fa-gamepad';
  }
}