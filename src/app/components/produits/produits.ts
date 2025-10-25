import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Game } from '../../Models/game.model';
import { CommonModule } from '@angular/common';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, Header, Footer, FormsModule],
  templateUrl: './produits.html',
  styleUrl: './produits.scss'
})
export class Produits implements OnInit {
  allProduits: Game[] = []; 
  displayedProduits: Game[] = []; 
  error: string = "";
  currentPage: number = 1;
  itemsPerPage: number = 30;
  totalItems: number = 0;
  totalPages: number = 0;
  categories: string[] = [];
  selectedCategory: string = '';
  selectedPriceRange: number = 300;
  selectedRating: number = 0;
  selectedSortOption: string = 'none';
  Math: any;
  Number: any;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.gameService.getAllGames().subscribe({
      next: (produits) => {
        this.allProduits = produits;
        this.categories = this.getUniqueCategories(produits);
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        console.error('Error loading products:', err);
      },
    });
  }

  getUniqueCategories(produits: Game[]): string[] {
    const categories = produits.map(produit => produit.genre);
    return [...new Set(categories)];
  }

  applyFilters(): void {
    let filteredProduits = this.allProduits;

    if (this.selectedCategory) {
      filteredProduits = filteredProduits.filter(produit => produit.genre === this.selectedCategory);
    }

    filteredProduits = filteredProduits.filter(produit => produit.price <= this.selectedPriceRange);

    if (this.selectedRating > 0) {
      filteredProduits = filteredProduits.filter(produit => produit.rating && produit.rating >= this.selectedRating);
    }

    switch (this.selectedSortOption) {
      case 'priceAsc':
        filteredProduits.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filteredProduits.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        filteredProduits.sort((a, b) => b.rating - a.rating); // Assuming rating represents popularity
        break;
      case 'newArrivals':
        filteredProduits.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
        break;
      case 'none':
      default:
        // No sorting or default sorting
        break;
    }

    this.totalItems = filteredProduits.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page after filtering
    this.paginateProduits(filteredProduits);
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.selectedPriceRange = 300;
    this.selectedRating = 0;
    this.selectedSortOption = 'none';
    this.applyFilters();
  }

  paginateProduits(produitsToPaginate: Game[] = this.allProduits): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProduits = produitsToPaginate.slice(startIndex, endIndex);

    
    if (this.displayedProduits.length < 20 && produitsToPaginate.length >= 20) {
      this.displayedProduits = produitsToPaginate.slice(0, 20);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters(); // Apply filters again to re-paginate with new page
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters(); // Apply filters again to re-paginate with new page
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters(); // Apply filters again to re-paginate with new page
    }
  }
  addToCart(produit: Game): void {
    // Add the product to the cart
    console.log('Add to cart:', produit);
  }
}
