import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { RestauranteService } from '../restaurante.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, switchMap, of } from 'rxjs';
import { PermisoUsuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-restaurante-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './restaurante-form.html',
  styleUrl: './restaurante-form.css'
})
export class RestauranteForm implements OnInit {
  private fb = inject(FormBuilder);
  private restauranteService = inject(RestauranteService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  restauranteForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  restauranteId: number | null = null;
  originalRestaurante: any = null;

  constructor() {
    this.restauranteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(255)]],
      telefono: ['', [Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.restauranteId = Number(id);
      this.loadRestaurante(this.restauranteId);
    }
  }

  loadRestaurante(id: number): void {
    this.isLoading = true;
    this.restauranteService.getById(id).subscribe({
      next: (data) => {
        this.originalRestaurante = data;
        this.restauranteForm.patchValue(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading restaurant', err);
        this.toastr.error('No se pudo cargar la información del restaurante', 'Error');
        this.router.navigate(['/restaurantes']);
      }
    });
  }

  onSubmit(): void {
    if (this.restauranteForm.invalid) return;

    this.isLoading = true;
    const updateData = { ...this.originalRestaurante, ...this.restauranteForm.value, id: this.restauranteId };
    
    const request$: Observable<any> = this.isEditMode 
      ? this.restauranteService.update(this.restauranteId!, updateData)
      : this.restauranteService.create(this.restauranteForm.value);

    request$.pipe(
      switchMap(() => {
        // After creating or updating, we refresh permissions to see the new/updated restaurant in the list/context
        return this.authService.getPermissions();
      })
    ).subscribe({
      next: (perms: PermisoUsuario) => {
        this.isLoading = false;
        // Update permissions in store
        this.authService.storePermissions(perms);
        const msg = this.isEditMode ? 'Restaurante actualizado con éxito' : 'Restaurante creado con éxito';
        this.toastr.success(msg, 'Éxito');
        this.router.navigate(['/restaurantes']);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} restaurant`, err);
        const msg = this.isEditMode ? 'Error al actualizar el restaurante' : 'Error al crear el restaurante';
        this.toastr.error(msg, 'Error');
      }
    });
  }
}
