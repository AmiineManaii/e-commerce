import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { AnalyticsService } from '../../services/analytics.service';
import { SeoService } from '../../services/seo.service';
import { ProductContent, ProductContentService } from '../../services/product-content.service';
import { Game } from '../../Models/game.model';
import { User } from '../../Models/user.model';
import { Review } from '../../Models/review';
import { GameImagePipe } from '../../pipes/game-image.pipe';
import { ImgFallbackDirective } from '../../directives/img-fallback.directive';
import { gamePath, slugify } from '../../utils/game-slug';

@Component({
  selector: 'app-produit-details',
  standalone: true,
  imports: [CommonModule, Header, Footer, FormsModule, RouterLink, GameImagePipe, ImgFallbackDirective],
  templateUrl: './produit-details.html',
  styleUrl: './produit-details.scss'
})
export class ProduitDetailsComponent implements OnInit, OnDestroy {
  produit?: Game;
  content?: ProductContent;
  currentUser: User | null = null;
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
    private cartService: CartService,
    private analytics: AnalyticsService,
    private seo: SeoService,
    private productContent: ProductContentService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  /** La fiche répond à `/produits/:slug` (ex. `/produits/gta_v`). */
  private loadProduct(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || params.get('id');
      if (!slug) {
        this.error = 'Référence du produit non fournie.';
        return;
      }

      this.resetProductState();

      this.gameService.getGameBySlug(slug).subscribe({
        next: (game) => this.handleProductLoad(game),
        error: (err) => this.handleProductError(err)
      });
    });
  }

  private resetProductState(): void {
    this.stopSlideshow();
    this.produit = undefined;
    this.content = undefined;
    this.similarProducts = [];
    this.reviews = [];
    this.userNames.clear();
    this.averageRating = 0;
    this.currentImageIndex = 0;
    this.quantity = 1;
    this.trailerUrl = undefined;
    this.error = '';
  }

  private handleProductLoad(game: Game): void {
    this.produit = game;
    this.content = this.productContent.build(game);

    this.applySeo();

    this.analytics.trackEvent('view_item', {
      currency: 'TND',
      value: game.price,
      item_list_name: 'Fiche produit',
      items: [{
        item_id: game.id,
        item_name: game.title,
        item_category: game.genre,
        item_brand: game.platform,
        price: game.price,
        quantity: 1
      }]
    });

    if (this.produit.images?.length) {
      this.startSlideshow();
    }

    if (this.produit.url_trailer) {
      const trailer = this.getYouTubeEmbedUrl(this.produit.url_trailer);
      if (trailer) this.trailerUrl = trailer;
    }

    this.loadSimilarProducts();
    this.loadReviews();
  }

  /** Title, meta description, canonical, keywords et JSON-LD de la fiche. */
  private applySeo(): void {
    if (!this.produit || !this.content) return;

    const path = gamePath(this.produit);

    this.seo.setPage({
      title: `${this.produit.title} ${this.produit.platform} — Acheter en Tunisie | GameMart`,
      description: this.content.metaDescription,
      keywords: this.content.keywords,
      image: this.produit.coverImage,
      path,
      type: 'product'
    });

    this.seo.setBreadcrumbJsonLd([
      { name: 'Accueil', path: '/' },
      { name: 'Catalogue', path: '/produits' },
      { name: this.produit.genre || 'Jeux', path: `/categorie/${slugify(this.produit.genre)}` },
      { name: this.produit.title, path }
    ]);

    this.seo.setFaqJsonLd(this.content.faq);
    this.updateProductJsonLd();
  }

  /** Met à jour le JSON-LD avec la note et les avis réellement disponibles. */
  private updateProductJsonLd(): void {
    if (!this.produit) return;

    const reviews = (this.reviews || []).map((review) => ({
      note: Number(review?.note) || 0,
      msg: review?.msg || '',
      date: review?.date,
      authorName: this.authorNameForReview(review)
    }));

    this.seo.setProductJsonLd(this.produit, {
      description: this.content
        ? `${this.content.introParagraphs.join(' ')} ${this.produit.description || ''}`
        : this.produit.description,
      url: gamePath(this.produit),
      reviews,
      averageRating: this.averageRating,
      reviewCount: reviews.length
    });
  }

  private handleProductError(err: any): void {
    this.error = 'Échec du chargement des détails du produit.';
    console.error('Error loading product:', err);
  }

  private loadReviews(): void {
    if (!this.produit) return;

    this.reviewService.getReviewsByGameId(this.produit.id.toString()).subscribe({
      next: (reviews) => {
        this.reviews = Array.isArray(reviews) ? reviews : [];
        this.calculateAverageRating();
        this.loadUserNames();
        this.refreshRichContent();
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.reviews = [];
        this.calculateAverageRating();
        this.updateProductJsonLd();
      }
    });
  }

  /** Reconstruit le contenu long avec la note moyenne réelle. */
  private refreshRichContent(): void {
    if (!this.produit) return;

    this.content = this.productContent.build(this.produit, {
      averageRating: this.averageRating,
      reviewCount: this.reviews.length
    });

    if (this.content) {
      this.seo.setFaqJsonLd(this.content.faq);
      this.seo.setPage({
        title: `${this.produit.title} ${this.produit.platform} — Acheter en Tunisie | GameMart`,
        description: this.content.metaDescription,
        keywords: this.content.keywords,
        image: this.produit.coverImage,
        path: gamePath(this.produit),
        type: 'product'
      });
    }

    this.updateProductJsonLd();
  }

  private loadUserNames(): void {
    const uniqueUserIds = [...new Set(
      (this.reviews || [])
        .map((review: any) => review?.user?.id?.toString() ?? review?.userId?.toString())
        .filter((id): id is string => !!id)
    )];
    if (uniqueUserIds.length === 0) return;

    uniqueUserIds.forEach(userId => {
      if (this.userNames.has(userId)) return;
      this.userNames.set(userId, 'Chargement...');
      this.authService.getUsername(userId).subscribe({
        next: (user) => {
          const label = `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim() || 'Utilisateur';
          this.userNames.set(userId, label);
          this.updateProductJsonLd();
        },
        error: () => {
          this.userNames.set(userId, 'Utilisateur inconnu');
          this.updateProductJsonLd();
        }
      });
    });
  }

  /** Id utilisateur d'un avis, format plat (userId) OU imbriqué (user.id) */
  getReviewUserId(review: any): string {
    return review?.user?.id?.toString() ?? review?.userId?.toString() ?? '';
  }

  getDisplayName(userId: string): string {
    if (!userId) return 'Utilisateur inconnu';
    return this.userNames.get(userId) || 'Chargement...';
  }

  private authorNameForReview(review: any): string {
    const userId = this.getReviewUserId(review);
    const name = this.userNames.get(userId);
    return name && name !== 'Chargement...' ? name : 'Joueur GameMart';
  }

  private calculateAverageRating(): void {
    if (!this.reviews?.length) {
      this.averageRating = 0;
      return;
    }

    const total = this.reviews.reduce((sum, review) => sum + (Number(review?.note) || 0), 0);
    this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
  }

  submitReview(form: NgForm): void {
    if (!this.currentUser?.id || !this.produit || this.isSubmitting) {
      if (!this.currentUser?.id) {
        alert('Connectez-vous pour publier un avis');
      }
      return;
    }

    this.isSubmitting = true;
    const note = this.newReview.note;
    const reviewData: any = {
      gameId: this.produit.id.toString(),
      game: this.produit,
      userId: this.currentUser.id.toString(),
      user: this.currentUser,
      msg: this.newReview.msg,
      note,
      date: new Date().toISOString(),
      verified: true
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: (newReview: any) => {
        this.reviews.unshift(newReview);
        this.calculateAverageRating();
        const uid = newReview?.user?.id?.toString() ?? newReview?.userId?.toString() ?? this.currentUser!.id!.toString();
        this.userNames.set(uid, `${this.currentUser!.prenom} ${this.currentUser!.nom}`);

        // Événement personnalisé envoyé à GA4 / GTM (avis client).
        this.analytics.trackEvent('add_review', {
          currency: 'TND',
          value: this.produit!.price,
          review_rating: note,
          review_length: (this.newReview.msg || '').length,
          items: [{
            item_id: this.produit!.id,
            item_name: this.produit!.title,
            item_category: this.produit!.genre,
            item_brand: this.produit!.platform,
            price: this.produit!.price
          }]
        });

        this.refreshRichContent();
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
    return game.id !== this.produit!.id &&
      (game.genre === this.produit!.genre ||
        this.hasCommonTags(game));
  }

  private hasCommonTags(game: Game): boolean {
    return !!(game.tags && this.produit!.tags &&
      game.tags.some(tag => this.produit!.tags!.includes(tag)));
  }

  changeImage(direction: number): void {
    if (!this.produit?.images?.length) return;

    this.currentImageIndex = (this.currentImageIndex + direction + this.produit.images.length) % this.produit.images.length;
    this.restartSlideshow();
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
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
      this.slideshowInterval = undefined;
    }
  }

  private getYouTubeEmbedUrl(url: string): SafeResourceUrl | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    const videoId = match?.[1];

    if (!videoId) return null;

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
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

    const quantity = product ? 1 : this.quantity;

    this.cartService.addToCart(targetProduct, quantity).subscribe({
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

    this.userProfileService.addToWishlist(this.currentUser.id!!.toString(), this.produit.id!!.toString()).subscribe({
      next: () => {
        this.analytics.trackEvent('add_to_wishlist', {
          currency: 'TND',
          value: this.produit!.price,
          items: [{
            item_id: this.produit!.id,
            item_name: this.produit!.title,
            item_category: this.produit!.genre,
            item_brand: this.produit!.platform,
            price: this.produit!.price
          }]
        });
        alert('Ajouté aux favoris !');
      },
      error: (err) => {
        console.error('Wishlist error:', err);
        alert('Erreur lors de l\'ajout aux favoris.');
      }
    });
  }

  /** Lien vers la catégorie du jeu (maillage interne + SEO). */
  get categoryLink(): string {
    return this.produit?.genre ? `/categorie/${slugify(this.produit.genre)}` : '/produits';
  }

  get productLink(): string {
    return this.produit ? gamePath(this.produit) : '/produits';
  }

  productPath(product: Game): string {
    return gamePath(product);
  }

  setRating(rating: number): void {
    this.newReview.note = rating;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('fr-FR', {
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
