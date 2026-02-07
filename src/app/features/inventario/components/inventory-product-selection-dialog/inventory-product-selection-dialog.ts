import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../productos/producto.service';
import { CategoriaService } from '../../../categorias/categoria.service';
import { ProveedorService } from '../../../proveedores/proveedor.service';
import { Producto } from '../../../../models/producto.model';
import { Categoria } from '../../../../models/categoria.model';
import { Proveedor } from '../../../../models/proveedor.model';

@Component({
    selector: 'app-inventory-product-selection-dialog',
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
    template: `
    <h2 mat-dialog-title>Agregar Productos al Inventario</h2>
    <mat-dialog-content>
      <p class="instruction">Seleccione los productos que desea añadir al conteo actual.</p>
      
      <div class="filters-container">
        <mat-form-field appearance="outline" class="filter-item">
          <mat-label>Categoría</mat-label>
          <mat-select [(ngModel)]="selectedCategoryId" (selectionChange)="applyFilter()">
            <mat-option [value]="null">Todas</mat-option>
            <mat-option *ngFor="let cat of categorias" [value]="cat.id">{{ cat.nombre }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-item">
          <mat-label>Proveedor</mat-label>
          <mat-select [(ngModel)]="selectedProviderId" (selectionChange)="applyFilter()">
            <mat-option [value]="null">Todos</mat-option>
            <mat-option *ngFor="let prov of proveedores" [value]="prov.id">{{ prov.nombre }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full-width search-field">
        <mat-label>Buscar por nombre</mat-label>
        <input matInput [(ngModel)]="searchTerm" (keyup)="applyFilter()" placeholder="Ej: Harina">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="loader-container" *ngIf="isLoading">
        <mat-spinner diameter="30"></mat-spinner>
      </div>

      <div class="product-list" *ngIf="!isLoading">
        <div class="product-item" *ngFor="let product of filteredProducts">
          <div class="info">
            <span class="name">{{ product.nombre }}</span>
            <span class="unit">{{ product.unidadMedida }}</span>
          </div>
          <button mat-flat-button color="primary" 
                  [disabled]="isProductSelected(product.id!)"
                  (click)="toggleProduct(product)">
            <mat-icon>{{ isProductSelected(product.id!) ? 'check' : 'add' }}</mat-icon>
            {{ isProductSelected(product.id!) ? 'Añadido' : 'Añadir' }}
          </button>
        </div>
        
        <div class="no-results" *ngIf="filteredProducts.length === 0">
          No se encontraron productos disponibles.
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cerrar</button>
      <button mat-raised-button color="primary" (click)="confirmSelection()" [disabled]="selectedProducts.size === 0">
        Confirmar ({{ selectedProducts.size }})
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    .full-width { width: 100%; }
    .filters-container { display: flex; gap: 1rem; margin-top: 1rem; }
    .filter-item { flex: 1; }
    .search-field { margin-top: 0.5rem; }
    .product-list { max-height: 350px; overflow-y: auto; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .product-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #eee; border-radius: 4px; }
    .product-item:hover { background-color: #f9f9f9; }
    .info { display: flex; flex-direction: column; }
    .name { font-weight: 500; }
    .unit { font-size: 0.8rem; color: #666; }
    .instruction { margin: 0; font-size: 0.9rem; color: #555; }
    .no-results { padding: 2rem; text-align: center; color: #888; }
    .loader-container { padding: 2rem; display: flex; justify-content: center; }
  `]
})
export class InventoryProductSelectionDialog implements OnInit {
    private productoService = inject(ProductoService);
    private categoriaService = inject(CategoriaService);
    private proveedorService = inject(ProveedorService);
    private dialogRef = inject(MatDialogRef<InventoryProductSelectionDialog>);

    allProducts: Producto[] = [];
    filteredProducts: Producto[] = [];
    categorias: Categoria[] = [];
    proveedores: Proveedor[] = [];

    isLoading = true;
    searchTerm = '';
    selectedCategoryId: number | null = null;
    selectedProviderId: number | null = null;

    selectedProducts = new Map<number, Producto>();

    constructor(@Inject(MAT_DIALOG_DATA) public data: { selectedRestaurantId: number, existingProductIds: number[] }) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        const { selectedRestaurantId } = this.data;
        this.isLoading = true;

        this.productoService.getByRestaurante(selectedRestaurantId).subscribe({
            next: (products) => {
                // Filtrar productos que ya están en el inventario
                this.allProducts = products.filter(p => !this.data.existingProductIds.includes(p.id!));
                this.filteredProducts = [...this.allProducts];
                this.isLoading = false;
            },
            error: (err) => { console.error(err); this.isLoading = false; }
        });

        this.categoriaService.getByRestaurante(selectedRestaurantId).subscribe({
            next: (data) => this.categorias = data,
            error: (err) => console.error(err)
        });

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

    isProductSelected(productId: number): boolean {
        return this.selectedProducts.has(productId);
    }

    toggleProduct(product: Producto): void {
        if (this.selectedProducts.has(product.id!)) {
            this.selectedProducts.delete(product.id!);
        } else {
            this.selectedProducts.set(product.id!, product);
        }
    }

    confirmSelection(): void {
        this.dialogRef.close(Array.from(this.selectedProducts.values()));
    }

    close(): void {
        this.dialogRef.close();
    }
}
