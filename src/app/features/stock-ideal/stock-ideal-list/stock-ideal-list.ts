import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StockIdealService } from '../services/stock-ideal.service';
import { AuthService } from '../../../core/services/auth.service';
import { StockIdealRestauranteResponse } from '../../../models/stock-ideal.model';
import { RestauranteService } from '../../restaurantes/restaurante.service';
import { Restaurante } from '../../../models/restaurante.model';
import { ProveedorService } from '../../proveedores/proveedor.service';
import { CategoriaService } from '../../categorias/categoria.service';
import { ProductoService } from '../../productos/producto.service';
import { Proveedor } from '../../../models/proveedor.model';
import { Categoria } from '../../../models/categoria.model';
import { Producto } from '../../../models/producto.model';
import { ToastrService } from 'ngx-toastr';

import { StockIdealForm } from '../stock-ideal-form/stock-ideal-form';
import { StockSelectionDialog } from '../stock-selection-dialog/stock-selection-dialog';

@Component({
  selector: 'app-stock-ideal-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './stock-ideal-list.html',
  styleUrls: ['./stock-ideal-list.css']
})
export class StockIdealList implements OnInit {
  private stockIdealService = inject(StockIdealService);
  private authService = inject(AuthService);
  private restauranteService = inject(RestauranteService);
  private proveedorService = inject(ProveedorService);
  private categoriaService = inject(CategoriaService);
  private productoService = inject(ProductoService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  allStockIdeales: StockIdealRestauranteResponse[] = [];
  filteredStockIdeales: StockIdealRestauranteResponse[] = [];
  allProducts: Producto[] = [];
  proveedores: Proveedor[] = [];
  categorias: Categoria[] = [];

  isLoading = true;
  displayedColumns: string[] = ['producto', 'stockMinimo', 'stockIdeal', 'stockMaximo', 'acciones'];
  selectedRestaurantId: number | null = null;

  selectedCategoryId: number | null = null;
  selectedProviderId: number | null = null;

  isGlobalAdmin = false;
  restaurantes: Restaurante[] = [];

  ngOnInit(): void {
    this.isGlobalAdmin = this.authService.isGlobalAdmin();

    if (this.isGlobalAdmin) {
      this.loadRestaurantes();
    }

    this.authService.selectedRestaurant$.subscribe(id => {
      this.selectedRestaurantId = id;
      if (id) {
        this.loadMetadata(id);
        this.loadStockIdeales();
      } else {
        this.allStockIdeales = [];
        this.filteredStockIdeales = [];
        this.isLoading = false;
      }
    });
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

  loadMetadata(restauranteId: number): void {
    this.proveedorService.getByRestaurante(restauranteId).subscribe({
      next: (data) => this.proveedores = data,
      error: (err) => console.error(err)
    });
    this.categoriaService.getByRestaurante(restauranteId).subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error(err)
    });
    this.productoService.getByRestaurante(restauranteId).subscribe({
      next: (data) => this.allProducts = data,
      error: (err) => console.error(err)
    });
  }

  loadStockIdeales(): void {
    if (!this.selectedRestaurantId) {
      this.allStockIdeales = [];
      this.filteredStockIdeales = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.stockIdealService.getByRestaurante(this.selectedRestaurantId).subscribe({
      next: (data) => {
        this.allStockIdeales = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading ideal stock', err);
        this.toastr.error('Error al cargar los niveles de stock', 'Error');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredStockIdeales = this.allStockIdeales.filter(item => {
      const product = this.allProducts.find(p => p.id === item.productoId);

      const matchesCategory = this.selectedCategoryId
        ? product?.categoriaId === this.selectedCategoryId
        : true;

      const matchesProvider = this.selectedProviderId
        ? product?.proveedorId === this.selectedProviderId
        : true;

      return matchesCategory && matchesProvider;
    });
  }

  openEditDialog(element: StockIdealRestauranteResponse): void {
    const dialogRef = this.dialog.open(StockIdealForm, {
      width: '400px',
      data: { ...element }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStockIdeales();
      }
    });
  }

  openBulkAssignment(): void {
    if (!this.selectedRestaurantId) {
      this.toastr.warning('Por favor seleccione un restaurante primero', 'Aviso');
      return;
    }

    const currentProductIds = this.allStockIdeales.map(s => s.productoId);

    const dialogRef = this.dialog.open(StockSelectionDialog, {
      width: '500px',
      data: {
        selectedRestaurantId: this.selectedRestaurantId,
        existingProductIds: currentProductIds
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStockIdeales();
      }
    });
  }
}
