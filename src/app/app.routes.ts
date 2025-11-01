import { Routes } from '@angular/router';
import { SearchComponent } from './search/search';
import { Home } from './home/home';
import { Produits } from './components/produits/produits';
import { ProduitDetailsComponent } from './produit-details/produit-details';
import { CartComponent } from './components/cart/cart';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { authGuard, nonAuthGuard } from './guards/auth.guard';



export const routes: Routes = [
  { path: '', component: Home},
  { path: 'produits', component: Produits},
  { path: 'produitDetails/:id', component: ProduitDetailsComponent},
  { path: 'search', component: SearchComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [nonAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [nonAuthGuard] }
];
