import { Component, Output, EventEmitter, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Output() toggleMenu = new EventEmitter<void>();

  toggleSidebar() {
    this.toggleMenu.emit();
  }

  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
