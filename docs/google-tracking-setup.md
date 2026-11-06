# Mise en place Google Analytics, Google Tag Manager et Google Search Console

## 1. Google Analytics (GA4)
- Créer une propriété GA4 sur https://analytics.google.com
- Récupérer le **Measurement ID** (format `G-XXXXXXXXXX`).
- Remplacer `G-XXXXXXXXXX` dans :
  - `src/index.html` (bloc gtag.js)
  - `src/environments/environment.prod.ts` (`googleAnalyticsId`)
- Tracking SPA : `AnalyticsService` envoie un `page_view` à chaque navigation via les événements du Router.
- Événements e-commerce trackés : `view_item`, `add_to_cart`, `purchase`.

## 2. Google Tag Manager (GTM)
- Créer un conteneur sur https://tagmanager.google.com
- Récupérer le **Container ID** (format `GTM-XXXXXXX`).
- Remplacer `GTM-XXXXXXX` dans :
  - `src/index.html` (script + noscript iframe)
  - `src/environments/environment.prod.ts` (`googleTagManagerId`)
- Les événements sont aussi poussés dans `dataLayer` pour être exploités par GTM.
- ⚠️ Si vous configurez GA4 comme tag dans GTM, supprimez le bloc gtag.js direct dans `index.html` pour éviter le double comptage.

## 3. Google Search Console
- Ajouter la propriété sur https://search.google.com/search-console
- Méthode de vérification recommandée : balise HTML.
- Copier le code fourni et remplacer `REMPLACER_PAR_VOTRE_CODE_SEARCH_CONSOLE` dans `src/index.html` (`<meta name="google-site-verification" ...>`).
- Soumettre le sitemap : `https://gamemarttn.netlify.app/sitemap.xml`.
- Le fichier `public/robots.txt` référence déjà le sitemap.

## 4. Variables d'environnement Netlify
Angular intègre les variables d'env au moment du build. Un script `scripts/inject-env.js` lit les variables Netlify et remplace les placeholders avant le build.

Dans le dashboard Netlify → Site settings → Environment variables, ajoutez :
- `GA_MEASUREMENT_ID` = votre Measurement ID (ex: `G-ABC123`)
- `GTM_CONTAINER_ID` = votre Container ID (ex: `GTM-XYZ9`)
- `GSC_VERIFICATION_CODE` = votre code de vérification Search Console

Build command Netlify : `npm run build` (le script d'injection s'exécute automatiquement avant `ng build`).

Noms alternatifs acceptés : `GOOGLE_ANALYTICS_ID`, `GOOGLE_TAG_MANAGER_ID`, `GOOGLE_SEARCH_CONSOLE_VERIFICATION`, `NG_APP_GA_ID`, `NG_APP_GTM_ID`, `NG_APP_GSC_CODE`.

Si les variables ne sont pas définies, les placeholders restent (utile en local).

## Fichiers modifiés
- `src/index.html`
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `src/app/app.ts`
- `src/app/services/analytics.service.ts` (nouveau)
- `src/app/services/cart.service.ts`
- `src/app/components/produit-details/produit-details.ts`
- `src/app/components/order-confirmation/order-confirmation.ts`
