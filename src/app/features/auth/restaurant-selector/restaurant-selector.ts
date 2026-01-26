import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { PermisoRestaurante } from '../../../models/usuario.model';

@Component({
  selector: 'app-restaurant-selector',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './restaurant-selector.html',
  styleUrl: './restaurant-selector.css'
})
export class RestaurantSelector implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);

  restaurantes: PermisoRestaurante[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.authService.permissions$.subscribe(perms => {
      if (perms) {
        this.restaurantes = perms.restaurantes;
        this.isLoading = false;
        
        // If they only have one, they shouldn't be here, but just in case:
        if (this.restaurantes.length === 1) {
          this.selectRestaurante(this.restaurantes[0].restauranteId);
        }
      } else {
        // No perms? Might need to login again or wait
        this.isLoading = false;
      }
    });
  }

  selectRestaurante(id: number): void {
    this.authService.setSelectedRestaurant(id);
    this.router.navigate(['/restaurantes']); // Temp redirect
  }
}
