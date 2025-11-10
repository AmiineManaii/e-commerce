# GameMart E-Commerce

**GameMart** est une application e-commerce moderne dédiée à la vente de jeux vidéo. Elle propose une expérience utilisateur immersive, responsive, et met l'accent sur l'esthétique, la convivialité ainsi que la rapidité de navigation. L'application gère l'intégralité du parcours d'achat, du catalogue produit aux fonctionnalités avancées du profil utilisateur.

## 🚀 Technologies utilisées

- **Angular** 20
- **TypeScript**
- **RxJS**
- **SCSS** (Glassmorphism, gradients, animations…)
- **Bootstrap Icons et FontAwesome** (libres)
- **JSON Server** (API REST mock)

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
npx json-server --watch api/db.json --port 3000
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
- `src/app/components/order-confirmation/` : confirmation et récapitulatif de commande
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

- **Templating moderne Angular :**
  - Utilisation de `@if` et `@for` (au lieu de `*ngIf`/`*ngFor`).

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

### Routes principales

- `/produits` — catalogue
- `/produitDetails/:id` — détails d’un jeu
- `/cart` — panier
- `/checkout` — paiement (protégé)
- `/order-confirmation/:id` — confirmation (protégée)
- `/login`, `/register` — auth
- `/user` — espace utilisateur (protégé), enfants :
  - `/user/profile`, `/user/orders`, `/user/wishlist`, `/user/addresses`

### API JSON Server

- `GET /games` — catalogue
- `GET/POST/PATCH/DELETE /cart` — panier
- `GET/POST/PATCH /users` — utilisateurs, wishlist
- `GET/POST /orders` — commandes
- `GET/POST/PATCH/DELETE /addresses` — adresses

### Scripts utiles

- `npm start` — lance le serveur de dev Angular
- `npm run build` — build de production
- `npm test` — tests unitaires Karma/Jasmine
- `npx json-server --watch api/db.json --port 3000` — API mock

### Notes

- Par défaut, l’application démarre sur `http://localhost:4200/`. En cas de port occupé, utilisez l’option `--port` (ex. `4400`).
- Les données de l’application (panier, commandes, adresses, utilisateurs) sont stockées dans `api/db.json` par JSON Server.
- ⚠️ Remarque importante : Il est recommandé d’installer une version stable de JSON Server, car certaines versions récentes présentent un bug sur les opérations GET by ID ou DELETE, nécessitant un redémarrage du serveur après chaque opération.
## 🙌 Auteur & Contact

Développement par [Mohamed Amine Manai].
Pour tout retour ou suggestion : contact aminemanai222@gmail.com.
