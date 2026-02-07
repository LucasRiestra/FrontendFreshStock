import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InventarioService } from '../inventario.service';
import { RestauranteService } from '../../restaurantes/restaurante.service';
import { InventarioResumen } from '../../../models/inventario.model';
import { Restaurante } from '../../../models/restaurante.model';
import { EstadoInventario } from '../../../models/enums';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './stock-list.html',
  styleUrl: './stock-list.css',
})
export class StockList implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private inventarioService = inject(InventarioService);
  private restauranteService = inject(RestauranteService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  private destroy$ = new Subject<void>();

  inventarios: InventarioResumen[] = [];
  isLoading = false;
  selectedRestaurantId: number | null = null;
  EstadoInventario = EstadoInventario;

  isGlobalAdmin = false;
  restaurantes: Restaurante[] = [];

  ngOnInit(): void {
    this.isGlobalAdmin = this.authService.isGlobalAdmin();

    if (this.isGlobalAdmin) {
      this.loadRestaurantes();
    }

    // Suscribirse a cambios de restaurante selecccionado (Header)
    this.authService.selectedRestaurant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        this.selectedRestaurantId = id;
        if (id) {
          this.loadInventarios(id);
        } else {
          this.inventarios = [];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRestaurantes(): void {
    this.restauranteService.getAll().subscribe({
      next: (data) => this.restaurantes = data,
      error: (err) => console.error('Error loading restaurants', err)
    });
  }

  onRestaurantSelectionChange(event: any): void {
    const newId = event.value;
    if (newId) {
      this.authService.setSelectedRestaurant(newId);
    }
  }

  loadInventarios(restauranteId: number): void {
    this.isLoading = true;
    this.inventarioService.getByRestaurante(restauranteId).subscribe({
      next: (data) => {
        this.inventarios = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar inventarios', err);
        this.toastr.error('Error al cargar el historial de inventarios');
        this.isLoading = false;
      }
    });
  }

  iniciarNuevoInventario(): void {
    if (!this.selectedRestaurantId) {
      this.toastr.warning('Por favor seleccione un restaurante primero');
      return;
    }

    const enProgreso = this.inventarios.find(i => i.estado === EstadoInventario.EnProgreso);
    if (enProgreso) {
      this.continuarInventario(enProgreso.id);
      return;
    }

    this.isLoading = true;
    this.inventarioService.createInventario({
      restauranteId: this.selectedRestaurantId,
      nombre: `Inventario ${new Date().toLocaleDateString()}`
    }).subscribe({
      next: (inv) => {
        this.toastr.success('Nuevo inventario iniciado');
        this.router.navigate(['/inventario/detalle', inv.id]);
      },
      error: (err) => {
        this.toastr.error('No se pudo crear el inventario');
        this.isLoading = false;
      }
    });
  }

  continuarInventario(id: number): void {
    this.router.navigate(['/inventario/detalle', id]);
  }

  eliminarInventario(event: Event, inv: InventarioResumen): void {
    event.stopPropagation(); // Evitar navegar al detalle

    if (confirm(`¿Está seguro de que desea eliminar el inventario "${inv.nombre}"? Esta acción no se puede deshacer.`)) {
      this.isLoading = true;
      this.inventarioService.deleteInventario(inv.id).subscribe({
        next: () => {
          this.toastr.success('Inventario eliminado correctamente');
          if (this.selectedRestaurantId) {
            this.loadInventarios(this.selectedRestaurantId);
          }
        },
        error: (err) => {
          console.error('Error al eliminar inventario', err);
          this.toastr.error('No se pudo eliminar el inventario');
          this.isLoading = false;
        }
      });
    }
  }
}
