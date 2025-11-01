import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem, CartSummary } from '../../Models/cart-item.model';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    subtotal: 0,
    shippingFee: 0,
    total: 0,
    itemCount: 0
  };
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        this.updateSummary();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateSummary(): void {
    this.cartSummary = this.cartService.getCartSummary();
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(itemId, quantity).subscribe();
    }
  }

  removeItem(itemId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article du panier ?')) {
      this.cartService.removeFromCart(itemId).subscribe();
    }
  }

  clearCart(): void {
    if (confirm('Êtes-vous sûr de vouloir vider tout le panier ?')) {
      this.cartService.clearCart().subscribe();
    }
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    // Navigation vers la page de paiement (à implémenter)
    alert('Redirection vers la page de paiement...');
    // this.router.navigate(['/checkout']);
  }

  getTotalItems(): number {
    return this.cartSummary.itemCount;
  }
}

