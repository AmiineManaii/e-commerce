import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../Models/game.model';
import { GameService } from '../services/game.service';
import { Header } from "../components/header/header";


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent implements OnInit {
  searchTerm: string = '';
  games: Game[] = [];
  filteredGames: Game[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private gameService: GameService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'];
      this.gameService.getAllGames().subscribe(allGames =>
        
        {
        this.games = allGames;
        this.filterGames();
        });
    
    });
  }

  filterGames(): void {

    if (this.searchTerm!== '') {

      this.filteredGames = this.games.filter(game =>

        game.title.toLowerCase().includes(this.searchTerm!.toLowerCase()) ||
        (game.description.toLowerCase().includes(this.searchTerm!.toLowerCase()))
      );
    } else {
      this.filteredGames = this.games;
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}

