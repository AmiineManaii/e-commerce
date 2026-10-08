# GameMart — Recherche de mots-clés SEO (FR + EN)

> Projet : **GameMart** — e-commerce de jeux vidéo (catalogue, fiches produits avec trailers,
> filtres par catégorie/prix/note, panier, checkout, wishlist, comptes utilisateurs).
> Marché prioritaire : **francophone** (France, Belgique, Suisse, Maroc / Maghreb francophone).
> Secondaire : **anglophone** (variantes EN ci-dessous).
> Méthode : intentions de recherche alignées sur les 3 personas et les pages réelles du projet
> (`/`, `/produits`, `/produitDetails/:id`, `/search`, `/cart`, `/checkout`, `/login`, `/register`).
> Volumes et difficultés : **à vérifier avec Google Keyword Planner / Google Trends / Semrush / Ahrefs**.
> Aucun volume n'est inventé dans ce fichier — la colonne « Volume » indique la démarche de vérification.

Légende :
- **Intention** : INF = informationnelle, NAV = navigationnelle, COM = commerciale, TRA = transactionnelle.
- **Priorité** : P0 = critique, P1 = haute, P2 = moyenne, P3 = faible.
- **Difficulté** : Faible / Moyenne / Forte (estimation qualitative, à valider avec Semrush/Ahrefs).
- **Personas** : P-Yanis (joueur régulier petit budget), P-Salma (joueuse occasionnelle / cadeaux),
  P-Mehdi (passionné PC / expert qui compare).

---

## 1. Mots-clés principaux (requêtes cœur de site)

| Mot-clé | Intention | Persona | Page cible | Priorité | Difficulté estimée | Volume | Potentiel SEO | Contenu recommandé |
|---|---|---|---|---|---|---|---|---|
| acheter jeux vidéo en ligne | TRA | P-Yanis, P-Salma | `/produits` | P0 | Forte | À vérifier avec Google Keyword Planner / Semrush | Élevé (cœur business) | Page catalogue optimisée + H1 + textes catégorie |
| boutique jeux vidéo en ligne | TRA/COM | P-Yanis, P-Salma | `/` puis `/produits` | P0 | Forte | À vérifier avec Google Keyword Planner / Semrush | Élevé | Page d'accueil + maillage vers catalogue |
| jeux vidéo pas cher | TRA/COM | P-Yanis | `/produits` (filtre prix/promo) + page promo à créer | P0 | Forte | À vérifier avec Google Keyword Planner / Trends | Très élevé | Page « Promotions / Bonnes affaires » + banner SEO |
| catalogue jeux vidéo | COM | P-Mehdi, P-Yanis | `/produits` | P1 | Moyenne | À vérifier avec Google Keyword Planner | Élevé | Catalogue filtrable + contenus catégories |
| game store online (EN) | TRA | P-Mehdi | `/produits` (version EN future) | P2 | Forte | À vérifier avec Keyword Planner / Ahrefs | Moyen | Page EN dédiée (si i18n activée) |
| buy video games online (EN) | TRA | P-Mehdi | `/produits` (version EN future) | P2 | Forte | À vérifier avec Keyword Planner / Ahrefs | Moyen | Page EN dédiée |

## 2. Mots-clés secondaires (genres, plateformes, usages — alignés sur `db.json`)

