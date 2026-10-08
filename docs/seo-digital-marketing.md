# GameMart — Étude préalable SEO & Digital Marketing

> **Projet :** GameMart — application e-commerce de jeux vidéo (Angular 20 + TypeScript + RxJS + SCSS, API mock JSON Server).
> **Périmètre de cette étude :** analyse, documentation et préparation SEO / Digital Marketing.
> Aucune fonctionnalité métier ni backend n'a été modifiée.
> **Langue de la documentation :** français. **Marché prioritaire :** francophone (France, Belgique, Suisse,
> Maroc / Maghreb francophone). **Secondaire :** anglophone (si internationalisation future).
> **Fichiers liés :** `robots.txt`, `public/robots.txt`, `docs/seo-keywords.md`, `docs/seo-keywords.csv`.

**Sommaire**

1. [Présentation du projet](#1-présentation-du-projet)
2. [Objectifs SEO](#2-objectifs-seo)
3. [Objectifs Digital Marketing](#3-objectifs-digital-marketing)
4. [Étude préalable du marché](#4-étude-préalable-du-marché)
5. [Analyse du public cible](#5-analyse-du-public-cible)
6. [Personas](#6-personas)
7. [Intentions de recherche](#7-intentions-de-recherche)
8. [Recherche de mots-clés](#8-recherche-de-mots-clés)
9. [Analyse concurrentielle](#9-analyse-concurrentielle)
10. [Audit SEO du site existant](#10-audit-seo-du-site-existant)
11. [SEO technique](#11-seo-technique)
12. [SEO On-Page](#12-seo-on-page)
13. [SEO Off-Page](#13-seo-off-page)
14. [Architecture SEO recommandée](#14-architecture-seo-recommandée)
15. [Stratégie de contenu](#15-stratégie-de-contenu)
16. [Stratégie Digital Marketing](#16-stratégie-digital-marketing)
17. [Réseaux sociaux recommandés](#17-réseaux-sociaux-recommandés)
18. [KPI et indicateurs de performance](#18-kpi-et-indicateurs-de-performance)
19. [Plan d'action priorisé](#19-plan-daction-priorisé)
20. [Roadmap SEO / Digital Marketing](#20-roadmap-seodigital-marketing)
21. [Recommandations futures](#21-recommandations-futures)

---

## 1. Présentation du projet

**GameMart** est une application e-commerce moderne dédiée à la **vente de jeux vidéo** (source : `README.md`).

**Fonctionnalités réelles constatées (README + code) :**

- Page d'accueil : banner dynamique des jeux en promotion (slideshow), catégories illustrées avec filtrage
  automatique via query params, liste d'articles mis en avant (`src/app/home/`, `src/app/components/banner/`,
  `src/app/components/category-list/`, `src/app/components/featured-games/`).
- Catalogue `/produits` : filtres multi-critères (catégorie, prix, note), tri dynamique (prix, nouveautés,
  popularité), pagination, grille adaptative, ajout rapide panier et favoris.
- Fiche produit `/produitDetails/:id` : description riche, carousel d'images, trailer YouTube intégré,
  ajout panier/wishlist, stock visible, suggestions de produits similaires.
- Panier `/cart` : quantités, suppression, sous-total dynamique, frais de livraison calculés, vidage total/partiel.
- Compte utilisateur `/user/*` (protégé par `authGuard`) : profil, adresses (CRUD + adresse par défaut),
  historique commandes détaillé, wishlist.
- Tunnel d'achat : `/checkout` (protégé) avec résumé, gestion adresse/livraison, puis
  `/order-confirmation/:id` avec numéro de commande.
- Recherche universelle `/search` dans le header, résultats temps réel.
- Auth `/login`, `/register` (protégées par `nonAuthGuard` pour les visiteurs non connectés).
- Responsive mobile/tablette/desktop, thème glassmorphism, templating moderne `@if` / `@for`.

**Données catalogue :** `api/db.json` contient les jeux (ex. Cyberpunk 2077 — RPG futuriste, Red Dead
Redemption 2 — Aventure western monde ouvert), avec `title`, `platform` (PC), `genre`, `price`, `rating`,
`release_date`, `stock`, `description`, `cover_image`, `images`, `url_trailer`, `promo`, `popular`, `tags`.
C'est le socle réel pour les pages catégories et fiches produits SEO.

**Proposition de valeur (déduite du produit réel, sans invention) :** trouver, comparer et acheter rapidement
un jeu PC grâce à un catalogue filtrable, des fiches riches (images + trailer + note + stock) et un parcours
d'achat fluide jusqu'à la confirmation de commande.

**État web/SEO actuel :** application Angular **SPA à rendu client**, servie en dev sur `http://localhost:4200`.
Il existe donc une partie web exploitable, mais **aucune optimisation SEO** n'est en place (voir §10-12).

## 2. Objectifs SEO

Objectifs SMART à 6-12 mois après mise en ligne (domaine de production requis) :

| # | Objectif | Mesure | Échéance indicative |
|---|---|---|---|
| O-SEO-1 | Être indexé proprement : 100 % des URL publiques utiles indexées, 0 URL privée indexée | Search Console (couverture) | M1-M2 |
| O-SEO-2 | Positionner le catalogue et les fiches sur la longue traîne « acheter [titre] PC » | Top 20 sur 10 fiches jeux pilotes | M3-M6 |
| O-SEO-3 | Capturer l'intention « pas cher / promo » via une page Promotions + contenus bons plans | Top 20 sur 5 requêtes promo, trafic saisonnier (soldes, Black Friday, Noël) | M3-M6 |
| O-SEO-4 | Construire le trafic informationnel (guides, tops) qui alimente le catalogue | 8 articles publiés, CTR et liens internes suivis | M2-M6 |
| O-SEO-5 | Obtenir des résultats enrichis (avis produits, FAQ, fil d'Ariane) | Rich Results Test valide sur fiches + FAQ | M3-M5 |
| O-SEO-6 | Garantir les fondamentaux techniques (vitesse, mobile, Core Web Vitals) | PageSpeed ≥ 90 mobile sur pages clés, LCP/INP/CLS au vert | M1-M3 puis continu |

Non-objectifs assumés : pas de positionnement promis sur « jeux vidéo » seul à court terme (requête générique
ultra-concurrentielle face à Steam, Fnac, Micromania) ; priorité à la longue traîne et aux intentions
transactionnelles/commerciales ciblées.

## 3. Objectifs Digital Marketing

| # | Objectif | Mesure |
|---|---|---|
| O-MKT-1 | Générer les premières ventes traçables hors SEO (social, email) | Commandes attribuées / canal (UTM + analytics) |
| O-MKT-2 | Constituer une audience (followers + newsletter) | Abonnés, inscrits newsletter, taux d'ouverture |
| O-MKT-3 | Réduire l'hésitation à l'achat (preuve sociale, réassurance) | Avis clients, FAQ, pages livraison/retours, taux de conversion panier |
| O-MKT-4 | Fidéliser (wishlist, comptes, repeat) | % comptes actifs, wishlist → achat, réachat |
| O-MKT-5 | Tester la publicité de façon rentable uniquement sur intention forte | ROAS sur Google Search (marque + titres) et retargeting, jamais en aveugle |

## 4. Étude préalable du marché

**Problème auquel le produit répond :**
Les joueurs perdent du temps à chercher un jeu au bon prix, à vérifier s'il correspond à leurs goûts/config,
et à finaliser l'achat sur des parcours parfois lourds. Les acheteurs « cadeau » (non-joueurs) sont perdus
face aux genres, PEGI et configurations.

**Solution proposée (réelle) :**
GameMart centralise le parcours : catalogue filtrable/triable, recherche instantanée, fiches détaillées avec
trailer et suggestions similaires, panier + livraison calculée, checkout clair, suivi de commande, wishlist et
adresses mémorisées pour réachat rapide.

**Valeur ajoutée :** rapidité de navigation, comparabilité (prix, note, nouveauté, popularité), visuel immersif
(banner promos, carousels), continuité du parcours connecté (panier → commande → historique).

**Public cible :** voir §5-6 (joueurs réguliers à budget contraint, acheteurs cadeau débutants, passionnés PC
qui comparent).

**Besoins utilisateurs :** prix lisible et promos visibles ; information fiable avant achat (description, note,
trailer, stock) ; filtres efficaces ; tunnel d'achat rassurant (livraison, paiement, retours, suivi) ; aide au
choix (guides, tops, FAQ, suggestions similaires).

**Intentions de recherche potentielles :** voir §7 (acheter, comparer, se renseigner, naviguer vers la marque).

**Positionnement digital :** challenger « catalogue malin + fiches riches + bons plans » plutôt que géant du
volume. Ne pas affronter Steam/Epic sur le catalogue, mais gagner sur : SEO longue traîne par titre, pages
promos, contenus d'aide au choix, UX mobile, communautés (TikTok/YouTube/Instagram/Discord).

**Objectifs SEO / Digital Marketing :** voir §2-3.

**Canaux numériques pertinents :** SEO + blog, Google Search (ads ciblées), YouTube (trailers/tests),
TikTok/Instagram (formats courts gaming), Facebook (groupes + retargeting), Email (promos, paniers abandonnés),
Discord/communauté. LinkedIn et Google Business Profile : **non prioritaires** (voir §16 — pas de réseau
physique, cible B2C gaming).

**Opportunités :**
- Longue traîne par titre de jeu peu exploitée par les petits acteurs.
- Saisonnalité forte (soldes d'été/hiver, Black Friday, Noël, sorties de jeux) = pics « pas cher / promo ».
- Contenus vidéo natifs (trailers déjà intégrés aux fiches → déclinables YouTube Shorts/TikTok).
- Fiches riches + FAQ = éligibilité aux rich snippets.

**Risques :**
- SPA Angular à rendu client : sans SSR/pré-rendu, indexation et performances fragiles (risque majeur, voir §11).
- Concurrence dominatrice (Steam, Epic, Instant Gaming, Eneba, G2A, Fnac, Micromania) sur les requêtes génériques.
- Catalogue mock limité : sans enrichissement réel (prix, stock, descriptions uniques), risque de thin content.
- Images hotlinkées externes (`interfaceingame.com`…) : risque juridique, lenteur, absence d'attributs `alt`.
- Absence de domaine, d'avis clients et d'autorité au lancement (sandbox SEO).

## 5. Analyse du public cible

- **Cœur de cible :** 16-35 ans, joueurs PC, francophones, mobiles + desktop, sensibles au prix, habitués à
  YouTube/TikTok/Discord pour découvrir et comparer les jeux.
- **Cible secondaire :** parents/proches (25-50 ans) qui achètent un jeu en cadeau et ont besoin d'être guidés
  (PEGI, choix, livraison, retours).
- **Comportements :** recherche Google (« acheter… », « avis… », « promo… »), comparaison d'avis et de prix,
  visionnage de trailers/gameplay, lecture de tops/guides, abandon de panier si frais opaques.
- **Freins :** méfiance envers une boutique inconnue (paiement, livraison, retours), catalogue perçu comme limité,
  prix non compétitifs, fiche produit pauvre, frais de livraison tardifs.

## 6. Personas

> Personas réalistes, construits à partir du cahier des charges (catalogue, filtres, fiches + trailers, panier,
> checkout, wishlist, comptes) — aucune fonctionnalité inventée.

### Persona 1 — Yanis, 21 ans, étudiant gamer régulier à petit budget

- **Âge / situation :** 21 ans, étudiant, petit budget, joue sur PC.
- **Profil général :** joue chaque semaine (RPG, action, mondes ouverts), suit les promos, compare les prix avant
  tout achat.
- **Objectifs :** acheter ses jeux au meilleur prix sans attendre ; repérer vite les promos ; suivre ses envies
  (wishlist).
- **Besoins :** filtre prix, page promos claire, stock et prix visibles, checkout rapide.
- **Problèmes / frustrations :** prix trop élevés, promos ratées, frais de livraison découverts au dernier moment,
  fiches sans trailer ni avis.
- **Comportements numériques :** Google + YouTube (gameplay), groupes Discord/gaming, comparateurs de prix.
- **Habitudes de recherche :** « acheter [titre] PC pas cher », « jeux vidéo pas cher », « code promo », « soldes
  jeux vidéo 2026 ».
- **Appareils :** smartphone (découverte) + PC (achat/jeu).
- **Réseaux sociaux :** YouTube, TikTok, Discord, Instagram.
- **Motivations :** prix, promos, nouveautés, simplicité d'achat.
- **Freins :** boutique inconnue, catalogue jugé limité, paiement/livraison flous.
- **Intentions de recherche :** transactionnelles et commerciales.
- **Contenu attendu :** page Promotions, fiches prix/stock/avis, alertes bons plans, tops « petits prix ».

### Persona 2 — Salma, 34 ans, mère qui offre un jeu en cadeau (débutante gaming)

- **Âge / situation :** 34 ans, salariée, parent, non-joueuse, achète pour offrir.
- **Profil général :** veut faire plaisir sans se tromper, ne connaît ni les genres ni le PEGI ni les configs PC.
- **Objectifs :** choisir vite un jeu adapté (âge, goûts), commander simplement, être livrée à temps.
- **Besoins :** guides cadeaux, langage simple, FAQ (livraison, retours, paiement), pages services claires.
- **Problèmes / frustrations :** jargon gaming, peur de se tromper, tunnel d'achat anxiogène, retours compliqués.
- **Comportements numériques :** Google en langage naturel, Facebook/Instagram, avis clients, WhatsApp pour demander
  conseil.
- **Habitudes de recherche :** « quel jeu offrir ado », « comment choisir un jeu vidéo », « livraison/retours
  GameMart ».
- **Appareils :** smartphone en priorité.
- **Réseaux sociaux :** Facebook, Instagram, WhatsApp.
- **Motivations :** faire plaisir, simplicité, réassurance, livraison fiable.
- **Freins :** manque de confiance, informations techniques incompréhensibles, pas d'avis visibles.
- **Intentions de recherche :** informationnelles puis commerciales.
- **Contenu attendu :** guides cadeaux/débutants, FAQ, pages Livraison/Paiement/Retours, avis clients, wishlist
  partageable.

### Persona 3 — Mehdi, 27 ans, passionné PC qui compare tout

- **Âge / situation :** 27 ans, salarié, joueur PC exigeant (RPG, open world), gros consommateur d'avis/tests.
- **Profil général :** lit les tests, regarde les trailers/gameplay, compare les boutiques avant d'acheter.
- **Objectifs :** acheter en connaissance de cause (qualité, config, contenu), suivre nouveautés et notes.
- **Besoins :** fiches exhaustives (description, trailer, note, config requise à ajouter, suggestions similaires),
  tris nouveautés/popularité, comparatifs honnêtes.
- **Problèmes / frustrations :** descriptions copiées/minces, notes non expliquées, pas de config requise, catalogue
  sans profondeur.
- **Comportements numériques :** Google avancé, YouTube (tests), Reddit/Discord/forums, blogs spécialisés.
- **Habitudes de recherche :** « avis [titre] 2026 », « top RPG PC », « comparatif boutiques jeux », « config
  requise [titre] ».
- **Appareils :** PC (recherche/achat) + smartphone (veille).
- **Réseaux sociaux :** YouTube, Reddit, Discord, X/Twitter.
- **Motivations :** qualité, expertise, transparence, nouveautés.
- **Freins :** contenu générique, absence de preuves (avis, tests), SEO perçu comme « boutique vide ».
- **Intentions de recherche :** informationnelles et commerciales expertes.
- **Contenu attendu :** tests/avis détaillés, tops/guides, comparatifs, fiches riches avec trailer et FAQ.

## 7. Intentions de recherche

| Type | Exemples (FR) | Persona principal | Page cible GameMart | Priorité |
|---|---|---|---|---|
| Transactionnelle | acheter jeux vidéo en ligne ; acheter [titre] PC ; jeux vidéo pas cher | Yanis (+ Mehdi) | `/produits`, `/produitDetails/:id`, `/promotions` (à créer) | P0 |
| Commerciale | meilleur site acheter jeux PC ; comparatif boutiques ; avis [titre] | Mehdi (+ Yanis) | `/blog/*` comparatifs/tests → `/produits`, fiches | P0/P1 |
| Informationnelle | top RPG 2026 ; comment choisir un jeu ; soldes dates ; config PC | Salma (+ Mehdi) | `/blog/*`, FAQ, pages services | P1 |
| Navigationnelle | gamemart ; gamemart catalogue ; gamemart avis | Tous | `/`, `/produits`, page avis | P0 (marque) |

Versions anglaises (si i18n future) : `buy PC games cheap`, `video game deals`, `best open world games PC`,
`best place to buy PC games` — priorité P2/P3, voir `docs/seo-keywords.md`.

## 8. Recherche de mots-clés

Recherche structurée complète : **`docs/seo-keywords.md`** (lecture humaine) + **`docs/seo-keywords.csv`**
(exploitation tableur).

Périmètre couvert : principaux, secondaires (genres/plateformes du catalogue réel), longue traîne par titre
(Cyberpunk 2077, RDR2, …), informationnels, navigationnels (marque), commerciaux, transactionnels, questions
fréquentes (PAA/FAQ), variantes/synonymes FR + variantes EN, et table de correspondance
**Persona → Intention → Mot-clé → Contenu → Page cible**.

Règle d'honnêteté appliquée : aucun volume ni CPC inventé — chaque ligne indique
« À vérifier avec Google Keyword Planner / Google Trends / Semrush / Ahrefs » et une difficulté qualitative
(Faible/Moyenne/Forte) à valider avec ces outils.

## 9. Analyse concurrentielle

> Données publiques et observations produit uniquement. Parts de marché, trafic et backlinks exacts :
> à vérifier avec Semrush / Ahrefs / Similarweb. Aucune donnée privée prétendue.

| Concurrent | Positionnement | Public cible | Mots-clés probables | Forces SEO | Faiblesses SEO | Contenu | Opportunités pour GameMart |
|---|---|---|---|---|---|---|---|
| Steam (store.steampowered.com) | Leader incontesté, catalogue + communauté | Tous joueurs PC | « acheter [titre] PC », fiches jeux | Autorité massive, fiches par jeu, avis utilisateurs | Pages lourdes, peu de guides « cadeau » FR | Fiches, tags, avis, événements | Longue traîne FR + guides cadeaux/débutants que Steam ne fait pas |
| Epic Games Store | Concurrent direct, jeux gratuits réguliers | Joueurs prix-sensibles | « jeux gratuits », « promo jeux » | Marque + offres agressives | Catalogue/contenus éditoriaux plus minces | Promos, free games | Page bons plans + newsletter alertes |
| Instant Gaming / Eneba / G2A | Discounters de clés, prix cassés | Yanis-type (chasseurs de prix) | « [titre] pas cher », « clé CD pas cher » | Prix + affiliation massive, longue traîne prix | Confiance parfois débattue, contenu éditorial faible | Prix, comparateurs, affiliation | Réassurance (avis, livraison, retours, paiement) + fiches riches |
| Micromania / Fnac Gaming | Retail omnicanal FR + marketplaces | Grand public + parents (Salma-type) | « acheter jeu + console », requêtes locales | Autorité FR, maillage, magasins (SEO local) | Prix moins agressifs, UX parfois lourde | Guides cadeaux, magasins, avis | SEO local non pertinent pour GameMart → miser sur 100 % online + guides simples |
| CDiscount / Amazon (gaming) | Généralistes avec rayon gaming | Grand public | « jeu pas cher », requêtes cadeaux | Autorité domaine énorme | Fiches peu expertes gaming | Prix + avis généralistes | Expertise gaming (tests, configs, trailers) comme différenciateur |

**Enseignements :** ne pas viser les requêtes génériques tête (« jeux vidéo ») ; gagner sur (1) fiches titres +
FAQ + avis, (2) pages promos saisonnières, (3) guides cadeaux/débutants, (4) contenus experts (tops, tests,
configs) avec maillage vers le catalogue.

## 10. Audit SEO du site existant

Audit réalisé sur le code réel (`src/index.html`, routes `src/app/app.routes.ts`, templates HTML, `angular.json`,
`public/`, absence de `robots.txt`/`sitemap.xml` constatée avant cette étude).

### 10.1. SEO technique

| # | Problème | Impact SEO | Priorité | Recommandation | Action à réaliser |
|---|---|---|---|---|---|
| T-1 | SPA 100 % client-side, aucun SSR/SSG/pré-rendu | Google doit exécuter le JS : indexation lente/partielle, contenus catalogue/fiches mal indexés | Critique | Activer Angular SSR (`ng add @angular/ssr`) ou pré-rendu des routes publiques | Ticket P0 : SSR + test « view-source » et Search Console |
| T-2 | Aucun `robots.txt` avant cette étude | Contrôle du crawl impossible (panier, comptes, recherche) | Haute | Fichier créé (`robots.txt` + `public/robots.txt`) | Vérifier servi à `/robots.txt` en prod |
| T-3 | Aucun sitemap | Découverte des fiches lente, nouvelles pages non signalées | Haute | Générer `sitemap.xml` (build ou script sur `db.json`) + déclarer dans Search Console | Ticket P1 : génération auto + entrée robots |
| T-4 | URLs non SEO-friendly : `/produitDetails/:id` (camelCase, ID seul, pas de slug) | CTR et classement faibles, URLs non mémorables | Haute | Migrer vers `/jeux/:slug-:id` (ex. `/jeux/cyberpunk-2077-pc-1`) + redirections 301 | Ticket P1 : slugs + redirects, sans casser le guard |
| T-5 | `public/_redirects` en `/* /index.html 200` (SPA fallback) | Bon pour l'UX mais masque les 404 : risque de soft-404 et de duplication | Moyenne | Garder le fallback mais renvoyer de vraies 404 pour IDs inconnus + page 404 optimisée | Ticket P2 : composant 404 + tests |
| T-6 | Pas de canonical, pas de hreflang, `lang="en"` alors que contenu FR | Signaux linguistiques faux, duplication facettes (filtres/tri) | Haute | `lang="fr"`, canonical auto par page, `noindex` sur facettes/pagination profonde, hreflang si EN futur | Ticket P1 |
| T-7 | Dépendances CDN bloquantes (Bootstrap 5.0.2 CSS+JS, FontAwesome) dans `index.html` | LCP/CLS dégradés, SPOF si CDN lent | Haute | Self-héberger ou différer, préconnect, limiter à l'utile | Ticket P1 : audit PageSpeed avant/après |
| T-8 | Images externes hotlinkées sans optimisation ni dimensions | Lenteur, CLS, risque 404/hotlink, aucun `alt` SEO | Haute | Héberger/compresser (WebP/AVIF), `width/height`, lazy-load, `alt` descriptifs | Ticket P1 : pipeline images |
| T-9 | Aucune donnée structurée (Product, Breadcrumb, FAQ, Organization) | Pas de rich snippets (prix, avis, stock) | Moyenne | JSON-LD par type de page (voir §11) | Ticket P2 |
| T-10 | Maillage interne pauvre (header : Home/Products seulement ; footer à vérifier) | Profondeur de crawl et PageRank interne faibles | Moyenne | Menu catégories, footer sitemap-like, breadcrumbs, suggestions déjà existantes à mailler en liens | Ticket P2 |
| T-11 | Query params de filtres probablement crawlables, pas de pagination SEO | Duplicate content massif (`?prix=&tri=…`) | Moyenne | Canonical vers page catégorie + `noindex` facettes combinées, pagination `rel prev/next` + sitemap | Ticket P2 |

### 10.2. SEO On-Page

| # | Problème | Impact SEO | Priorité | Recommandation | Action à réaliser |
|---|---|---|---|---|---|
| O-1 | `<title>ECommerce</title>` générique sur tout le site | Aucun classement ni CTR | Critique | Titles uniques par page (modèles §12) + `TitleStrategy` Angular | Ticket P0 |
| O-2 | Aucune meta description | CTR organique faible, extraits auto | Haute | Descriptions uniques 150-160 car. par gabarit | Ticket P0/P1 |
| O-3 | Aucune meta Open Graph / Twitter Card | Partages sociaux sans visuel/titre | Moyenne | OG + Twitter par page (titre, description, image cover) | Ticket P2 |
| O-4 | H1 multiples ou absents selon pages ; brand en `<h4>` dans le header | Hiérarchie confuse pour Google | Haute | 1 H1 unique par page (ex. catalogue : « Catalogue jeux vidéo PC »), logo non-H1 | Ticket P1 : audit H1/H2/H3 par route |
| O-5 | Contenus minces : descriptions catalogue réutilisées telles quelles, pas de textes catégories | Thin content, pas de champ sémantique | Haute | Intro SEO 150-300 mots par page catégorie + fiches enrichies (avis, FAQ, config) | Ticket P1 : 3 catégories + 10 fiches pilotes |
| O-6 | Images/carousels sans `alt` (à vérifier composant par composant) | SEO image nul, accessibilité KO | Moyenne | `alt="[Titre] — [vue]"` unique, `alt=""` décoratif | Ticket P2 |
| O-7 | Slugs absents (IDs seuls) | Voir T-4 | Haute | Slugs FR (titre + plateforme) | Avec T-4 |
| O-8 | Duplication probable fiches vs descriptions éditeurs | Filtre duplicate content | Moyenne | Réécriture partielle + avis/FAQ uniques par fiche | Ticket P2 |
| O-9 | Pas de FAQ visible ni pages services (livraison, retours, paiement, contact) | Intentions Salma non captées, E-E-A-T faible | Haute | Créer `/livraison-paiement`, `/retours`, `/faq`, `/contact`, `/mentions-legales` | Ticket P1 |

### 10.3. SEO Off-Page

| # | Constat | Impact SEO | Priorité | Recommandation | Action à réaliser |
|---|---|---|---|---|---|
| F-1 | Autorité de domaine nulle (pas de domaine prod, 0 backlink) | Classement impossible sur requêtes concurrentielles au J1 | Haute | Campagne lancement : annuaires qualité, presse gaming, partenariats | Roadmap M1-M6, suivi Ahrefs/Semrush |
| F-2 | Aucun profil social/marques vérifiables | E-E-A-T et navigationnel faibles (« gamemart avis » vide) | Moyenne | Créer profils officiels homogènes + page presse/avis | Ticket P2 |
| F-3 | Backlinks potentiels non exploités (YouTube trailers, blogs, Discord, étudiants/gaming) | Manque de jus SEO et de trafic référent | Moyenne | Guest posts tests/jeux, partenariats streamers/micro-influence, codes affiliés | 2-3 partenariats pilotes M3-M6 |
| F-4 | Risque avis faux ou absence d'avis | Confiance et rich snippets Review impossibles | Moyenne | Collecte avis post-achat (tiers de confiance type Trustpilot/Avis Vérifiés) + schema Review | Ticket P2/P3 |

## 11. SEO technique

**Cibles :** Angular 20, `angular.json` (assets `public/ → /`, `src/assets → /assets`), `_redirects` SPA,
routes §1.

1. **Rendu :** passer en SSR (`@angular/ssr`) ou à défaut pré-rendu (prerender) des routes publiques
   (`/`, `/produits`, fiches jeux, pages services, articles). Tester : `curl` + view-source doit contenir le
   contenu, pas seulement `<app-root>`.
2. **`robots.txt` :** créé (`robots.txt` racine + `public/robots.txt` servi). Contenu : `Allow: /`,
   `Disallow: /cart /checkout /order-confirmation/ /user/ /login /register /search /api/`, ressources rendues
   autorisées, ligne `Sitemap:` à décommenter avec le domaine réel.
3. **Sitemap :** générer `sitemap.xml` (script Node lisant `api/db.json` + pages statiques + articles),
   `<lastmod>`, `<changefreq>`, priorité fiches promos/nouveautés ; soumettre dans Search Console ; référencer
   dans `robots.txt`.
4. **URLs :** migrer `/produitDetails/:id` → `/jeux/:slug-:id` ; catégories `/jeux/rpg-pc`, `/jeux/monde-ouvert` ;
   `/promotions`, `/nouveautes`, `/top-ventes` ; redirections 301 des anciennes URL ; minuscules, sans accents,
   tirets.
5. **Canonical / indexation :** canonical absolue par page ; `noindex,follow` sur `/search`, facettes combinées,
   pagination > N, pages privées + en-tête `X-Robots-Tag` si besoin ; vraies 404 pour jeux inexistants.
6. **Performance / Core Web Vitals :** budgets `angular.json` déjà définis (initial 2 MB warning / 5 MB error) à
   durcir ; self-hébergement Bootstrap/FontAwesome ou subset ; images WebP/AVIF + lazy + dimensions ; `preconnect`
   YouTube ; différer scripts non critiques ; objectif LCP < 2,5 s, INP < 200 ms, CLS < 0,1.
7. **Données structurées (JSON-LD) :** `Organization` + `WebSite` (avec `SearchAction` si recherche pertinente) sur
   `/` ; `Product` (+ `Offer`, `AggregateRating` quand avis réels, `availability`) sur fiches ; `BreadcrumbList` ;
   `FAQPage` sur FAQ/fiches ; `Article` sur blog ; `ItemList` sur catégories/tops. Valider via Rich Results Test.
8. **International :** `lang="fr"` immédiatement ; si version EN : sous-dossiers `/en/`, `hreflang` fr/en
   réciproques, contenus traduits (pas de traduction auto brute indexée).
9. **Sécurité/UX SEO :** HTTPS partout, redirections http→https et non-www→www (ou inverse) uniques, trailing
   slash cohérent, 404 utile avec liens, fils d'Ariane visibles et structurés.

## 12. SEO On-Page

**Gabarits à appliquer (FR, sans bourrage) :**

- **Accueil `/` :** Title « GameMart — Acheter des jeux vidéo PC en ligne | Promos & nouveautés » (~65 car.) ;
  meta « Catalogue de jeux vidéo PC, promotions, nouveautés et fiches détaillées avec trailers. Paiement sécurisé
  et suivi de commande. » ; H1 unique « Acheter des jeux vidéo PC en ligne » ; sections promos/catégories/
  populaires/top avec liens.
- **Catalogue `/produits` :** Title « Catalogue jeux vidéo PC | GameMart » ; H1 « Catalogue jeux vidéo PC » ;
  intro 150-300 mots + FAQ courte ; H2 par intention (Promotions, RPG, Monde ouvert, Nouveautés, Mieux notés).
- **Fiche `/jeux/:slug` :** Title « Acheter [Titre] PC — Prix, avis & trailer | GameMart » ; meta avec prix/stock/
  note (données réelles uniquement) ; H1 = titre du jeu ; H2 (Synopsis, Trailer, Avis, Configuration requise à
  ajouter, FAQ, Jeux similaires) ; JSON-LD Product ; `alt` images ; CTA panier/wishlist inchangés.
- **Pages catégories `/jeux/[genre]` :** un H1 par catégorie, texte unique, FAQ, maillage fiches ↔ catégorie ↔
  guides.
- **Pages services (`/livraison-paiement`, `/retours`, `/faq`, `/contact`) :** H1 question/intention, réponses
  courtes structurées, FAQPage schema, maillage vers checkout/aide.
- **Règles :** un seul H1 par page ; densité naturelle (synonymes §9 de `seo-keywords.md`) ; images renommées
  (`cyberpunk-2077-pc-cover.webp`) ; liens internes descriptifs (jamais « cliquez ici ») ; slugs FR ; pas de
  contenu dupliqué éditeur sans valeur ajoutée.

## 13. SEO Off-Page

Stratégie réaliste pour un nouveau domaine (0 autorité) :

1. **Fondations (M1-M2) :** profils officiels (YouTube, TikTok, Instagram, Facebook, X, Discord) avec même nom/
   logo/lien ; page « À propos / Presse » ; inscription annuaires qualité et justification locale si entité réelle
   (pas de faux avis).
2. **Contenu qui attire des liens (M2-M6) :** tops annuels (« Top RPG PC 2026 »), calendriers (soldes, sorties),
   guides cadeaux/config — formats citables par blogs/forums/presse.
3. **Partenariats (M3-M6) :** 2-3 micro-streamers/testeurs YouTube-TikTok (gameplay + lien fiche), guest posts sur
   blogs gaming/étudiants, partenariats écoles/associations gaming (tournois, codes promos traçables).
4. **Affiliation & comparateurs (M4+) :** uniquement si marge le permet ; comparer honnêtement (prix total livré).
5. **Avis (continu) :** collecte post-achat via tiers (Trustpilot/Avis Vérifiés) ; afficher note globale +
   schema `AggregateRating` uniquement sur avis réels ; répondre aux avis négatifs.
6. **Interdits :** achat de liens, PBN, spam commentaires/forums, faux avis, échange de liens massif — risque de
   pénalité manuelle.

## 14. Architecture SEO recommandée

```text
/                                    (accueil : promos, catégories, populaires, réassurance)
/produits                            (catalogue filtrable, canonical de base)
/jeux/rpg-pc                         (catégorie)
/jeux/monde-ouvert                   (catégorie)
/jeux/action-pc                      (catégorie)
/promotions                          (NOUVEAU : promos + saisonnalité)
/nouveautes                          (tri nouveautés, indexable)
/top-ventes                          (tri popularité, indexable)
/jeux/cyberpunk-2077-pc-1            (fiche : était /produitDetails/1 → 301)
/jeux/red-dead-redemption-2-pc-2     (fiche)
/blog/                               (hub éditorial)
/blog/top-jeux-rpg-2026
/blog/meilleurs-jeux-monde-ouvert-pc
/blog/comment-choisir-jeu-video-pc
/blog/quel-jeu-offrir-ado
/blog/soldes-jeux-video-2026
/livraison-paiement  /retours  /faq  /contact  /mentions-legales  (NOUVEAU, indexable)
/search                              (NOUVEAU : noindex — déjà existant, à déréférencer)
/cart  /checkout  /order-confirmation/:id  /user/*  /login  /register  (noindex, existants inchangés)
```

**Maillage :** accueil → catégories → fiches → guides → catégories (boucle) ; breadcrumbs sur fiches/guides ;
footer avec liens catégories/services/blog ; suggestions similaires déjà existantes transformées en vrais liens
avec ancres optimisées (« Voir [Titre] sur PC »).

## 15. Stratégie de contenu

**Types recommandés :** pages catégories (transactionnelles), fiches enrichies, guides d'achat/tops/comparatifs,
FAQ/services, contenus saisonniers (soldes, Black Friday, Noël, rentrée), vidéos (trailers, shorts tests) qui
renvoient vers fiches/guides.

**Pages principales à créer :** `/promotions`, `/nouveautes`, `/top-ventes`, 3-5 pages catégories
(RPG, Monde ouvert, Action, Aventure), 5 pages services (livraison-paiement, retours, FAQ, contact, mentions
légales), hub `/blog/`.

**Articles initiaux (8) :**

1. Top jeux RPG PC 2026 (Mehdi/Yanis — COM) → fiches RPG.
2. Meilleurs jeux monde ouvert PC (Yanis/Mehdi — COM) → fiches + catégorie.
3. Comment choisir un jeu vidéo PC quand on n'y connaît rien (Salma — INF) → catalogue + FAQ.
4. Quel jeu offrir à un ado gamer (Salma — COM) → wishlist + fiches tout public.
5. Jeux pas chers pour petit budget étudiant (Yanis — COM) → `/promotions`.
6. Avis/test [Titre pilote, ex. Cyberpunk 2077] : vaut-il le coup en 2026 ? (Mehdi — INF/COM) → fiche.
7. Soldes jeux vidéo 2026 : dates et bons plans (Yanis — INF/COM, saisonnier).
8. Comparatif : où acheter ses jeux PC en ligne (Mehdi/Yanis — COM) → GameMart vs alternatives, honnête.

**FAQ (schema) :** prix/livraison/retours/paiement/suivi, choix cadeau, config PC, stock, compte/wishlist.

**Calendrier éditorial initial (12 semaines) :**

| Semaines | Contenus | Objectif |
|---|---|---|
| S1-S2 | Pages services (5) + FAQ + gabarits titles/metas + 10 fiches pilotes enrichies | Fondations indexables |
| S3-S4 | `/promotions` + articles 3, 4 (cadeaux/débutants) | Capter Salma + longue traîne cadeau |
| S5-S6 | Articles 1, 2 (tops RPG/monde ouvert) + pages catégories RPG/monde ouvert | Capter Mehdi/Yanis COM |
| S7-S8 | Articles 5, 7 (petits prix, soldes) + newsletter promo | Saisonnalité prix |
| S9-S10 | Article 6 (test pilote) + FAQ fiches + avis clients | Preuve + rich snippets |
| S11-S12 | Article 8 (comparatif) + bilan Search Console + itération | Autorité + ajustement |

**Correspondance Persona → Intention → Mot-clé → Contenu → Page :** voir tableau de synthèse §10 de
`docs/seo-keywords.md`.

## 16. Stratégie Digital Marketing

Canaux **retenus** (pertinents gaming/B2C) et **écartés** (avec motif) :

| Canal | Retenu ? | Pourquoi | Objectif | Audience | Message | Contenu / Fréquence | KPI |
|---|---|---|---|---|---|---|---|
| SEO / Content | Oui | Intention forte, durable, aligné catalogue | Trafic qualifié → ventes | Yanis, Mehdi, Salma | « Le bon jeu, au bon prix, bien choisi » | Catégories + 8 articles + FAQ (calendrier §15) | Trafic organique, positions, CTR, conversion |
| Google Search (ads) | Oui (ciblée) | Capte « acheter [titre] » dès J1 | Ventes incrémentales | Yanis, Mehdi | Prix/stock/avis | Marque + titres catalogue, budget test ; stop si ROAS < seuil | ROAS, CPA, CTR, QS |
| YouTube | Oui | Trailers déjà en fiches ; tests/gameplay = preuve | Réassurance + trafic fiches | Mehdi, Yanis | « Voyez avant d'acheter » | Trailers, tests 5-10 min, Shorts / 1-2 sem. | Vues, watch time, clics fiches |
| TikTok | Oui | Découverte gaming massive, formats courts | Découverte + promos | Yanis | « Bons plans & pépites » | Bons plans, tops, unboxing / 3-5 sem. | Vues, abonnés, clics bio/UTM |
| Instagram | Oui | Visuel + parents cadeau | Considération | Salma, Yanis | « Offrez le bon jeu » | Carrousels guides, Reels, stories promos / 3 sem. | Reach, saves, clics |
| Facebook | Oui (communauté + retarget) | Groupes gaming/parents, retargeting panier | Conversion | Salma, Yanis | « Promo + réassurance » | Groupes, retargeting panier/wishlist / continu | ROAS retarget, CPA |
| Email | Oui | Panier abandonné, promos, nouveautés | Conversion + fidélisation | Tous (opt-in) | « Votre promo / votre panier vous attend » | Bienvenue, abandon panier J+1/J+3, promos mensuelles | Open, clic, conversion, CA/email |
| Discord / communauté | Oui (léger) | QG des gamers | Fidélisation, UGC | Yanis, Mehdi | « La communauté GameMart » | Annonces, entraide, sondages / hebdo | Membres actifs, UGC |
| Publicité display / influence large | Test uniquement | Coûteux sans preuve | Notoriété ciblée | — | — | Micro-influence traçable (codes UTM) | Coût/vente |
| LinkedIn | Non | B2B, hors cible gaming B2C | — | — | — | — | — |
| Google Business Profile | Non (sauf magasin réel) | Pas de point de vente : fiche locale inutile voire pénalisante | — | — | — | Réévaluer si boutique physique | — |

**Messages par persona :** Yanis → prix/promos ; Salma → simplicité/réassurance/cadeau ; Mehdi → expertise/tests/
transparence. Toujours rediriger vers la page exacte (fiche, catégorie, guide) avec UTM.

## 17. Réseaux sociaux recommandés

**Priorité 1 : YouTube + TikTok** (découverte et preuve gaming, réutilisation des trailers existants).
**Priorité 2 : Instagram + Facebook** (considération, parents, retargeting).
**Priorité 3 : Discord + X/Reddit** (communauté experte, écoute).
**Non prioritaires :** LinkedIn (B2B), Pinterest/Snapchat (faible alignement intention d'achat gaming ici).

Règles communes : nom/logo/bio/lien homogènes (navigationnel « gamemart »), 1 lien traçable (UTM) vers la page
exacte, calendrier tenable (mieux vaut 2 canaux actifs que 5 fantômes), modération et réponses rapides (preuve de
confiance pour Salma), droits musicaux/images respectés.

## 18. KPI et indicateurs de performance

| Famille | KPI | Outil | Cible indicative |
|---|---|---|---|
| Crawl/indexation | Pages indexées, erreurs couverture, sitemap lu | Search Console | 100 % utiles, 0 privée, sitemap OK |
| Positions | Top 3/10/20 par cluster (marque, titres, promo, guides) | Search Console + Semrush/Ahrefs | 10 fiches top 20 M6 |
| Trafic | Sessions organiques, pages/session, rebond par gabarit | GA4 | Croissance MoM après M2 |
| CTR/Contenu | CTR par title, conversions assistées blog → fiche → panier | Search Console + GA4 | CTR ≥ benchmarks, funnel suivi |
| Technique | LCP/INP/CLS, PageSpeed, erreurs JS, 404/301 | PageSpeed, CrUX, Search Console | Vert sur pages clés |
| Business | Commandes, CA, panier moyen, conversion, abandon panier | Backoffice + GA4 enhanced ecommerce | Baseline M1 puis +MoM |
| Social/email | Abonnés, vues, ER, open/clic email, CA/email | Natifs + routeur email | Baselines M1, objectifs M3/M6 |
| Off-page | Domain Rating, backlinks référents, avis (note/nombre) | Ahrefs/Semrush, Trustpilot | +DR, +liens qualité, note ≥ 4/5 |

Tableau de bord mensuel unique (1 page) : indexation → positions → trafic → conversion → CA → actions suivantes.

## 19. Plan d'action priorisé

Légende : P0 = critique, P1 = haute, P2 = moyenne, P3 = faible. Responsables indicatifs : DEV (dév),
SEO (rédac/SEO), MKT (social/email), PO (décision/domaine).

| Action | Priorité | Objectif | Responsable | Statut | Échéance |
|---|---|---|---|---|---|
| Choisir le domaine de production + HTTPS + Search Console/GA4 | P0 | Base mesurable | PO/DEV | À faire | M1 |
| Activer SSR/pré-rendu Angular + `lang="fr"` + titles/metas uniques | P0 | Indexation | DEV/SEO | À faire | M1 |
| Servir `robots.txt` (déjà créé) + générer `sitemap.xml` + décommenter ligne Sitemap | P0 | Crawl | DEV | Partiel (fichier créé) | M1 |
| Migrer `/produitDetails/:id` → `/jeux/:slug-:id` + 301 + canonical | P1 | URLs/CTR | DEV/SEO | À faire | M2 |
| Créer pages services (livraison, retours, FAQ, contact, légales) + FAQ schema | P1 | Réassurance + INF | SEO/DEV | À faire | M2 |
| Créer `/promotions` + enrichir 10 fiches pilotes (avis/FAQ/alt/trailer) | P1 | TRA longue traîne | SEO/DEV | À faire | M2-M3 |
| Optimiser images (WebP, dimensions, lazy, `alt`) + self-héberger CDN critiques | P1 | Vitesse/CLS | DEV | À faire | M2-M3 |
| Publier 8 articles + hub `/blog/` + maillage (calendrier §15) | P1 | COM/INF | SEO | À faire | M2-M4 |
| JSON-LD (Organization, Product, Breadcrumb, FAQ, Article) + Rich Results Test | P2 | Rich snippets | DEV/SEO | À faire | M3 |
| Lancer YouTube/TikTok + newsletter (bienvenue, panier abandonné) | P2 | Trafic/CRM | MKT | À faire | M2-M3 |
| Campagne avis post-achat + profils sociaux officiels + partenariats pilotes | P2 | E-E-A-T/liens | MKT/SEO | À faire | M3-M6 |
| Google Ads test (marque + titres) + retargeting panier | P2 | Ventes J1 | MKT | À faire | M3+ |
| Version EN (`/en/`, hreflang) | P3 | International | PO/DEV/SEO | À faire | M6+ |
| PWA / app mobile, programme fidélité, affiliation large | P3 | Fidélisation | PO | Idée | Backlog |

## 20. Roadmap SEO/Digital Marketing

| Phase | Période | Jalons | Livrables |
|---|---|---|---|
| Phase 0 — Fondations | M1 | Domaine, HTTPS, analytics, SSR, robots/sitemap, `lang`+titles/metas, 404 | Site indexable et mesurable |
| Phase 1 — Contenus qui vendent | M2-M3 | URLs slugs+301, services/FAQ, `/promotions`, 10 fiches pilotes, 4 premiers articles, images/Vitals | Catalogue + promos positionnables |
| Phase 2 — Autorité & acquisition | M3-M6 | 4 articles restants, JSON-LD, YouTube/TikTok, newsletter, avis, partenariats, Ads test | Trafic diversifié, premières ventes attribuées |
| Phase 3 — Scale saisonnier | M6+ (soldes, Black Friday, Noël) | Pages saisonnières, tops annuels, bilan semestriel, EN si validée | Pics saisonniers captés, itération data-driven |

## 21. Recommandations futures

1. **Ne pas indexer avant d'être prêt :** tant que SSR, titles/metas, robots/sitemap et pages services ne sont
   pas en place, freiner l'indexation (ex. `noindex` global de staging, mot de passe) puis ouvrir proprement.
2. **Enrichir le catalogue réel :** descriptions uniques par jeu, configuration PC requise, PEGI, genres/tags
   normalisés, prix/stock fiables — sans cela, le SEO plafonnera (thin content).
3. **Internaliser les images :** stopper le hotlink externe, créer un pipeline (upload → compression WebP/AVIF →
   `alt` → CDN propre) pour la vitesse, le SEO image et le juridique.
4. **Penser « preuve » en continu :** avis clients, tests vidéo, UGC Discord, transparence prix/frais — c'est ce
   qui fera préférer GameMart aux discounters.
5. **Préparer l'international seulement après la traction FR :** `/en/`, hreflang, traductions humaines, netlinking
   EN dédié ; ne pas indexer de traduction automatique brute.
6. **Outillage à prévoir :** Search Console + GA4 (gratuit), PageSpeed/CrUX (gratuit), puis 1 suite (Semrush ou
   Ahrefs) pour volumes/backlinks, 1 routeur email, 1 plateforme d'avis tiers.
7. **Gouvernance :** 1 responsable SEO/MKT, rituel mensuel (dashboard §18 → décisions), backlog P0→P3 tenu à jour,
   toute nouvelle page créée avec title/meta/H1/maillage/schema dès le J1.

---

*Documents associés : `docs/seo-keywords.md` (recherche détaillée), `docs/seo-keywords.csv` (exploitation),
`robots.txt` + `public/robots.txt` (crawl). Données externes (volumes, difficultés, autorité, trafic
concurrentiel) : à vérifier avec Google Keyword Planner / Trends / Search Console / Semrush / Ahrefs /
Similarweb — rien n'a été inventé dans cette étude.*
