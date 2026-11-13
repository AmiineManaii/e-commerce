# Captures du rapport SEO & Digital Marketing

Ce dossier documente les captures utilisées dans `rapport-seo-digital-marketing.md`.

Les images sont référencées en HTML (`<img src="docs/audit-screenshots/...">`) dans le
rapport, afin de respecter la consigne « pas de markdown d'image `![alt](url)` » tout
en affichant réellement les captures.

## Correspondance Figure → fichier

| Figure | Sujet | Fichier |
|---|---|---|
| 1 | Page d'accueil en production | `docs/audit-screenshots/site-accueil.png` |
| 2 | Page catalogue `/produits` | `docs/audit-screenshots/site-catalogue.png` |
| 3 | Audit — H1 manquants (42 URL) | `docs/audit-screenshots/04-h1-manquants.png` |
| 4 | Audit — titles dupliqués | `docs/audit-screenshots/01-titles-dupliques.png` |
| 5 | SERP concurrentielle (Tunisie) | `docs/audit-screenshots/12-mozbar-serp.png` |
| 6 | Profil de liens (Moz) | `docs/audit-screenshots/11-mozbar-site.png` |
| 7 | GTM — Versions | `docs/audit-screenshots/gtm-01-versions.png` |
| 8 | GTM — Balises | `docs/audit-screenshots/gtm-04-balises.png` |
| 9 | GTM — Espace de travail | `docs/audit-screenshots/gtm-02-accueil.jpg` |
| 10 | GTM — Déclencheurs | `docs/audit-screenshots/gtm-05-declencheurs.png` |
| 11 | GTM — Variables | `docs/audit-screenshots/gtm-06-variables.jpg` |
| 12 | GTM — Destinations | `docs/audit-screenshots/gtm-03-destinations.jpg` |
| 13 | GA4 — Temps réel (événements) | `docs/audit-screenshots/ga4-02-temps-reel-evenements.jpg` |
| 14 | GA4 — Instantané des rapports | `docs/audit-screenshots/ga4-01-rapports-vue-ensemble.jpg` |
| 15 | GA4 — Pages en temps réel | `docs/audit-screenshots/ga4-03-temps-reel-pages.png` |
| 16 | GSC — Vue d'ensemble | `docs/audit-screenshots/gsc-01-vue-ensemble.png` |
| 17 | GSC — Sitemaps | `docs/audit-screenshots/gsc-05-sitemaps.png` |
| 18 | GSC — Inspection d'URL | `docs/audit-screenshots/gsc-04-inspection-url.jpg` |
| 19 | GSC — Performances | `docs/audit-screenshots/gsc-02-performances.png` |
| 20 | GSC — Requêtes | `docs/audit-screenshots/gsc-03-requetes.jpg` |
| 21 | Sitemap XML servi en production | `docs/audit-screenshots/sitemap-xml.png` |
| 22 | robots.txt servi en production | `docs/audit-screenshots/robots-txt.png` |
| 23 | Crawl — codes de réponse 2xx | `docs/audit-screenshots/06-codes-reponse-2xx.png` |
| 24 | PageSpeed — accueil | `docs/audit-screenshots/09-pagespeed-accueil.png` |
| 25 | PageSpeed — fiche produit | `docs/audit-screenshots/10-pagespeed-fiche.png` |

## Comment régénérer les captures du site

Les figures 1, 2, 21 et 22 ont été capturées automatiquement avec Edge en mode headless :

```bash
msedge --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1440,1400 --virtual-time-budget=4000 \
  --screenshot="docs/audit-screenshots/site-accueil.png" \
  "https://gamemarttn.netlify.app/"
```
