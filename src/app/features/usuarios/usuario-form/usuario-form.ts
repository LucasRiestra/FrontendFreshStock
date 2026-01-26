import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../models/usuario.model';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css'
})
export class UsuarioForm implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);
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
    this.authService.selectedRestaurant$.subscribe(id => {
      this.selectedRestauranteId = id;
    });
    this.setupRoles();
  }

  setupRoles(): void {
    const perms = this.authService.getPermissionsValue();
    if (!perms) return;

    const isAdminGlobal = perms.puedeCrearRestaurantes;
    const currentRestId = this.authService.getSelectedRestaurantId();
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

  onSubmit(): void {
    if (this.userForm.invalid || !this.selectedRestauranteId) return;

    this.isLoading = true;
    const { rol, ...userData } = this.userForm.value;

    this.usuarioService.create(userData).pipe(
      switchMap(user => {
        return this.usuarioService.assignToRestaurante({
          usuarioId: user.id,
          restauranteId: this.selectedRestauranteId!,
          rol: rol
        });
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Usuario registrado y asignado con éxito', 'Éxito');
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error saving user', err);
        this.toastr.error('Error al registrar el usuario', 'Error');
      }
    });
  }
}
