import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Genre } from '../../Models/game.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryList implements OnInit {
  categories: string[] = [];

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.getAllGames().subscribe(games => {
      const uniqueGenres = new Set<string>();
      games.forEach(game => {
        if (game.genre && !uniqueGenres.has(game.genre)) {
          uniqueGenres.add(game.genre);
        }
      });
      this.categories = Array.from(uniqueGenres);
    });
  }

  onCategoryClick(category: string): void {
    // Navigate to the games page with the selected category as a query parameter
    //navigator.navigate(['/games'], { queryParams: { category } });
  }
}
