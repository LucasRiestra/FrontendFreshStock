import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductoService } from '../../productos/producto.service';
import { Producto } from '../../../models/producto.model';
import { StockIdealForm } from '../stock-ideal-form/stock-ideal-form';

@Component({
  selector: 'app-stock-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './stock-selection-dialog.html',
  styles: [`
    .full-width { width: 100%; }
    .search-field { margin-top: 1rem; }
    .product-list { max-height: 300px; overflow-y: auto; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .product-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #eee; border-radius: 4px; }
    .product-item:hover { background-color: #f9f9f9; }
    .info { display: flex; flex-direction: column; }
    .name { font-weight: 500; }
    .unit { font-size: 0.8rem; color: #666; }
    .instruction { margin: 0; font-size: 0.9rem; color: #555; }
    .no-results { padding: 2rem; text-align: center; color: #888; }
  `]
})
export class StockSelectionDialog implements OnInit {
  private productoService = inject(ProductoService);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<StockSelectionDialog>);

  allProducts: Producto[] = [];
  filteredProducts: Producto[] = [];
  isLoading = true;
  searchTerm = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { selectedRestaurantId: number, existingProductIds: number[] }) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productoService.getAll().subscribe({
      next: (products) => {
        // Filtrar productos que ya tienen stock ideal definido
        this.allProducts = products.filter(p => !this.data.existingProductIds.includes(p.id!));
        this.filteredProducts = [...this.allProducts];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.allProducts.filter(p => 
      p.nombre.toLowerCase().includes(filterValue)
    );
  }

  selectProduct(product: Producto): void {
    const dialogRef = this.dialog.open(StockIdealForm, {
      width: '400px',
      data: {
        productoId: product.id,
        nombreProducto: product.nombre,
        unidadMedida: product.unidadMedida,
        restauranteId: this.data.selectedRestaurantId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Quitar de la lista local para que no aparezca más
        this.allProducts = this.allProducts.filter(p => p.id !== product.id);
        this.filteredProducts = this.filteredProducts.filter(p => p.id !== product.id);
        // Marcamos que hubo cambios para que la lista principal se actualice al cerrar
        this.dialogRef.close(true);
      }
    });
  }
}
