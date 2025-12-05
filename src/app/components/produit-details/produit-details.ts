import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { GameService } from '../../services/game.service';
import { ReviewService } from '../../services/review.service';
import { UserProfileService } from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Game } from '../../Models/game.model';
import { User } from '../../Models/user.model';
import { Review } from '../../Models/review';

@Component({
  selector: 'app-produit-details',
  standalone: true,
  imports: [CommonModule, Header, Footer, FormsModule, RouterLink],
  templateUrl: './produit-details.html',
  styleUrl: './produit-details.scss'
})
export class ProduitDetailsComponent implements OnInit {
  produit?: Game;
  currentUser: User | null = null;
  token: string | null = null;
  similarProducts: Game[] = [];
  reviews: Review[] = [];
  error = '';
  currentImageIndex = 0;
  quantity = 1;
  averageRating = 0;
  isSubmitting = false;
  trailerUrl?: SafeResourceUrl;
  userNames = new Map<string, string>();
  newReview = { note: 5, msg: '' };
  private slideshowInterval: any;
  private platformIcons: { [key: string]: string } = {
    'PC': 'fas fa-desktop',
    'PlayStation 5': 'fab fa-playstation',
    'PlayStation 4': 'fab fa-playstation',
    'Xbox': 'fab fa-xbox',
    'Xbox One': 'fab fa-xbox',
    'Nintendo Switch': 'fas fa-gamepad',
    'Mobile': 'fas fa-mobile-alt'
  };

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private reviewService: ReviewService,
    private sanitizer: DomSanitizer,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()?.user || null;
    this.token = this.authService.getCurrentUser()?.token || null;
    this.loadProduct();
  }

  private loadProduct(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.error = 'ID du produit non fourni.';
        return;
      }
      this.gameService.getGameById(id).subscribe({
        next: (game) => this.handleProductLoad(game),
        error: (err) => this.handleProductError(err)
      });
    });
  }

  private handleProductLoad(game: Game): void {
    this.produit = game;

    if (this.produit?.images?.length) {
      this.startSlideshow();
    }

    if (this.produit?.url_trailer) {
      this.trailerUrl = this.getYouTubeEmbedUrl(this.produit.url_trailer);
    }

    this.loadSimilarProducts();
    this.loadReviews();
  }

  private handleProductError(err: any): void {
    this.error = 'Échec du chargement des détails du produit.';
    console.error('Error loading product:', err);
  }

  private loadReviews(): void {
    if (!this.produit) return;

    this.reviewService.getReviewsByGameId(this.produit.id.toString()).subscribe({
      next: (reviews) => {
        this.reviews = reviews || [];
        this.calculateAverageRating();
        this.loadUserNames();
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.reviews = [];
      }
    });
  }

  private loadUserNames(): void {
    if (!this.reviews || this.reviews.length === 0) return;

    const uniqueUserIds = [...new Set(
      this.reviews
        .filter(review => review.userId)
        .map(review => review.userId.toString())
    )];

    const token = this.authService.getCurrentUser()?.token || null;

    uniqueUserIds.forEach(userId => {
      if (!this.userNames.has(userId)) {
        this.authService.getUsername(userId, token!!).subscribe({
          next: (user) => {
            if (user) {
              this.userNames.set(userId, `${user.prenom} ${user.nom}`);
            }
          },
          error: () => {
            this.userNames.set(userId, 'Utilisateur inconnu');
          }
        });
      }
    });
  }

  getDisplayName(userId: string): string {
    return this.userNames.get(userId) || 'Utilisateur inconnu';
  }

  private calculateAverageRating(): void {
    if (!this.reviews || this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const total = this.reviews.reduce((sum, review) => sum + review.note, 0);
    this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
  }

  submitReview(form: NgForm): void {
    if (!this.currentUser?.id || !this.produit || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const reviewData: Omit<Review, 'id'> = {
      gameId: this.produit.id,
      userId: this.currentUser.id,
      msg: this.newReview.msg,
      note: this.newReview.note,
      date: new Date().toISOString(),
      verified: true
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: (newReview) => {
        // Mettre à jour la liste des reviews
        this.reviews = [newReview, ...this.reviews];
        this.calculateAverageRating();

        // Mettre à jour le nom d'utilisateur
        if (newReview.userId) {
          this.userNames.set(
            newReview.userId.toString(),
            `${this.currentUser!.prenom} ${this.currentUser!.nom}`
          );
        }

        // Réinitialiser le formulaire
        this.newReview = { note: 5, msg: '' };
        form.resetForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error creating review:', err);
        alert('Erreur lors de la publication. Veuillez réessayer.');
        this.isSubmitting = false;
      }
    });
  }

  private loadSimilarProducts(): void {
    if (!this.produit) return;

    this.gameService.getAllGames().subscribe({
      next: (games) => {
        this.similarProducts = games
          .filter(game => this.isSimilarGame(game))
          .slice(0, 8);
      },
      error: (err) => console.error('Error loading similar products:', err)
    });
  }

  private isSimilarGame(game: Game): boolean {
    if (!this.produit) return false;
    return game.id !== this.produit.id &&
          (game.genre === this.produit.genre ||
           this.hasCommonTags(game));
  }

  private hasCommonTags(game: Game): boolean {
    if (!this.produit || !this.produit.tags) return false;
    return !!(game.tags && this.produit.tags &&
             game.tags.some(tag => this.produit!!.tags!.includes(tag)));
  }

  changeImage(direction: number): void {
    if (!this.produit?.images?.length) return;
    this.currentImageIndex = (this.currentImageIndex + direction + this.produit.images.length) % this.produit.images.length;
    this.restartSlideshow();
  }

  private startSlideshow(): void {
    this.stopSlideshow();
    if (this.produit?.images && this.produit.images.length > 1) {
      this.slideshowInterval = setInterval(() => this.changeImage(1), 5000);
    }
  }

  private restartSlideshow(): void {
    this.stopSlideshow();
    this.startSlideshow();
  }

  private stopSlideshow(): void {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  private getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    const videoId = match?.[1];

    if (!videoId) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
    );
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
    if (!this.produit) return;
    if (this.quantity < 1) this.quantity = 1;
    if (this.quantity > this.produit.stock) this.quantity = this.produit.stock;
  }

  addToCart(product?: Game): void {
    const targetProduct = product || this.produit;
    if (!targetProduct) return;

    this.cartService.addToCart(targetProduct, this.quantity).subscribe({
      next: () => alert('Produit ajouté au panier !'),
      error: (error) => {
        console.error('Cart error:', error);
        alert('Erreur lors de l\'ajout au panier.');
      }
    });
  }

  addToWishlist(): void {
    if (!this.currentUser?.id) {
      alert('Connectez-vous pour ajouter aux favoris');
      return;
    }

    if (!this.produit) return;

    this.userProfileService.addToWishlist(
      this.currentUser.id.toString(),
      this.produit.id.toString()
    ).subscribe({
      next: () => alert('Ajouté aux favoris !'),
      error: (err) => {
        console.error('Wishlist error:', err);
        alert('Erreur lors de l\'ajout aux favoris.');
      }
    });
  }

  setRating(rating: number): void {
    this.newReview.note = rating;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getStarClass(starIndex: number, rating: number): string {
    if (starIndex <= Math.floor(rating)) return 'fa-star';
    if (starIndex === Math.ceil(rating) && rating % 1 >= 0.5) return 'fa-star-half-alt';
    return 'far fa-star';
  }

  getPlatformIcon(platform: string): string {
    return this.platformIcons[platform] || 'fas fa-gamepad';
  }
}
