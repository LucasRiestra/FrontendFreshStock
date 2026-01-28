import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RestauranteService } from '../restaurante.service';
import { AuthService } from '../../../core/services/auth.service';
import { Restaurante } from '../../../models/restaurante.model';
import { Usuario, UserRole, PermisoUsuario } from '../../../models/usuario.model';
import { ActiveStatusPipe } from '../../../shared/pipes';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-restaurante-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
  private toastr = inject(ToastrService);

  restaurantes: Restaurante[] = [];
  isLoading = true;
  isGlobalAdmin = false;
  userPermissions: PermisoUsuario | null = null;
  currentUser: Usuario | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.authService.permissions$.subscribe(perms => {
      if (!perms) return; // No hacer nada si no hay permisos (logout)
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

  deleteRestaurante(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este restaurante? Esta acción no se puede deshacer.')) {
      this.restauranteService.delete(id).subscribe({
        next: () => {
          this.toastr.success('Restaurante eliminado', 'Éxito');
          this.loadRestaurantes();
        },
        error: (err) => {
          console.error('Error deleting restaurant', err);
          this.toastr.error('No se pudo eliminar el restaurante', 'Error');
        }
      });
    }
  }

  canEdit(restauranteId: number): boolean {
    if (this.isGlobalAdmin) return true;
    
    const perms = this.authService.getPermissionsValue();
    if (!perms) return false;

    const restPerm = perms.restaurantes.find(p => p.restauranteId === restauranteId);
    if (!restPerm) return false;

    // Admin (1) and Gerente (2) can edit
    return restPerm.rol === UserRole.Admin || restPerm.rol === UserRole.Gerente;
  }
}
