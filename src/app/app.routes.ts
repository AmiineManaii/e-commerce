import { Routes } from '@angular/router';
import { SearchComponent } from './components/search/search';
import { Home } from './home/home';
import { Produits } from './components/produits/produits';
import { ProduitDetailsComponent } from './components/produit-details/produit-details';
import { CartComponent } from './components/cart/cart';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { authGuard, nonAuthGuard } from './guards/auth.guard';
import { AddressesComponent } from './components/user-profile/addresses/addresses';
import { UserProfileComponent } from './components/user-profile/user-profile';
import { ProfileComponent } from './components/user-profile/profile/profile';
import { OrdersComponent } from './components/user-profile/orders/orders';
import { WishlistComponent } from './components/user-profile/wishlist/wishlist';
import { CheckoutComponent } from './components/checkout/checkout';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation';


export const routes: Routes = [
  { path: '', component: Home},
  { path: 'produits', component: Produits},
  { path: 'produitDetails/:id', component: ProduitDetailsComponent},
  { path: 'search', component: SearchComponent },
  { path: 'cart', component: CartComponent },//,canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'order-confirmation/:id', component: OrderConfirmationComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [nonAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [nonAuthGuard] },
  { path: 'user', component: UserProfileComponent, canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'addresses', component: AddressesComponent }
    ]
  }
];
