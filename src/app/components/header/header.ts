import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  constructor(private router: Router) { }

  onSearch(searchTerm: string) {
    if (searchTerm.trim() !== "") {
      this.router.navigate(['/search'], { queryParams: { q: searchTerm } });
    }
    else{
      alert("Entrer un mot cle pour effectuer la recherche")
    }
  }
}
