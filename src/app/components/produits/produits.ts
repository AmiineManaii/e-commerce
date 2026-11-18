import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { CartService } from '../../services/cart.service';
import { UserProfileService } from '../../services/user-profile.service';
import { Game } from '../../Models/game.model';
import { CommonModule } from '@angular/common';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { User } from '../../Models/user.model';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { SeoService } from '../../services/seo.service';
import { GameImagePipe } from '../../pipes/game-image.pipe';
import { ImgFallbackDirective } from '../../directives/img-fallback.directive';
import { categoryPath, gamePath, platformPath, slugify } from '../../utils/game-slug';
import { combineLatest } from 'rxjs';

type CatalogMode = 'all' | 'genre' | 'platform' | 'promo';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, Header, Footer, FormsModule, RouterLink, GameImagePipe, ImgFallbackDirective],
  templateUrl: './produits.html',
  styleUrl: './produits.scss'
})
export class Produits implements OnInit {

  allProduits: Game[] = [];
  displayedProduits: Game[] = [];
  error: string = "";
  currentPage: number = 1;
  itemsPerPage: number = 28;
  totalItems: number = 0;
  totalPages: number = 0;
  categories: string[] = [];
  platforms: string[] = [];
  genreLinks: { label: string; path: string }[] = [];
  platformLinks: { label: string; path: string }[] = [];
  selectedCategory: string = '';
  selectedPriceRange: number = 300;
  selectedRating: number = 0;
  selectedSortOption: string = 'none';
  currentUser: User | null = null;

  catalogMode: CatalogMode = 'all';
  pageTitle = 'Tous les jeux vidéo';
  pageSubtitle = 'Découvrez notre sélection complète de jeux vidéo : PC, PS5, Xbox et Nintendo Switch.';
  private routeGenreSlug = '';
  private routePlatformSlug = '';

  constructor(
    private gameService: GameService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private analytics: AnalyticsService,
    private seo: SeoService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    combineLatest([this.route.data, this.route.paramMap]).subscribe(([data, params]) => {
      this.catalogMode = (data['catalogMode'] as CatalogMode) || 'all';
      this.routeGenreSlug = slugify(params.get('genre') || '');
      this.routePlatformSlug = slugify(params.get('platform') || '');
      this.currentPage = 1;

      if (this.allProduits.length === 0) {
        this.loadProduits();
      } else {
        this.applyFilters();
      }
    });
  }

  loadProduits(): void {
    this.gameService.getAllGames().subscribe({
      next: (produits) => {
        this.allProduits = produits;
        this.categories = this.getUniqueValues(produits.map(produit => produit.genre));
        this.platforms = this.getUniqueValues(produits.map(produit => produit.platform));
        this.genreLinks = this.categories.map((genre) => ({
          label: `Jeux ${genre}`,
          path: categoryPath(genre)
        }));
        this.platformLinks = this.platforms.map((platform) => ({
          label: `Jeux ${platform}`,
          path: platformPath(platform)
        }));
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Impossible de charger les produits. Veuillez réessayer plus tard.';
        console.error('Error loading products:', err);
      },
    });
  }

  getUniqueValues(values: string[]): string[] {
    return [...new Set(values.filter(Boolean))];
  }

