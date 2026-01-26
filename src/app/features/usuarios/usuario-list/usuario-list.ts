import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuarioService } from '../usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioRestaurante } from '../../../models/usuario.model';
import { RouterModule } from '@angular/router';
import { UserCreateDialog } from '../user-create-dialog/user-create-dialog';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTableModule,
    MatDialogModule,
    RouterModule
  ],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.css',
})
export class UsuarioList implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  usuarios: UsuarioRestaurante[] = [];
  isLoading = true;
  canCreate = false;
  displayedColumns: string[] = ['nombre', 'email', 'rol', 'activo', 'acciones'];

  ngOnInit(): void {
    this.authService.selectedRestaurant$.subscribe(restId => {
      if (restId) {
        this.loadUsuarios(restId);
        this.checkPermissions(restId);
      }
    });
  }

  loadUsuarios(restId: number): void {
    this.isLoading = true;
    this.usuarioService.getByRestaurante(restId).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.isLoading = false;
      }
    });
  }

  checkPermissions(restId: number): void {
    const perms = this.authService.getPermissionsValue();
    if (perms) {
      if (perms.puedeCrearRestaurantes) { // Global Admin
        this.canCreate = true;
        return;
      }
      const resPerm = perms.restaurantes.find(r => r.restauranteId === restId);
      this.canCreate = resPerm?.puedeCrearUsuarios ?? false;
    }
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(UserCreateDialog, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const restId = this.authService.getSelectedRestaurantId();
        if (restId) this.loadUsuarios(restId);
      }
    });
  }
}
