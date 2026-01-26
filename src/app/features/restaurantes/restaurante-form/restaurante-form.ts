import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { RestauranteService } from '../restaurante.service';
import { AuthService } from '../../../core/services/auth.service';
import { switchMap } from 'rxjs';

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
  private toastr = inject(ToastrService);

  restauranteForm: FormGroup;
  isLoading = false;

  constructor() {
    this.restauranteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(255)]],
      telefono: ['', [Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.restauranteForm.invalid) return;

    this.isLoading = true;
    this.restauranteService.create(this.restauranteForm.value).pipe(
      switchMap(() => {
        // After creating, we refresh permissions to see the new restaurant in the list/context
        return this.authService.getPermissions();
      })
    ).subscribe({
      next: (perms) => {
        this.isLoading = false;
        // Update permissions in store
        (this.authService as any).storePermissions(perms);
        this.toastr.success('Restaurante creado con éxito', 'Éxito');
        this.router.navigate(['/restaurantes']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating restaurant', err);
        this.toastr.error('Error al crear el restaurante', 'Error');
      }
    });
  }
}
