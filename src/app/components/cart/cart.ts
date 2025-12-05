import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem, CartSummary } from '../../Models/cart-item.model';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems$ = new BehaviorSubject<CartItem[]>([]);
  cartSummary: CartSummary = {
    subtotal: 0,
    shippingFee: 0,
    total: 0,
    itemCount: 0
  };
  private subscriptions: Subscription = new Subscription();

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCartItems(): void {
    const subscription = this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems$.next(items);
        this.updateSummary(items);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des articles du panier :', error);
      }
    });
    this.subscriptions.add(subscription);
  }

  updateSummary(items: CartItem[]): void {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = subtotal > 0 ? 15 : 0;
    const total = subtotal + shippingFee;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartSummary = {
      subtotal,
      shippingFee,
      total,
      itemCount
    };
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity > 0) {
      const subscription = this.cartService.updateQuantity(itemId, quantity).subscribe({
        next: (updatedItem) => {
          const currentItems = this.cartItems$.value;
          const updatedItems = currentItems.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          );
          this.cartItems$.next(updatedItems);
          this.updateSummary(updatedItems);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la quantité :', error);
        }
      });
      this.subscriptions.add(subscription);
    }
  }

  removeItem(itemId: string): void {
    if (confirm('Vous etes sur de supprimer cet article du panier ?')) {
      const subscription = this.cartService.removeFromCart(itemId).subscribe({
        next: () => {
          const currentItems = this.cartItems$.value;
          const updatedItems = currentItems.filter(item => item.id !== itemId);
          this.cartItems$.next(updatedItems);
          this.updateSummary(updatedItems);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de larticle :', error);
        }
      });
      this.subscriptions.add(subscription);
    }
  }

  clearCart(): void {
    if (confirm('vous etes sur de vider le panier ?')) {
      const subscription = this.cartService.clearCart().subscribe({
        next: () => {
          this.cartItems$.next([]);
          this.updateSummary([]);
        },
        error: (error) => {
          console.error('Erreur lors du vidage du panier :', error);
        }
      });
      this.subscriptions.add(subscription);
    }
  }

  proceedToCheckout(): void {
    const currentItems = this.cartItems$.value;
    if (currentItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  getTotalItems(): number {
    return this.cartSummary.itemCount;
  }
}
