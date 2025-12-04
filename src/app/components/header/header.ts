import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Observable, of } from 'rxjs';
import { User } from '../../Models/user.model';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  cartItemCount: number = 0;
  currentUser: User | null = null;
  wishlistItemCount: Observable<number> = new Observable<number>();
 

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
    private userProfileService: UserProfileService
  ) { }

  ngOnInit(): void {
    this.loadCart();
    this.cartService.getCartChanges().subscribe(() => this.loadCart());
    this.currentUser = this.authService.getCurrentUser();
    this.loadWishlist();
    this.userProfileService.getWishlistChanges().subscribe(() => this.loadWishlist());
    
  }
  loadCart() {
  this.cartService.getCartItems().subscribe(items => {
    this.cartItemCount = items.length;
  });
  }
  loadWishlist() {
    if (this.currentUser?.id) {
      this.userProfileService.getWishlist(this.currentUser.id.toString()).subscribe(items => {
        this.wishlistItemCount = of(items.length);
      });
    }
  }



  onSearch(searchTerm: string) {
    if (searchTerm.trim() !== "") {
      this.router.navigate(['/search'], { queryParams: { q: searchTerm } });
    }
    else{
      alert("Entrer un mot cle pour effectuer la recherche")
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.currentUser = null;
  }
}