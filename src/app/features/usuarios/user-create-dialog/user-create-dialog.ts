import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../models/usuario.model';
import { switchMap } from 'rxjs';

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
  private dialogRef = inject(MatDialogRef<UserCreateDialog>);
  private toastr = inject(ToastrService);

  userForm: FormGroup;
  isLoading = false;
  availableRoles: { value: number, label: string }[] = [];
  selectedRestauranteId: number | null = null;

  constructor() {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: [UserRole.Empleado, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.selectedRestauranteId = this.authService.getSelectedRestaurantId();
    this.setupRoles();
  }

  setupRoles(): void {
    const perms = this.authService.getPermissionsValue();
    if (!perms) return;

    const isAdminGlobal = this.authService.isGlobalAdmin();
    const currentRestId = this.selectedRestauranteId;
    const currentResPerm = perms.restaurantes.find(r => r.restauranteId === currentRestId);
    const myRole = currentResPerm?.rol;

    if (isAdminGlobal || myRole === UserRole.Admin) {
      this.availableRoles = [
        { value: UserRole.Admin, label: 'Administrador' },
        { value: UserRole.Gerente, label: 'Gerente' },
        { value: UserRole.Empleado, label: 'Empleado' }
      ];
    } else if (myRole === UserRole.Gerente) {
      this.availableRoles = [
        { value: UserRole.Gerente, label: 'Gerente' },
        { value: UserRole.Empleado, label: 'Empleado' }
      ];
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isLoading = true;
    const { rol, ...userData } = this.userForm.value;

    this.usuarioService.create(userData).pipe(
      switchMap(user => {
        // If a restaurant is selected, assign the user to it
        if (this.selectedRestauranteId) {
          return this.usuarioService.assignToRestaurante({
            usuarioId: user.id,
            restauranteId: this.selectedRestauranteId,
            rol: rol
          });
        }
        return [user]; // Just return the user if no restaurant assignment needed
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Usuario registrado con éxito', 'Éxito');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error saving user', err);
        this.toastr.error('Error al registrar el usuario', 'Error');
      }
    });
  }
}
