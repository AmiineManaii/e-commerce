import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { categoryPath } from '../../utils/game-slug';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryList implements OnInit {
  categories: string[] = [];

  constructor(
    private gameService: GameService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.gameService.getAllGames().subscribe({
      next: (games) => {
        const list = Array.isArray(games) ? games : [];
        const uniqueGenres = new Set<string>();
        list.forEach(game => {
          if (game?.genre && !uniqueGenres.has(game.genre)) {
            uniqueGenres.add(game.genre);
          }
        });
        this.categories = Array.from(uniqueGenres);
      },
      error: (err) => console.error('category-list:', err)
    });
  }

  onCategoryClick(category: string): void {
    // Pages catégorie indexables : /categorie/action, /categorie/rpg...
    this.router.navigateByUrl(categoryPath(category));
  }
}
