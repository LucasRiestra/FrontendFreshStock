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

  usuarios: any[] = [];
  isLoading = true;
  canCreate = false;
  displayedColumns: string[] = ['nombre', 'email', 'activo', 'acciones'];

  ngOnInit(): void {
    this.checkPermissions();
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.isLoading = true;
    this.usuarioService.getAll().subscribe({
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

  checkPermissions(): void {
    const perms = this.authService.getPermissionsValue();
    if (perms) {
      // SuperAdmin puede crear usuarios
      if (perms.puedeCrearRestaurantes) {
        this.canCreate = true;
        return;
      }
      // Admin o Gerente de algún restaurante puede crear usuarios
      this.canCreate = perms.restaurantes.some(r => r.puedeCrearUsuarios);
    }
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(UserCreateDialog, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsuarios();
      }
    });
  }
}