| Mot-clé | Intention | Persona | Page cible | Priorité | Difficulté estimée | Volume | Potentiel SEO | Contenu recommandé |
|---|---|---|---|---|---|---|---|---|
| jeu RPG PC | COM/TRA | P-Mehdi, P-Yanis | `/produits?genre=RPG` (facette indexable à créer) | P1 | Moyenne | À vérifier avec Keyword Planner | Élevé | Page catégorie « Jeux RPG PC » |
| jeu aventure monde ouvert | COM | P-Yanis, P-Mehdi | `/produits?tags=open-world` | P1 | Moyenne | À vérifier avec Keyword Planner | Élevé | Page catégorie + guide « meilleurs mondes ouverts » |
| jeu action PC | COM/TRA | P-Yanis | `/produits?genre=Action` | P1 | Moyenne | À vérifier avec Keyword Planner | Élevé | Page catégorie |
| jeux promotion PC / jeux en promo | TRA | P-Yanis | `/promotions` (page à créer) | P0 | Moyenne | À vérifier avec Google Trends (pics : soldes, Black Friday) | Très élevé | Page promo + articles « bons plans » |
| jeux les plus populaires / jeux populaires 2026 | COM | P-Salma, P-Yanis | `/` (bloc featured) + `/produits?tri=popularite` | P1 | Moyenne | À vérifier avec Trends | Élevé | Bloc « Populaires » + article top |
| nouveautés jeux vidéo | COM | P-Mehdi | `/produits?tri=nouveautes` | P1 | Moyenne | À vérifier avec Keyword Planner | Élevé | Page « Nouveautés » triable |
| video game deals (EN) | TRA | P-Mehdi | `/promotions` (EN future) | P2 | Forte | À vérifier avec Ahrefs | Moyen | Page deals EN |
| cheap PC games (EN) | TRA | P-Yanis | `/produits` (EN future) | P2 | Forte | À vérifier avec Ahrefs | Moyen | Page EN |

## 3. Longue traîne (moins concurrentielle, forte conversion)

| Mot-clé | Intention | Persona | Page cible | Priorité | Difficulté estimée | Volume | Potentiel SEO | Contenu recommandé |
|---|---|---|---|---|---|---|---|---|
| acheter cyberpunk 2077 PC pas cher | TRA | P-Yanis | `/produitDetails/:id` (fiche Cyberpunk + slug SEO) | P1 | Faible-Moyenne | À vérifier avec Keyword Planner | Élevé | Fiche produit enrichie (avis, trailer, FAQ) |
| acheter red dead redemption 2 PC au meilleur prix | TRA | P-Yanis, P-Mehdi | `/produitDetails/:id` (fiche RDR2) | P1 | Faible-Moyenne | À vérifier avec Keyword Planner | Élevé | Fiche produit + comparatif prix |
| jeu RPG futuriste monde ouvert PC | COM | P-Mehdi | `/produits` + guide | P1 | Faible | À vérifier avec Keyword Planner | Élevé | Guide « meilleurs RPG futuristes » → maillage fiches |
| quel jeu offrir à un ado gamer | COM | P-Salma | `/blog/quel-jeu-offrir-ado` (à créer) | P1 | Faible | À vérifier avec Keyword Planner | Élevé | Article cadeaux + sélection wishlist |
| jeu pas cher pour petit budget étudiant | COM | P-Yanis | `/blog/jeux-pas-chers-etudiants` (à créer) | P1 | Faible | À vérifier avec Keyword Planner | Élevé | Sélection < 20 € + filtres prix |
| best open world games PC 2026 (EN) | COM | P-Mehdi | `/blog` EN futur | P3 | Moyenne | À vérifier avec Ahrefs | Moyen | Top EN |
| buy RPG games PC cheap (EN) | TRA | P-Mehdi | `/produits` EN futur | P3 | Moyenne | À vérifier avec Ahrefs | Moyen | Page catégorie EN |

## 4. Mots-clés informationnels (blog / guides / aide à la décision)

| Mot-clé | Intention | Persona | Page cible | Priorité | Difficulté estimée | Volume | Potentiel SEO | Contenu recommandé |
|---|---|---|---|---|---|---|---|---|
| top jeux RPG 2026 | INF/COM | P-Mehdi, P-Yanis | `/blog/top-jeux-rpg-2026` | P1 | Moyenne | À vérifier avec Trends | Élevé | Top + liens fiches produits |
| meilleurs jeux monde ouvert PC | INF/COM | P-Yanis, P-Mehdi | `/blog/meilleurs-jeux-monde-ouvert-pc` | P1 | Moyenne | À vérifier avec Keyword Planner | Élevé | Guide comparatif |
| comment choisir un jeu vidéo PC | INF | P-Salma | `/blog/comment-choisir-jeu-video-pc` | P1 | Faible | À vérifier avec Keyword Planner | Élevé | Guide débutant (config, genres, PEGI) |
| c'est quoi un jeu RPG / c'est quoi un open world | INF | P-Salma | `/blog/glossaire` ou FAQ | P2 | Faible | À vérifier avec Keyword Planner | Moyen | Contenu éducatif + glossaire |
| avis cyberpunk 2077 2026 vaut-il le coup | INF/COM | P-Yanis, P-Mehdi | fiche produit + article avis | P1 | Faible | À vérifier avec Trends | Élevé | Test/avis + note + trailer |
| soldes jeux vidéo dates 2026 | INF/COM | P-Yanis | `/blog/soldes-jeux-video-2026` | P1 | Moyenne (saisonnière) | À vérifier avec Trends | Élevé (pics) | Calendrier promos + alerte |
| how to choose a video game as a gift (EN) | INF | P-Salma | `/blog` EN futur | P3 | Faible | À vérifier avec Ahrefs | Moyen | Guide cadeau EN |

