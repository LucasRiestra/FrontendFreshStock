import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { RestauranteService } from '../../restaurantes/restaurante.service';
import { UserRole } from '../../../models/usuario.model';
import { Restaurante } from '../../../models/restaurante.model';
import { switchMap, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-user-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './user-create-dialog.html',
  styleUrl: './user-create-dialog.css'
})
export class UserCreateDialog implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private restauranteService = inject(RestauranteService);
  private dialogRef = inject(MatDialogRef<UserCreateDialog>);
  private toastr = inject(ToastrService);

  userForm: FormGroup;
  isLoading = false;
  availableRoles: { value: number, label: string }[] = [];
  availableRestaurantes: Restaurante[] = [];

  constructor() {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      restauranteIds: [[], [Validators.required, Validators.minLength(1)]],
      rol: [UserRole.Empleado, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadRestaurantes();
    this.setupRoles();
  }

  loadRestaurantes(): void {
    const isGlobalAdmin = this.authService.isGlobalAdmin();

    if (isGlobalAdmin) {
      // SuperAdmin ve todos los restaurantes
      this.restauranteService.getAll().subscribe({
        next: (data) => this.availableRestaurantes = data,
        error: (err) => console.error('Error loading restaurants', err)
      });
    } else {
      // Otros usuarios ven solo sus restaurantes asignados
      this.restauranteService.getMisRestaurantes().subscribe({
        next: (data) => this.availableRestaurantes = data,
        error: (err) => console.error('Error loading restaurants', err)
      });
    }
  }

  setupRoles(): void {
    const isGlobalAdmin = this.authService.isGlobalAdmin();
    const perms = this.authService.getPermissionsValue();

    if (isGlobalAdmin) {
      // SuperAdmin puede asignar cualquier rol
      this.availableRoles = [
        { value: UserRole.Admin, label: 'Administrador' },
        { value: UserRole.Gerente, label: 'Gerente' },
        { value: UserRole.Empleado, label: 'Empleado' }
      ];
    } else if (perms) {
      // Verificar el rol más alto que tiene en algún restaurante
      const hasAdminRole = perms.restaurantes.some(r => r.rol === UserRole.Admin);
      const hasGerenteRole = perms.restaurantes.some(r => r.rol === UserRole.Gerente);

      if (hasAdminRole) {
        this.availableRoles = [
          { value: UserRole.Admin, label: 'Administrador' },
          { value: UserRole.Gerente, label: 'Gerente' },
          { value: UserRole.Empleado, label: 'Empleado' }
        ];
      } else if (hasGerenteRole) {
        this.availableRoles = [
          { value: UserRole.Gerente, label: 'Gerente' },
          { value: UserRole.Empleado, label: 'Empleado' }
        ];
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isLoading = true;
    const { rol, restauranteIds, ...userData } = this.userForm.value;

    this.usuarioService.create(userData).pipe(
      switchMap(user => {
        // Asignar el usuario a todos los restaurantes seleccionados
        if (restauranteIds?.length) {
          const assignments = restauranteIds.map((restId: number) =>
            this.usuarioService.assignToRestaurante({
              usuarioId: user.id,
              restauranteId: restId,
              rol: rol
            })
          );
          return forkJoin(assignments);
        }
        return of(user);
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Usuario creado y asignado con éxito', 'Éxito');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error saving user', err);
        this.toastr.error('Error al crear el usuario', 'Error');
      }
    });
  }
}
