import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PermisoRestaurante } from '../../../models/usuario.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private authService = inject(AuthService);
  
  permission: PermisoRestaurante | null = null;
  isGlobalAdmin = false;

  ngOnInit(): void {
    this.authService.permissions$.subscribe(() => {
      this.isGlobalAdmin = this.authService.isGlobalAdmin();
      this.updateCurrentPermission();
    });

    this.authService.selectedRestaurant$.subscribe(() => {
      this.updateCurrentPermission();
    });
  }

  private updateCurrentPermission(): void {
    const selectedId = this.authService.getSelectedRestaurantId();
    const perms = this.authService.getPermissionsValue();
    
    if (perms && selectedId) {
      this.permission = perms.restaurantes.find((r: PermisoRestaurante) => r.restauranteId === selectedId) || null;
    } else {
      this.permission = null;
    }
  }
}