## 5. Mots-clés navigationnels (marque + accès direct)

| Mot-clé | Intention | Persona | Page cible | Priorité | Difficulté estimée | Volume | Potentiel SEO | Contenu recommandé |
|---|---|---|---|---|---|---|---|---|
| gamemart | NAV | Tous | `/` | P0 | Faible (marque) | À vérifier avec Search Console (après lancement) | Élevé | Logo + title + profils sociaux cohérents |
| gamemart jeux | NAV | Tous | `/produits` | P0 | Faible | À vérifier avec Search Console | Élevé | Maillage interne + sitemap |
| gamemart catalogue / gamemart promotions | NAV | P-Yanis | `/produits`, `/promotions` | P1 | Faible | À vérifier avec Search Console | Élevé | Pages dédiées + liens footer |
| gamemart avis | NAV/INF | P-Salma, P-Yanis | page avis / Trustpilot futur | P1 | Faible | À vérifier avec Search Console | Moyen | Page « Avis clients » + rich snippets Review |

## 6. Mots-clés commerciaux (comparaison avant achat)

| Mot-clé | Intention | Persona | Page cible | Priorité | Difficulté estimée | Volume | Potentiel SEO | Contenu recommandé |
|---|---|---|---|---|---|---|---|---|
| comparatif boutique jeux vidéo en ligne | COM | P-Mehdi, P-Yanis | `/blog/comparatif-boutiques-jeux-video` | P1 | Moyenne | À vérifier avec Semrush | Élevé | Comparatif honnête + forces GameMart (UX, filtres, trailers) |
| meilleur site pour acheter jeux PC | COM | P-Yanis, P-Mehdi | `/blog` + `/produits` | P0 | Forte | À vérifier avec Semrush | Très élevé | Page « Pourquoi GameMart » + preuves (avis, prix, service) |
| avis boutique jeux vidéo pas cher | COM | P-Salma | page avis + FAQ réassurance | P1 | Moyenne | À vérifier avec Semrush | Élevé | Preuves sociales, FAQ livraison/paiement |
| best place to buy PC games (EN) | COM | P-Mehdi | `/blog` EN futur | P3 | Forte | À vérifier avec Ahrefs | Moyen | Comparatif EN |

## 7. Mots-clés transactionnels (intention d'achat immédiate)

| Mot-clé | Intention | Persona | Page cible | Priorité | Difficulté estimée | Volume | Potentiel SEO | Contenu recommandé |
|---|---|---|---|---|---|---|---|---|
| acheter [titre du jeu] PC | TRA | P-Yanis, P-Mehdi | `/produitDetails/:id` (une fiche par jeu, slug avec titre) | P0 | Moyenne (par titre) | À vérifier avec Keyword Planner (par titre) | Très élevé | Fiche produit : prix, stock, trailer, avis, CTA |
| code promo gamemart / bon de réduction jeux | TRA | P-Yanis | `/promotions` + newsletter | P1 | Moyenne | À vérifier avec Trends | Élevé | Page promo + capture email |
| commander jeu vidéo en ligne livraison | TRA | P-Salma | `/checkout` (non indexée) + page « Livraison & paiement » indexable à créer | P1 | Moyenne | À vérifier avec Keyword Planner | Élevé | Page info livraison (rassure, ranke) |
| buy [game title] PC cheap (EN) | TRA | P-Mehdi | fiche produit EN future | P3 | Moyenne | À vérifier avec Ahrefs | Moyen | Fiche EN |

