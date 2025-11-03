import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { UserProfileService } from '../../services/user-profile.service';
import { Order } from '../../Models/user.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss'
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam 
    //console.log(!id);
    if (!id) {
      console.log('Commande introuvable');
      this.error = 'Commande introuvable';
      this.loading = false;
      return;
    }
    this.userProfileService.getOrderDetails(id).subscribe({
      next: (order) => { this.order = order; this.loading = false; },
      error: (err) => { this.error = 'Erreur lors du chargement de la commande'; console.error(err); this.loading = false; }
    });
  }
}