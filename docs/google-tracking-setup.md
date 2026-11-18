# Mise en place Google Analytics, Google Tag Manager et Google Search Console

## 1. Google Analytics (GA4)
- Créer une propriété GA4 sur https://analytics.google.com
- Récupérer le **Measurement ID** (format `G-XXXXXXXXXX`).
- Renseigner l'ID dans :
  - `src/index.html` (bloc gtag.js)
  - `src/environments/environment.prod.ts` (`googleAnalyticsId`)
- Tracking SPA : `AnalyticsService` envoie un `page_view` à chaque navigation via les événements du Router.
- **Anti double comptage** : `gtag('config', ...)` est appelé avec `send_page_view: false` dans
  `index.html`. Le premier `page_view` est donc envoyé par l'application, comme les suivants.

### Événements GA4 envoyés par l'application
| Événement | Déclenché par | Paramètres principaux |
|---|---|---|
| `page_view` | chaque navigation SPA | `page_path`, `page_location`, `page_title` |
| `view_item` | ouverture d'une fiche produit | `currency`, `value`, `items[]` |
| `view_item_list` | affichage du catalogue / catégorie / plateforme / promotions | `item_list_name`, `items[]` |
| `select_item` | clic vers une fiche produit | `item_list_name`, `items[]` |
| `search` | recherche interne (`/search?q=...`) | `search_term` |
| `view_search_results` | résultats de recherche | `search_term`, `items[]` |
| `add_to_cart` | ajout au panier | `currency`, `value`, `items[]` |
| `remove_from_cart` | suppression d'un article / vidage du panier | `currency`, `value`, `items[]` |
| `add_to_wishlist` | ajout à la liste de souhaits | `currency`, `value`, `items[]` |
| `begin_checkout` | ouverture du tunnel de commande | `currency`, `value`, `items[]` |
| `add_shipping_info` | choix du mode de livraison | `currency`, `value`, `shipping_tier`, `shipping`, `items[]` |
| `add_payment_info` | sélection du paiement | `currency`, `value`, `payment_type`, `items[]` |
| `purchase` | commande validée | `transaction_id`, `currency`, `value`, `shipping`, `items[]` |
| `add_review` | publication d'un avis client (événement personnalisé) | `review_rating`, `review_length`, `currency`, `value`, `items[]` |
| `login` / `sign_up` | connexion / création de compte | `method` |

Tous les événements e-commerce utilisent le format GA4 :

```js
{
  event: 'add_to_cart',
  ecommerce: {
    currency: 'TND',
    value: 59.99,
    items: [{ item_id: '1', item_name: 'Cyberpunk 2077', item_category: 'RPG', price: 59.99, quantity: 1 }]
  }
}
```

> Utilisez **DebugView** (GA4 → Admin → DebugView) et **GTM Preview** pour vérifier les événements
> en local avant la mise en production.

## 2. Google Tag Manager (GTM)
- Créer un conteneur sur https://tagmanager.google.com
- Récupérer le **Container ID** (format `GTM-XXXXXXX`).
- Renseigner l'ID dans :
  - `src/index.html` (script + noscript iframe)
  - `src/environments/environment.prod.ts` (`googleTagManagerId`)
- Les événements sont aussi poussés dans `dataLayer` (avec `ecommerce: null` avant chaque envoi
  pour éviter la réutilisation des articles précédents).
- ⚠️ **Double comptage** : si vous configurez GA4 comme tag dans GTM, supprimez le bloc gtag.js
  direct dans `index.html` **ou** désactivez l'envoi d'événements GA4 direct dans
  `AnalyticsService`. Les deux approches sont valides, mais une seule doit alimenter la propriété.
  - Option A (recommandée pour ce projet) : gtag.js direct + GTM uniquement pour Google Ads /
    remarketing / tags tiers.
  - Option B : GTM pilote GA4 (déclencheurs sur `page_view`, `add_to_cart`, `purchase`, ...) et on
    retire le bloc gtag.js direct.

## 3. Google Search Console
- Ajouter la propriété sur https://search.google.com/search-console
- Méthode de vérification recommandée : balise HTML.
- Copier le code fourni et remplacer `REMPLACER_PAR_VOTRE_CODE_SEARCH_CONSOLE` dans
  `src/index.html` (`<meta name="google-site-verification" ...>`).
- Soumettre le sitemap : `https://gamemarttn.netlify.app/sitemap.xml`.
- Le fichier `public/robots.txt` référence déjà le sitemap et exclut les pages privées.
- Le sitemap est généré automatiquement depuis `api/db.json` par `scripts/generate-sitemap.js`
  (`npm run sitemap`, exécuté aussi par `npm run build`). Il contient :
  - `/`, `/produits`, `/promotions` ;
  - toutes les catégories `/categorie/<genre>` ;
  - toutes les plateformes `/plateforme/<plateforme>` ;
  - toutes les fiches produits `/produits/<slug>` (ex. `/produits/gta_v`).

## 4. Variables d'environnement Netlify
Angular intègre les variables d'env au moment du build. Un script `scripts/inject-env.js` lit les
variables Netlify et remplace les placeholders avant le build.

Dans le dashboard Netlify → Site settings → Environment variables, ajoutez :
- `GA_MEASUREMENT_ID` = votre Measurement ID (ex: `G-ABC123`)
- `GTM_CONTAINER_ID` = votre Container ID (ex: `GTM-XYZ9`)
- `GSC_VERIFICATION_CODE` = votre code de vérification Search Console

Build command Netlify : `npm run build` (injection des variables + génération du sitemap + `ng build`).

Noms alternatifs acceptés : `GOOGLE_ANALYTICS_ID`, `GOOGLE_TAG_MANAGER_ID`,
`GOOGLE_SEARCH_CONSOLE_VERIFICATION`, `NG_APP_GA_ID`, `NG_APP_GTM_ID`, `NG_APP_GSC_CODE`.

Si les variables ne sont pas définies, les placeholders restent (utile en local).

## Fichiers modifiés
- `src/index.html`
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `src/app/app.ts`
- `src/app/app.routes.ts` (titles, descriptions, keywords par route)
- `src/app/services/analytics.service.ts`
- `src/app/services/seo.service.ts`
- `src/app/services/cart.service.ts`
- `src/app/services/product-content.service.ts`
- `src/app/utils/game-slug.ts`
- `src/app/components/produit-details/produit-details.ts`
- `src/app/components/checkout/checkout.ts`
- `src/app/components/order-confirmation/order-confirmation.ts`
- `scripts/generate-sitemap.js`
- `sitemap.xml`, `public/sitemap.xml`, `robots.txt`, `public/robots.txt`
