import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class Header implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItemCount = this.cartService.getTotalItems();
      });
      
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
