import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuarioService } from '../usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioRestaurante, UserRole } from '../../../models/usuario.model';
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
  adminRoles = [UserRole.Admin, UserRole.Gerente, UserRole.Empleado];
  isLoading = true;
  canCreate = false;
  isGlobalAdmin = false;
  displayedColumns: string[] = ['nombre', 'email', 'rol', 'activo', 'acciones'];

  ngOnInit(): void {
    this.checkPermissions();
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.isLoading = true;
    const currentRestId = this.authService.getSelectedRestaurantId();
    this.isGlobalAdmin = this.authService.isGlobalAdmin();

    if (this.isGlobalAdmin) {
      // SuperAdmin ve a todos
      this.usuarioService.getAll().subscribe({
        next: (data) => {
          // Para SuperAdmin, intentamos mostrar datos de roles si hay un restaurante seleccionado
          if (currentRestId) {
            this.usuarioService.getByRestaurante(currentRestId).subscribe(assignments => {
              this.usuarios = data.map(u => {
                const ass = assignments.find(a => a.usuarioId === u.id);
                return { ...u, rol: ass?.rol || u.rol };
              });
              this.isLoading = false;
            });
          } else {
            this.usuarios = data;
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error loading users', err);
          this.isLoading = false;
        }
      });
    } else if (currentRestId) {
      // Otros ven solo los de su restaurante seleccionado, combinando datos para tener el email
      forkJoin({
        users: this.usuarioService.getAll(),
        assignments: this.usuarioService.getByRestaurante(currentRestId)
      }).subscribe({
        next: (results) => {
          const filteredAssignments = this.applyHierarchyFilter(results.assignments);
          this.usuarios = filteredAssignments.map(ass => {
            const userData = results.users.find(u => u.id === ass.usuarioId);
            return {
              ...ass,
              nombre: userData?.nombre || ass.nombreUsuario,
              email: userData?.email,
              id: ass.usuarioId // Siempre usar el ID del usuario para editar/borrar
            };
          });
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading users and assignments', err);
          this.isLoading = false;
        }
      });
    } else {
      this.usuarios = [];
      this.isLoading = false;
    }
  }

  checkPermissions(): void {
    const perms = this.authService.getPermissionsValue();
    if (perms) {
      this.isGlobalAdmin = perms.puedeCrearRestaurantes;
      if (this.isGlobalAdmin) {
        this.canCreate = true;
        return;
      }
      this.canCreate = perms.restaurantes.some(r => r.puedeCrearUsuarios);
    }
  }

  applyHierarchyFilter(users: any[]): any[] {
    if (this.isGlobalAdmin) return users; // SuperAdmin ve todo
    const perms = this.authService.getPermissionsValue();
    if (!perms) return [];

    const currentRestId = this.authService.getSelectedRestaurantId();
    const myPerm = perms.restaurantes.find(r => r.restauranteId === currentRestId);
    if (!myPerm) return [];

    const myRole = myPerm.rol;

    // Filtrar: El rol del usuario en la lista debe ser >= al mío (Hierarchy: Admin=1, Gerente=2, Empleado=3)
    return users.filter(u => {
      const userRole = u.rol;
      // Si soy un usuario normal, solo veo usuarios con roles explicitos de restaurante (1, 2, 3)
      // y que sean de mi rango o inferior.
      // Hacemos una comprobación estricta para no ver SuperAdmins (que suelen no tener 'rol' de restaurante)
      if (userRole === undefined || userRole === null) return false;
      
      const numericRole = Number(userRole);
      return numericRole >= myRole && [1, 2, 3].includes(numericRole);
    });
  }

  getRoleName(role: any): string {
    switch (Number(role)) {
      case UserRole.Admin: return 'Administrador';
      case UserRole.Gerente: return 'Gerente';
      case UserRole.Empleado: return 'Empleado';
      default: return 'Usuario';
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

  deleteUser(id: number): void {
    this.usuarioService.delete(id).subscribe({
      next: () => {
        this.loadUsuarios();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error deleting user', err);
        this.isLoading = false;
      }
    });
  }
}
