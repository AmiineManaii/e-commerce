import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  onSearch(searchTerm: string) {
    console.log('Recherche pour :', searchTerm);
    // Ici, vous pouvez ajouter la logique pour effectuer la recherche, par exemple naviguer vers une page de résultats ou filtrer une liste.
  }
}
