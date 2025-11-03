import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../Models/user.model';
import { AuthService } from '../../../services/auth.service';
import { UserProfileService } from '../../../services/user-profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editMode = false;
  userForm: Partial<User> = {};
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService,private userProfileService: UserProfileService) {}

  ngOnInit(): void {

    this.user = this.authService.getCurrentUser();
    if (this.user) {
        this.userForm = {
          nom: this.user.nom,
          prenom: this.user.prenom,
          email: this.user.email,
          adresse: this.user.adresse
        };
      }
    
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (!this.user || !this.user.id) return;

    this.userProfileService.updateUserProfile(this.user.id, this.userForm).subscribe({
      next: (updatedUser) => {
        this.successMessage = 'Profil mis à jour avec succès';
        this.editMode = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour du profil';
        console.error('Erreur de mise à jour:', error);
      }
    });
  }
}