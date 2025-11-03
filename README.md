# GameMart E-Commerce

**GameMart** est une application e-commerce moderne dédiée à la vente de jeux vidéo. Elle propose une expérience utilisateur immersive, responsive, et met l'accent sur l'esthétique, la convivialité ainsi que la rapidité de navigation. L'application gère l'intégralité du parcours d'achat, du catalogue produit aux fonctionnalités avancées du profil utilisateur.

## 🚀 Technologies utilisées

- **Angular** 20
- **TypeScript**
- **RxJS**
- **SCSS** (Glassmorphism, gradients, animations…)
- **Bootstrap Icons et FontAwesome** (libres)
- **JSON Server** (API REST mock)
- **Zone.js**, **Karma/Jasmine** (tests)

## 📦 Instructions d'installation et de lancement

1. **Récupérer le projet**
```bash
git clone <repo-url>
cd e-commerce
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur API simulé** (dans un autre terminal)
```bash
npm install -g json-server
json-server --watch api/db.json --port 3000 # Données mockées
```

4. **Démarrer le serveur Angular**
```bash
npm start
# ou
ng serve
```

5. Accéder à l'application sur [http://localhost:4200](http://localhost:4200)

## 🗂️ Structure du projet (principaux dossiers)

- `src/app/components/` : composants Angular principaux (header, footer, banner, produits, produit-details, category-list… et tous les composants profil utilisateur)
- `src/app/services/` : gestion des appels HTTP/REST (produits, panier, wishlist, utilisateur…)
- `src/app/auth/` : pages login et registre
- `src/app/checkout/` : page de paiement
- `src/app/order-confirmation/` : confirmation et récapitulatif de commande
- `src/app/Models/` : modèles de données (Game, User, CartItem…)
- `src/app/guards/` : contrôle d'accès par routes (authentification)
- `api/db.json` : données mockées utilisées par json-server

## 🖥️ Fonctionnalités principales

- **Page d'accueil :**
  - Banner dynamique des jeux en promotion (slideshow, boutons Add to Cart, détails, rating visuel).
  - Catégories illustrées (filtrage produits automatique via query params).
  - Liste d’articles mis en avant.

- **Catalogue produits :**
  - Filtres multi-critères (catégorie, prix, note), tri dynamique (prix, nouveautés, popularité).
  - Pagination, grid adaptative, visuels modernes.
  - Ajout rapide au panier et favoris.

- **Détail produit :**
  - Description riche, carousel d’images, intégration trailer YouTube.
  - Ajout panier, wishlist, visualisation du stock, suggestions de produits similaires.

- **Panier :**
  - Modification quantités, suppression, sous-total dynamique, frais livraison calculés.
  - Passage au checkout, vidage total ou partiel.

- **Gestion utilisateur :**
  - Authentification/inscription sécurisée.
  - Profil : modification informations personnelles.
  - Adresses : gestion CRUD, mise par défaut.
  - Commandes : historique détaillé, statuts, accès rapide fiche produit.
  - Wishlist : affichage, retrait et accès direct.

- **Paiement/Commande :**
  - Checkout avec résumé clair, gestion adresse/shipping, confirmation et numéro de commande.

- **Recherche universelle :**
  - Accessible dans le header, résultats temps réel, navigation rapide fiche produit.

- **Responsive & UX :**
  - Adaptation parfaite (mobile, tablette, desktop).
  - Thème glassmorphism, transitions douces, icônes animées.

## 📄 Pages et composants principaux (avec descriptions)

- **Header/Footer** : navigation globale, accès rapide fonctionnalités clés.
- **CategoryList** : affichage horizontal animé de toutes les catégories de jeux.
- **Banner** : carrousel promotionnel, call to action.
- **Produits** : page catalogue complète filtrable/triable.
- **ProduitDetails** : fiche détaillée, carousel et trailer, interactions panier/favoris, suggestions.
- **Cart** : gestion intégrale du panier.
- **Checkout** : formulaire de finalisation d'achat, choix adresse.
- **OrderConfirmation** : page de fin d'achat, récap et suivi n° commande.
- **UserProfile** (et enfants) :
    - Profile, Orders, Wishlist, Addresses
    - Tuyaux CRUD, historique, badges, animations.
- **Login/Register** : formulaires modernes, validation et feedback utilisateur.
- **SearchComponent** : résultats par titre, navigation rapide.

## 🛠️ Difficultés rencontrées

- **État du panier et synchro multi-composants**
  - Solution : service centralisé CartService, BehaviorSubject/Observables pour synchronisation instantanée UI.

- **Gestion de la responsivité avancée et de la modernité du design**
  - Solution : SCSS avec media queries, animations personnalisées, glassmorphism partout (SCSS).

- **Ajout, édition, filtrage dynamique (catégories, wishlist, historique commandes) sur API json-server**
  - Solution : Organisation centralisée avec services + gestion des query params Angular Router.

## 🙌 Auteur & Contact

Développement par [Votre Nom].
Pour tout retour ou suggestion : contact [ici/email].
