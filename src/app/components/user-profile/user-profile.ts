import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Footer } from "../../components/footer/footer";
import { Header } from "../../components/header/header";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, Footer, Header],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfileComponent {
  navItems = [
    { path: 'profile', label: 'Mon Profil' },
    { path: 'orders', label: 'Mes Commandes' },
    { path: 'wishlist', label: 'Liste de Souhaits' },
    { path: 'addresses', label: 'Mes Adresses' }
  ];
}