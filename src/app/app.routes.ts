import { Routes } from '@angular/router';
import { SearchComponent } from './search/search';
import { Home } from './home/home';
import { Produits } from './components/produits/produits';


export const routes: Routes = [
  { path: '', component: Home},
  { path: 'produits', component: Produits},
  
  { path: 'search', component: SearchComponent }
];
