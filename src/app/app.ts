import { Component, signal } from '@angular/core';

import { Header } from "./components/header/header";
import { Banner } from "./components/banner/banner";
import { FeaturedGamesComponent } from "./components/featured-games/featured-games";
import { Footer } from "./components/footer/footer";
import { CategoryList } from "./components/category-list/category-list";

@Component({
  selector: 'app-root',
  imports: [ Header, Banner, FeaturedGamesComponent, Footer, CategoryList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('e-commerce');
}