## 8. Questions fréquentes (FAQ + People Also Ask)

| Question | Intention | Persona | Page cible | Priorité | Contenu recommandé |
|---|---|---|---|---|---|
| Où acheter des jeux vidéo pas chers en ligne ? | COM/TRA | P-Yanis | `/produits` + FAQ | P0 | FAQ + page promo |
| Quel jeu vidéo offrir en cadeau ? | COM | P-Salma | `/blog/quel-jeu-offrir` + FAQ | P1 | Guide cadeaux + wishlist |
| Comment savoir si un jeu tourne sur mon PC ? | INF | P-Salma, P-Yanis | `/blog/config-pc-jeux` + fiche produit (config requise à ajouter) | P1 | Guide + bloc « configuration requise » par fiche |
| Quels sont les meilleurs RPG sur PC en 2026 ? | INF/COM | P-Mehdi | `/blog/top-jeux-rpg-2026` | P1 | Top + fiches |
| Comment fonctionne la livraison sur GameMart ? | INF/TRA | P-Salma | `/livraison-paiement` (page à créer) + FAQ | P1 | Page service + schema FAQ |
| Puis-je retourner un jeu acheté ? | INF | Tous | `/retours-remboursements` (page à créer) | P1 | Page service |
| Where to buy cheap PC games safely? (EN) | COM/TRA | P-Mehdi | page EN future | P3 | Guide EN |

## 9. Variantes, synonymes et déclinaisons (à travailler en champ sémantique, sans sur-optimisation)

- jeux vidéo / jeux video (sans accent) / JV / gaming
- acheter / commander / shop / boutique / store / magasin jeux vidéo
- pas cher / petit prix / promo / promotion / soldes / bon plan / réduction / discount (EN)
- PC / ordinateur / Steam-like (attention : ne pas utiliser la marque Steam dans les titles sans raison)
- RPG / jeu de rôle / role-playing game (EN)
- monde ouvert / open world (EN) / aventure / action-aventure
- nouveautés / nouvelles sorties / upcoming games (EN) / popularité / top ventes / best sellers (EN)
- fiche jeu / détail jeu / test / avis / trailer / bande-annonce / gameplay / note / rating
- panier / checkout / commande / livraison / paiement sécurisé / suivi commande / wishlist / favoris

## 10. Correspondance Persona → Intentions → Mots-clés → Contenu → Page cible (synthèse)

| Persona | Intentions dominantes | Exemples de mots-clés | Contenu | Page cible |
|---|---|---|---|---|
| P-Yanis (joueur régulier, petit budget) | TRA + COM (prix, promos) | jeux vidéo pas cher, acheter [titre] PC pas cher, code promo | Page promotions, fiches produits prix/stock, alertes bons plans | `/promotions`, `/produitDetails/:id`, `/produits` |
| P-Salma (acheteuse cadeau, débutante) | INF + COM (rassurance, choix) | quel jeu offrir, comment choisir jeu PC, livraison/retours | Guides cadeaux/débutants, FAQ, pages services | `/blog/*`, `/livraison-paiement`, `/produits` |
| P-Mehdi (passionné PC, compare) | INF + COM (tests, comparatifs) | top RPG 2026, avis [titre], comparatif boutiques | Tests, tops, comparatifs, fiches riches (trailer, config) | `/blog/*`, `/produitDetails/:id` |

---

### Notes de méthode et limites

- Aucune donnée de volume/difficulté n'est inventée : chaque ligne porte la mention
  « À vérifier avec… » et une estimation qualitative de difficulté (Faible/Moyenne/Forte).
- Prochaines étapes outillées : exporter les volumes depuis Keyword Planner, croiser avec
  Search Console après mise en ligne, prioriser les fiches jeux à plus forte demande
  (titres du catalogue `api/db.json`) et les pages saisonnières (soldes, Black Friday, Noël).
- Fichier CSV d'exploitation : `docs/seo-keywords.csv` (même périmètre, format tableur).
- Stratégie complète : `docs/seo-digital-marketing.md`.
