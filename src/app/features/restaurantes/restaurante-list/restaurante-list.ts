import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RestauranteService } from '../restaurante.service';
import { AuthService } from '../../../core/services/auth.service';
import { Restaurante } from '../../../models/restaurante.model';
import { Usuario, UserRole, PermisoUsuario } from '../../../models/usuario.model';
import { ActiveStatusPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-restaurante-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ActiveStatusPipe
  ],
  templateUrl: './restaurante-list.html',
  styleUrl: './restaurante-list.css',
})
export class RestauranteList implements OnInit {
  private restauranteService = inject(RestauranteService);
  private authService = inject(AuthService);

  restaurantes: Restaurante[] = [];
  isLoading = true;
  isGlobalAdmin = false;
  userPermissions: PermisoUsuario | null = null;
  currentUser: Usuario | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.authService.permissions$.subscribe(() => {
      this.isGlobalAdmin = this.authService.isGlobalAdmin();
      this.loadRestaurantes();
    });
  }

  loadRestaurantes(): void {
    if (this.isGlobalAdmin) {
      // Si es Admin global, traemos todos
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
    } else {
      // Si no es Admin global, traemos sus restaurantes
      this.restauranteService.getMisRestaurantes().subscribe({
        next: (data) => {
          this.restaurantes = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading my restaurants', err);
          this.isLoading = false;
        }
      });
    }
  }
}