  /** Applique les filtres d'URL (catégorie, plateforme, promo) puis les filtres UI. */
  applyFilters(): void {
    let filteredProduits = [...this.allProduits];

    if (this.catalogMode === 'genre' && this.routeGenreSlug) {
      filteredProduits = filteredProduits.filter(
        produit => slugify(produit.genre) === this.routeGenreSlug
      );
      this.selectedCategory = filteredProduits[0]?.genre || this.labelFromSlug(this.routeGenreSlug);
    } else if (this.catalogMode === 'platform' && this.routePlatformSlug) {
      filteredProduits = filteredProduits.filter(
        produit => slugify(produit.platform) === this.routePlatformSlug
      );
    } else if (this.catalogMode === 'promo') {
      filteredProduits = filteredProduits.filter(produit => !!produit.promo);
    } else if (this.selectedCategory) {
      filteredProduits = filteredProduits.filter(produit => produit.genre === this.selectedCategory);
    }

    filteredProduits = filteredProduits.filter(produit => produit.price <= this.selectedPriceRange);

    if (this.selectedRating > 0) {
      filteredProduits = filteredProduits.filter(
        produit => produit.rating && produit.rating >= this.selectedRating
      );
    }

    switch (this.selectedSortOption) {
      case 'priceAsc':
        filteredProduits.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filteredProduits.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        filteredProduits.sort((a, b) => b.rating - a.rating);
        break;
      case 'newArrivals':
        filteredProduits.sort(
          (a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        );
        break;
      case 'none':
      default:
        break;
    }

    this.totalItems = filteredProduits.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.paginateProduits(filteredProduits);

    this.updatePageLabels();
    this.updateSeo();

    this.analytics.trackEvent('view_item_list', {
      item_list_name: this.listName,
      items: this.displayedProduits.map(p => ({
        item_id: p.id,
        item_name: p.title,
        item_category: p.genre,
        item_brand: p.platform,
        price: p.price
      }))
    });
  }

  resetFilters(): void {
    this.selectedCategory = this.catalogMode === 'genre' ? this.selectedCategory : '';
    this.selectedPriceRange = 300;
    this.selectedRating = 0;
    this.selectedSortOption = 'none';
    this.currentPage = 1;
    this.applyFilters();
  }

  paginateProduits(produitsToPaginate: Game[] = this.allProduits): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProduits = produitsToPaginate.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  addToCart(produit: Game): void {
    this.cartService.addToCart(produit, 1).subscribe({
      next: () => {
        alert('Ajouté au panier: ' + produit.title);
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout au panier:', error);
        alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
      }
    });
  }

  viewProductDetails(produit: Game): void {
    this.trackSelectItem(produit);
    this.router.navigateByUrl(produit ? gamePath(produit) : '/produits');
  }

  /** Événement GA4 `select_item` (clic vers une fiche produit). */
  trackSelectItem(produit: Game): void {
    if (!produit) return;

    this.analytics.trackEvent('select_item', {
      item_list_name: this.listName,
      items: [{
        item_id: produit.id,
        item_name: produit.title,
        item_category: produit.genre,
        item_brand: produit.platform,
        price: produit.price
      }]
    });
  }

  productPath(produit: Game): string {
    return gamePath(produit);
  }

  addToWishlist(produit: Game): void {
    if (!this.currentUser?.id) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }

    this.userProfileService.addToWishlist(this.currentUser.id.toString(), produit.id.toString()).subscribe({
      next: () => {
        this.analytics.trackEvent('add_to_wishlist', {
          currency: 'TND',
          value: produit.price,
          items: [{
            item_id: produit.id,
            item_name: produit.title,
            item_category: produit.genre,
            item_brand: produit.platform,
            price: produit.price
          }]
        });
        alert('Ajouté à la liste de souhaits: ' + produit.title);
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout à la liste de souhaits:', error);
        alert('Veuillez vous connecter pour ajouter aux favoris');
      }
    });
  }

  /** Nom de la liste utilisé par GA4 (view_item_list / select_item). */
  get listName(): string {
    switch (this.catalogMode) {
      case 'genre':
        return `Catégorie ${this.selectedCategory || this.labelFromSlug(this.routeGenreSlug)}`;
      case 'platform':
        return `Plateforme ${this.labelFromSlug(this.routePlatformSlug)}`;
      case 'promo':
        return 'Promotions';
      default:
        return this.selectedCategory || 'Tous les jeux vidéo';
    }
  }

