import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem, CartSummary } from '../../Models/cart-item.model';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    subtotal: 0,
    shippingFee: 0,
    total: 0,
    itemCount: 0
  };

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.updateSummary();
    });
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
      this.cartService.removeFromCart(itemId).subscribe(() => {
        this.updateSummary();
      });
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
  
    alert('Redirection vers la page de paiement...');
 
  }

  getTotalItems(): number {
    return this.cartSummary.itemCount;
  }
}

