import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { CartService } from '../../services/cart.service';
import { UserProfileService } from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';
import { CartItem, CartSummary } from '../../Models/cart-item.model';
import { Address, Order, OrderItem, User } from '../../Models/user.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, Footer],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent implements OnInit {
  currentUser: User | null = null;
  token: string | null = null;
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = { subtotal: 0, shippingFee: 0, total: 0, itemCount: 0 };
  addresses: Address[] = [];
  selectedAddressId: string | null = null;
  shippingOptions = [
    { id: 'standard', label: 'Standard (3-5 jours)', fee: 0 },
    { id: 'express', label: 'Express (1-2 jours)', fee: 20 }
  ];
  selectedShippingId: 'standard' | 'express' = 'standard';

  // Paiement (mock)
  payment = {
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  loading = true;
  error = '';
  placingOrder = false;

  constructor(
    private cartService: CartService,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()?.user || null;
    if (!this.currentUser?.id) {
      this.error = 'Vous devez être connecté pour passer commande.';
      this.loading = false;
      return;
    }

    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.updateSummary(items);
        if (this.currentUser && this.currentUser.id) {
          this.loadAddresses(this.currentUser.id);
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du panier';
        console.error(err);
        this.loading = false;
      }
    });
  }

  updateSummary(items: CartItem[]): void {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = subtotal > 0 ? (this.selectedShippingId === 'express' ? 20 : 15) : 0;
    const total = subtotal + shippingFee;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartSummary = { subtotal, shippingFee, total, itemCount };
  }

  loadAddresses(userId: string): void {
    this.userProfileService.getAddresses(userId).subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.selectedAddressId = addresses.find(a => a.default)?.id || addresses[0]?.id || null;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des adresses';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onShippingChange(): void {
    this.updateSummary(this.cartItems);
  }

  confirmOrder(): void {
    if (!this.currentUser || !this.currentUser.id) { return; }
    if (this.cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    if (!this.selectedAddressId) {
      alert('Veuillez sélectionner une adresse de livraison');
      return;
    }
    if (!this.payment.name || !this.payment.cardNumber || !this.payment.expiry || !this.payment.cvv) {
      alert('Veuillez remplir les informations de paiement');
      return;
    }

    const items: OrderItem[] = this.cartItems.map(ci => ({
      gameId: ci.gameId,
      quantity: ci.quantity,
      price: ci.subtotal
    }));

    const order: Order = {
      userId: this.currentUser.id,
      date: new Date().toISOString(),
      items,
      total: this.cartSummary.total,
      status: 'completed',
      addressId: this.selectedAddressId
    };

    this.placingOrder = true;
    this.userProfileService.createOrder(order).subscribe({
      next: (created) => {
        this.cartService.clearCart().subscribe({
          next: () => {
            this.router.navigate(['/order-confirmation', created.id]);
            
          },
          error: (error) => {
            console.error('Erreur lors de la navigation vers la confirmation de commande :', error);
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la création de la commande :', error);
        this.error = 'Erreur lors de la création de la commande';
        this.placingOrder = false;
      }
    }); 
  }
}