  private updatePageLabels(): void {
    switch (this.catalogMode) {
      case 'genre': {
        const genre = this.selectedCategory || this.labelFromSlug(this.routeGenreSlug);
        this.pageTitle = `Jeux ${genre}`;
        this.pageSubtitle = `Tous les jeux ${genre} disponibles chez GameMart : prix en dinars tunisiens, plateformes, notes des joueurs et promotions.`;
        break;
      }
      case 'platform': {
        const platform = this.labelFromSlug(this.routePlatformSlug);
        this.pageTitle = `Jeux ${platform}`;
        this.pageSubtitle = `Sélection de jeux ${platform} : prix, stock et promotions sur GameMart Tunisie.`;
        break;
      }
      case 'promo':
        this.pageTitle = 'Promotions jeux vidéo';
        this.pageSubtitle = 'Profitez des réductions en cours sur les jeux PC, PS5, Xbox et Nintendo Switch.';
        break;
      default:
        this.pageTitle = 'Tous les jeux vidéo';
        this.pageSubtitle = 'Découvrez notre sélection complète de jeux vidéo : PC, PS5, Xbox et Nintendo Switch.';
        break;
    }
  }

  /** SEO dynamique des pages catégorie / plateforme / promotions. */
  private updateSeo(): void {
    if (this.catalogMode === 'all') return;

    const path = this.router.url.split('?')[0].split('#')[0];
    const genre = this.selectedCategory || this.labelFromSlug(this.routeGenreSlug);
    const platform = this.labelFromSlug(this.routePlatformSlug);

    let title = 'Catalogue de jeux vidéo | GameMart';
    let description = 'Tous les jeux vidéo GameMart au meilleur prix en Tunisie.';
    let keywords: string[] = ['jeux vidéo Tunisie', 'GameMart'];

    if (this.catalogMode === 'genre') {
      title = `Jeux ${genre} — Acheter en Tunisie au meilleur prix | GameMart`;
      description = `Découvrez ${this.totalItems} jeux ${genre} sur GameMart : prix en dinars tunisiens, plateformes PC, PS5, Xbox et Switch, avis des joueurs et promotions en cours.`;
      keywords = [
        `jeux ${genre}`,
        `jeu ${genre}`,
        `acheter jeu ${genre}`,
        `jeux ${genre} pas cher`,
        `jeux ${genre} Tunisie`,
        `jeu ${genre} PC`,
        `jeu ${genre} PS5`,
        `jeu ${genre} Xbox`,
        `meilleurs jeux ${genre} 2026`,
        'GameMart'
      ];
    } else if (this.catalogMode === 'platform') {
      title = `Jeux ${platform} — Acheter en Tunisie | GameMart`;
      description = `Tous les jeux ${platform} disponibles chez GameMart : prix en DT, stock en temps réel, avis des joueurs et promotions. Livraison rapide en Tunisie.`;
      keywords = [
        `jeux ${platform}`,
        `jeu ${platform}`,
        `acheter jeu ${platform}`,
        `jeu ${platform} Tunisie`,
        `jeu ${platform} pas cher`,
        `promotion jeu ${platform}`,
        'GameMart'
      ];
    } else if (this.catalogMode === 'promo') {
      title = 'Promotions jeux vidéo — Bons plans en Tunisie | GameMart';
      description = `Profitez de ${this.totalItems} promotions jeux vidéo chez GameMart : réductions sur PC, PS5, Xbox et Nintendo Switch, prix en DT et stock limité.`;
      keywords = [
        'promotions jeux vidéo',
        'jeux vidéo en promo',
        'jeux pas cher Tunisie',
        'bon plan jeux vidéo',
        'réduction jeu PC',
        'réduction jeu PS5',
        'réduction jeu Xbox',
        'réduction jeu Switch',
        'GameMart promotions'
      ];
    }

    this.seo.setPage({ title, description, keywords, path });
  }

  private labelFromSlug(slugValue: string): string {
    const fromCatalog =
      this.allProduits.find(produit => slugify(produit.genre) === slugValue)?.genre ||
      this.allProduits.find(produit => slugify(produit.platform) === slugValue)?.platform;

    if (fromCatalog) return fromCatalog;

    return (slugValue || '')
      .split('-')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
