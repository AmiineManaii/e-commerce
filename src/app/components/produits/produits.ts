import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Game } from '../../Models/game.model';
import { CommonModule } from '@angular/common';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './produits.html',
  styleUrl: './produits.scss'
})
export class Produits implements OnInit {
  allProduits: Game[] = []; // All products fetched from the service
  displayedProduits: Game[] = []; // Products currently displayed on the page
  error: string = "";

  currentPage: number = 1;
  itemsPerPage: number = 30;
  totalItems: number = 0;
  totalPages: number = 0;
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
        this.totalItems = this.allProduits.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.paginateProduits();
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        console.error('Error loading products:', err);
      },
    });
  }

  paginateProduits(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProduits = this.allProduits.slice(startIndex, endIndex);

    // Ensure a minimum of 20 products are displayed if available
    if (this.displayedProduits.length < 20 && this.allProduits.length >= 20) {
      this.displayedProduits = this.allProduits.slice(0, 20);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateProduits();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateProduits();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateProduits();
    }
  }
  addToCart(produit: Game): void {
    // Add the product to the cart
    console.log('Add to cart:', produit);
  }
}
