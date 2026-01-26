import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();

  toggleSidebar() {
    this.toggleMenu.emit();
  }

  private authService = inject(AuthService);
  
  userName: string = 'Usuario';
  restaurantName: string | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.userName = user?.nombre || 'Usuario';
    });

    this.authService.selectedRestaurant$.subscribe(id => {
      this.updateRestaurantName(id);
    });
  }

  private updateRestaurantName(id: number | null): void {
    const perms = this.authService.getPermissionsValue();
    if (perms && id) {
      const res = perms.restaurantes.find(r => r.restauranteId === id);
      this.restaurantName = res ? res.nombreRestaurante : null;
    } else {
      this.restaurantName = null;
    }
  }

  logout() {
    this.authService.logout();
  }
}
