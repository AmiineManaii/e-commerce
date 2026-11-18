import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from "../components/header/header";
import { Banner } from "../components/banner/banner";
import { CategoryList } from "../components/category-list/category-list";
import { FeaturedGamesComponent } from "../components/featured-games/featured-games";
import { Footer } from "../components/footer/footer";
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Header, Banner, CategoryList, FeaturedGamesComponent, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    // FAQ structurée de l'accueil (alignée avec la FAQ visible ci-dessous).
    this.seo.setFaqJsonLd([
      {
        question: 'Où acheter des jeux vidéo pas chers en Tunisie ?',
        answer:
          'Sur GameMart, le catalogue en ligne regroupe les jeux du moment et les classiques à prix réduit. Les promotions sont mises en avant directement sur la page d’accueil et dans la section « Jeux en promotions ».'
      },
      {
        question: 'Quelles plateformes sont disponibles ?',
        answer:
          'GameMart propose des jeux pour PC, PlayStation 5, Xbox Series X|S et Nintendo Switch. La plateforme est indiquée sur chaque fiche produit.'
      },
      {
        question: 'Comment suivre ma commande ?',
        answer:
          'Une fois la commande validée, connectez-vous à votre espace personnel puis ouvrez « Mes commandes » pour consulter son statut et son historique.'
      },
      {
        question: 'Puis-je offrir un jeu vidéo ?',
        answer:
          'Oui. Les jeux vidéo, les clés d’activation et les cartes cadeaux constituent d’excellentes idées de cadeau pour un joueur, quel que soit son âge ou sa plateforme.'
      }
    ]);
  }
}
