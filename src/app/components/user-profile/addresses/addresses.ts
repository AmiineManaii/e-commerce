import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../../services/user-profile.service';
import { AuthService } from '../../../services/auth.service';
import { Address, User } from '../../../Models/user.model';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addresses.html',
  styleUrls: ['./addresses.scss']
})
export class AddressesComponent implements OnInit {
  addresses: Address[] = [];
  newAddress: Address = {
    nom: '',
    rue: '',
    ville: '',
    codePostal: '',
    pays: ''
  };
  editingAddress: Address | null = null;
  showAddForm = false;
  loading = true;
  error = '';
  successMessage = '';
  currentUser: User | null = null;

  constructor(private userProfileService: UserProfileService,private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.currentUser.id){
      this.error = 'Utilisateur non connecté';
      return;
    }
    else{
      
      this.userProfileService.getAddresses(this.currentUser.id).subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des adresses';
        this.loading = false;
        console.error(err);
      }
    });
    }
    
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.resetNewAddress();
    this.editingAddress = null;
  }

  resetNewAddress(): void {
    this.newAddress = {
      nom: '',
      rue: '',
      ville: '',
      codePostal: '',
      pays: ''
    };
  }

  saveAddress(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const addressToSave = { ...this.newAddress, userId: currentUser.id };
    
    this.userProfileService.addAddress(addressToSave).subscribe({
      next: () => {
        this.showAddForm = false;
        this.successMessage = 'Adresse ajoutée avec succès';
        this.resetNewAddress();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'ajout de l\'adresse';
        console.error(err);
      }
    });
  }

  editAddress(address: Address): void {
    this.editingAddress = { ...address };
    this.showAddForm = true;
    this.newAddress = { ...address };
  }

  updateAddress(): void {
    if (!this.editingAddress || !this.editingAddress.id) return;
    
    this.userProfileService.updateAddress(this.editingAddress.id, this.newAddress).subscribe({
      next: () => {
        this.showAddForm = false;
        this.editingAddress = null;
        this.successMessage = 'Adresse mise à jour avec succès';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour de l\'adresse';
        console.error(err);
      }
    });
  }

  deleteAddress(addressId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) return;
    
    this.userProfileService.deleteAddress(addressId).subscribe({
      next: () => {
        this.successMessage = 'Adresse supprimée avec succès';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression de l\'adresse';
        console.error(err);
      }
    });
  }

  setAsDefault(addressId: number): void {
    if (!this.currentUser || !this.currentUser.id) return;
    
    this.userProfileService.setDefaultAddress(this.currentUser.id, addressId).subscribe({
      next: () => {
        this.successMessage = 'Adresse définie par défaut';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.error = 'Erreur lors de la définition de l\'adresse par défaut';
        console.error(err);
      }
    });
  }
}