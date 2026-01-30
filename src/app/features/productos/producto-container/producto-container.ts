import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductoService } from '../producto.service';
import { ProveedorService } from '../../proveedores/proveedor.service';
import { Producto } from '../../../models/producto.model';
import { Proveedor } from '../../../models/proveedor.model';
import { ProductoList } from '../producto-list/producto-list';

@Component({
  selector: 'app-producto-container',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    ProductoList
  ],
  templateUrl: './producto-container.html',
  styleUrl: './producto-container.css'
})
export class ProductoContainer implements OnInit {
  private productoService = inject(ProductoService);
  private proveedorService = inject(ProveedorService);
  private cdr = inject(ChangeDetectorRef);

  allProductos: Producto[] = [];
  filteredProductos: Producto[] = [];
  proveedores: Proveedor[] = [];

  selectedProveedorId: number | null = null;
  isLoadingProveedores = true;
  isLoadingProductos = false;

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores(): void {
    this.isLoadingProveedores = true;
    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.isLoadingProveedores = false;

        // Seleccionar automáticamente el primer proveedor
        if (this.proveedores.length > 0) {
          this.selectedProveedorId = this.proveedores[0].id!;
          this.cdr.detectChanges();
          this.loadProductos();
        } else {
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading providers', err);
        this.isLoadingProveedores = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadProductos(): void {
    this.isLoadingProductos = true;
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.allProductos = data;
        this.filterProductos();
        this.isLoadingProductos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.isLoadingProductos = false;
        this.cdr.detectChanges();
      }
    });
  }

  onProveedorChange(): void {
    this.filterProductos();
  }

  private filterProductos(): void {
    if (this.selectedProveedorId) {
      this.filteredProductos = this.allProductos.filter(
        p => p.proveedorId === this.selectedProveedorId
      );
    } else {
      this.filteredProductos = [];
    }
  }

  onProductoUpdated(): void {
    this.loadProductos();
  }
}
