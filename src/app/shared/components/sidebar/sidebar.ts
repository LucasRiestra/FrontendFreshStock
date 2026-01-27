import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private authService = inject(AuthService);

  isGlobalAdmin = false;
  canCreateCategories = false;
  canCreateProviders = false;
  canManageInventory = false;
  canCreateUsers = false;

  ngOnInit(): void {
    this.authService.permissions$.subscribe(perms => {
      if (!perms) return; // No hacer nada si no hay permisos (logout)
      this.updatePermissions();
    });
  }

  private updatePermissions(): void {
    const perms = this.authService.getPermissionsValue();
    this.isGlobalAdmin = this.authService.isGlobalAdmin();

    if (perms?.restaurantes?.length) {
      // Verificar si tiene el permiso en ALGUNO de sus restaurantes
      this.canCreateCategories = perms.restaurantes.some(r => r.puedeCrearCategorias);
      this.canCreateProviders = perms.restaurantes.some(r => r.puedeCrearProveedores);
      this.canManageInventory = perms.restaurantes.some(r => r.puedeGestionarInventario);
      this.canCreateUsers = perms.restaurantes.some(r => r.puedeCrearUsuarios);
    } else {
      this.canCreateCategories = false;
      this.canCreateProviders = false;
      this.canManageInventory = false;
      this.canCreateUsers = false;
    }
  }
}
