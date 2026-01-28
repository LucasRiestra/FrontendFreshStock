import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, Usuario, PermisoUsuario } from '../../../models/usuario.model';
import { Observable, switchMap, of, forkJoin } from 'rxjs';

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
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  userForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  userId: number | null = null;
  originalUser: any = null;
  availableRoles: { value: number, label: string }[] = [];
  selectedRestauranteId: number | null = null;

  constructor() {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      rol: [UserRole.Empleado, [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = Number(id);
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUser(this.userId);
    } else {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }

    this.authService.selectedRestaurant$.subscribe(id => {
      this.selectedRestauranteId = id;
      this.setupRoles();
    });
  }

  loadUser(id: number): void {
    this.isLoading = true;
    this.usuarioService.getById(id).subscribe({
      next: (user) => {
        this.originalUser = user;
        this.userForm.patchValue({
          nombre: user.nombre,
          email: user.email
        });
        
        // Load role in current restaurant if exists
        const currentRestId = this.authService.getSelectedRestaurantId();
        if (currentRestId) {
          this.usuarioService.getByRestaurante(currentRestId).subscribe({
            next: (assignments) => {
              const myAssignment = assignments.find(a => a.usuarioId === id);
              if (myAssignment) {
                this.userForm.patchValue({ rol: myAssignment.rol });
              }
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading user', err);
        this.toastr.error('No se pudo cargar la información del usuario', 'Error');
        this.router.navigate(['/usuarios']);
      }
    });
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
    const { rol, password, ...userData } = this.userForm.value;
    
    // Prepare logic for create vs update
    if (this.isEditMode) {
      this.handleUpdate(userData, password, rol);
    } else {
      this.handleCreate(userData, password, rol);
    }
  }

  private handleCreate(userData: any, password: string, rol: UserRole): void {
    this.usuarioService.create({ ...userData, password }).pipe(
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

  private handleUpdate(userData: any, password: string, rol: UserRole): void {
    const updatePayload: any = { ...this.originalUser, ...userData, id: this.userId };
    if (password) updatePayload.password = password;

    const updateRequest = this.usuarioService.update(this.userId!, updatePayload);
    
    // Also update assignment role if changed
    // We need the assignment ID though...
    // Let's simplified and just update global profile for now, 
    // or fetch assignment first.
    
    const currentRestId = this.authService.getSelectedRestaurantId();
    if (currentRestId) {
      this.usuarioService.getByRestaurante(currentRestId).pipe(
        switchMap(assignments => {
          const myAssignment = assignments.find(a => a.usuarioId === this.userId);
          const ops: Observable<any>[] = [updateRequest];
          
          if (myAssignment && myAssignment.rol !== rol) {
            ops.push(this.usuarioService.updateAssignment(myAssignment.id, {
              id: myAssignment.id,
              rol: rol,
              activo: myAssignment.activo
            }));
          } else if (!myAssignment) {
            // If somehow not assigned, assign it
            ops.push(this.usuarioService.assignToRestaurante({
              usuarioId: this.userId!,
              restauranteId: currentRestId,
              rol: rol
            }));
          }
          
          return forkJoin(ops);
        })
      ).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Usuario actualizado con éxito', 'Éxito');
          this.router.navigate(['/usuarios']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error updating user', err);
          this.toastr.error('Error al actualizar el usuario', 'Error');
        }
      });
    } else {
      updateRequest.subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Usuario actualizado con éxito', 'Éxito');
          this.router.navigate(['/usuarios']);
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Error al actualizar el usuario', 'Error');
        }
      });
    }
  }
}
