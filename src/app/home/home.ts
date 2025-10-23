import { Component } from '@angular/core';
import { Header } from "../components/header/header";
import { Banner } from "../components/banner/banner";
import { CategoryList } from "../components/category-list/category-list";
import { FeaturedGamesComponent } from "../components/featured-games/featured-games";
import { Footer } from "../components/footer/footer";

@Component({
  selector: 'app-home',
  imports: [Header, Banner, CategoryList, FeaturedGamesComponent, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
