import { Component, inject, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private zone = inject(NgZone);

  loginForm: FormGroup;
  isLoading = false;
  private returnUrl: string = '/restaurantes';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/restaurantes';
    console.log('Component initialized. target returnUrl:', this.returnUrl);
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Bienvenido', 'Inicio de sesión correcto');

        const target = this.returnUrl === '/login' ? '/restaurantes' : this.returnUrl;
        this.zone.run(() => this.router.navigateByUrl(target));
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login flow failed:', err);
        const message = err.status === 401 ? 'Credenciales incorrectas' : 'Error al conectar con el servidor';
        this.toastr.error(message, 'Error');
      }
    });
  }
}
