import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductoService } from '../../productos/producto.service';
import { CategoriaService } from '../../categorias/categoria.service';
import { ProveedorService } from '../../proveedores/proveedor.service';
import { Producto } from '../../../models/producto.model';
import { Categoria } from '../../../models/categoria.model';
import { Proveedor } from '../../../models/proveedor.model';
import { StockIdealRestauranteResponse } from '../../../models/stock-ideal.model';
import { StockIdealForm } from '../stock-ideal-form/stock-ideal-form';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

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
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './stock-selection-dialog.html',
  styles: [`
    .full-width { width: 100%; }
    .filters-container { display: flex; gap: 1rem; margin-top: 1rem; }
    .filter-item { flex: 1; }
    .search-field { margin-top: 0; }
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
  private categoriaService = inject(CategoriaService);
  private proveedorService = inject(ProveedorService);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<StockSelectionDialog>);

  allProducts: Producto[] = [];
  filteredProducts: Producto[] = [];
  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];

  isLoading = true;
  searchTerm = '';
  selectedCategoryId: number | null = null;
  selectedProviderId: number | null = null;

  // Mapa local para guardar lo que se va configurando en esta sesión
  configuredProductsMap = new Map<number, any>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: { selectedRestaurantId: number, existingProductIds: number[] }) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const { selectedRestaurantId } = this.data;

    // Cargar productos, categorías y proveedores en paralelo
    // Nota: Asumimos que queremos ver todos los disponibles o filtrados por restaurante si aplica
    // Para simplificar cargamos todo de la base de datos y filtramos en memoria o usamos endpoints específicos

    this.isLoading = true;

    // Productos (Todos)
    this.productoService.getAll().subscribe({
      next: (products) => {
        this.allProducts = products.filter(p => !this.data.existingProductIds.includes(p.id!));
        this.filteredProducts = [...this.allProducts];
        this.isLoading = false;
      },
      error: (err) => { console.error(err); this.isLoading = false; }
    });

    // Categorías
    this.categoriaService.getByRestaurante(selectedRestaurantId).subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error(err)
    });

    // Proveedores
    this.proveedorService.getByRestaurante(selectedRestaurantId).subscribe({
      next: (data) => this.proveedores = data,
      error: (err) => console.error(err)
    });
  }



  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredProducts = this.allProducts.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(term);
      const matchesCategory = this.selectedCategoryId ? p.categoriaId === this.selectedCategoryId : true;
      const matchesProvider = this.selectedProviderId ? p.proveedorId === this.selectedProviderId : true;

      return matchesSearch && matchesCategory && matchesProvider;
    });
  }

  hasChanges = false;

  selectProduct(product: Producto): void {
    // Si ya lo configuró en esta sesión, usamos esos datos (incluye el ID generado)
    const localConfig = this.configuredProductsMap.get(product.id!);

    // Si no está en el mapa local, pasamos los datos básicos para crear uno nuevo
    const dialogData = localConfig ? { ...localConfig, nombreProducto: product.nombre, unidadMedida: product.unidadMedida }
      : {
        productoId: product.id,
        nombreProducto: product.nombre,
        unidadMedida: product.unidadMedida,
        restauranteId: this.data.selectedRestaurantId
      };

    const dialogRef = this.dialog.open(StockIdealForm, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Guardamos el objeto retornado (que tiene los valores actuales y el ID si es nuevo)
        // El 'result' ahora es el objeto completo gracias al cambio anterior en StockIdealForm
        this.configuredProductsMap.set(product.id!, result);
        this.hasChanges = true;
        this.applyFilter(); // Refrescar vista si fuera necesario
      }
    });
  }

  isConfigured(productId: number): boolean {
    return this.configuredProductsMap.has(productId);
  }

  close(): void {
    this.dialogRef.close(this.hasChanges);
  }
}
