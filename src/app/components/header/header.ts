import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../Models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  cartItemCount: number = 0;
  currentUser: User | null = null;
 

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadCart();
    this.cartService.getCartChanges().subscribe(() => this.loadCart());
    this.currentUser = this.authService.getCurrentUser();
  }
  loadCart() {
  this.cartService.getCartItems().subscribe(items => {
    this.cartItemCount = items.length;
  });
  

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
  }
}
