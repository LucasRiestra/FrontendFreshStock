import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RestauranteService } from '../restaurante.service';
import { AuthService } from '../../../core/services/auth.service';
import { Restaurante } from '../../../models/restaurante.model';
import { UserRole } from '../../../models/usuario.model';

@Component({
  selector: 'app-restaurante-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './restaurante-list.html',
  styleUrl: './restaurante-list.css',
})
export class RestauranteList implements OnInit {
  private restauranteService = inject(RestauranteService);
  private authService = inject(AuthService);

  restaurantes: Restaurante[] = [];
  isLoading = true;
  userRole: UserRole | undefined;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      console.log('Current user in RestauranteList:', user);
      this.userRole = user?.rol;
      this.loadRestaurantes(user?.restauranteId);
    });
  }

  loadRestaurantes(userRestauranteId: number | null | undefined): void {
    console.log('Loading restaurants. UserRole:', this.userRole, 'RestauranteId:', userRestauranteId);
    if (this.userRole !== UserRole.Admin && userRestauranteId) {
      // Si no es Admin y tiene ID, llamamos al endpoint específico por ID
      this.restauranteService.getById(userRestauranteId).subscribe({
        next: (data) => {
          this.restaurantes = [data];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading specific restaurant', err);
          this.isLoading = false;
        }
      });
    } else {
      // Si es Admin, traemos todos
      this.restauranteService.getAll().subscribe({
        next: (data) => {
          this.restaurantes = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading all restaurants', err);
          this.isLoading = false;
        }
      });
    }
  }
}
