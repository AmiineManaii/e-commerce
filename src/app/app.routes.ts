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
  {
    path: '',
    component: Home,
    data: {
      title: 'GameMart — Boutique de jeux vidéo en Tunisie | PC, PS5, Xbox, Switch',
      description:
        "GameMart, boutique de jeux vidéo en Tunisie : jeux PC, PS5, Xbox et Nintendo Switch au meilleur prix. Promotions, clés d'activation et livraison rapide."
    }
  },
  {
    path: 'produits',
    component: Produits,
    data: {
      title: 'Catalogue de jeux vidéo — PC, PS5, Xbox, Switch | GameMart',
      description:
        'Parcourez le catalogue GameMart : tous les jeux vidéo PC, PlayStation 5, Xbox et Nintendo Switch, filtrables par catégorie, prix et note. Promotions mises à jour régulièrement.'
    }
  },
  {
    path: 'produitDetails/:id',
    component: ProduitDetailsComponent,
    data: {
      title: 'Fiche produit — Jeu vidéo | GameMart',
      description:
        "Fiche détaillée d'un jeu vidéo GameMart : description, plateforme, genre, note des joueurs, disponibilité et prix en dinars tunisiens."
    }
  },
  {
    path: 'search',
    component: SearchComponent,
    data: {
      title: 'Recherche de jeux vidéo | GameMart',
      description: 'Recherchez un jeu vidéo par titre, plateforme ou genre dans le catalogue GameMart.'
    }
  },
  {
    path: 'cart',
    component: CartComponent,
    data: {
      title: 'Mon panier | GameMart',
      description: 'Consultez et modifiez les articles de votre panier GameMart avant de passer commande.'
    }
  },//,canActivate: [authGuard] },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard],
    data: {
      title: 'Paiement sécurisé | GameMart',
      description: 'Finalisez votre commande de jeux vidéo en toute sécurité sur GameMart.'
    }
  },
  {
    path: 'order-confirmation/:id',
    component: OrderConfirmationComponent,
    canActivate: [authGuard],
    data: {
      title: 'Confirmation de commande | GameMart',
      description: 'Confirmation et récapitulatif de votre commande GameMart.'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [nonAuthGuard],
    data: {
      title: 'Connexion à mon compte | GameMart',
      description: 'Connectez-vous à votre compte GameMart pour suivre vos commandes et votre liste de souhaits.'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [nonAuthGuard],
    data: {
      title: 'Créer un compte | GameMart',
      description: 'Créez votre compte GameMart pour commander plus vite et suivre vos commandes de jeux vidéo.'
    }
  },
  {
    path: 'user',
    component: UserProfileComponent,
    canActivate: [authGuard],
    data: {
      title: 'Mon espace personnel | GameMart',
      description: 'Gérez votre profil, vos commandes, votre liste de souhaits et vos adresses de livraison GameMart.'
    },
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        component: ProfileComponent,
        data: {
          title: 'Mon profil | GameMart',
          description: 'Consultez et modifiez les informations de votre compte GameMart.'
        }
      },
      {
        path: 'orders',
        component: OrdersComponent,
        data: {
          title: 'Mes commandes | GameMart',
          description: 'Retrouvez l’historique et le statut de vos commandes de jeux vidéo sur GameMart.'
        }
      },
      {
        path: 'wishlist',
        component: WishlistComponent,
        data: {
          title: 'Ma liste de souhaits | GameMart',
          description: 'Retrouvez les jeux vidéo que vous avez ajoutés à votre liste de souhaits GameMart.'
        }
      },
      {
        path: 'addresses',
        component: AddressesComponent,
        data: {
          title: 'Mes adresses de livraison | GameMart',
          description: 'Gérez vos adresses de livraison pour vos commandes de jeux vidéo GameMart.'
        }
      }
    ]
  }
];
