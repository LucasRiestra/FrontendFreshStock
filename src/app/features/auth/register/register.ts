import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RestauranteService } from '../../restaurantes/restaurante.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Restaurante } from '../../../models/restaurante.model';
import { UserRole } from '../../../models/usuario.model';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private restauranteService = inject(RestauranteService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  registerForm: FormGroup;
  isLoading = false;
  restaurantes: Restaurante[] = [];

  roles = Object.values(UserRole);

  constructor() {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: [UserRole.Empleado, [Validators.required]],
      restauranteId: [null]
    });
  }

  ngOnInit(): void {
    this.loadRestaurantes();
  }

  loadRestaurantes(): void {
    this.restauranteService.getAll().subscribe({
      next: (data) => this.restaurantes = data,
      error: (err) => console.error('Error loading restaurants for register', err)
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Usuario registrado con éxito', 'Registro');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.toastr.error('Error al registrar usuario', 'Error');
      }
    });
  }
}
