import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProveedorService } from '../proveedor.service';
import { AuthService } from '../../../core/services/auth.service';
import { Proveedor } from '../../../models/proveedor.model';
import { ProveedorForm } from '../proveedor-form/proveedor-form';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './proveedor-list.html',
  styleUrl: './proveedor-list.css',
})
export class ProveedorList implements OnInit {
  private proveedorService = inject(ProveedorService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  
  proveedores: Proveedor[] = [];
  isLoading = true;
  selectedRestaurantId: number | null = null;
  isGlobalAdmin = false;

  ngOnInit(): void {
    this.isGlobalAdmin = this.authService.isGlobalAdmin();

    this.authService.selectedRestaurant$.subscribe(id => {
      this.selectedRestaurantId = id;
      this.loadProveedores();
    });
  }

  loadProveedores(): void {
    this.isLoading = true;

    // SuperAdmin siempre ve todos los proveedores
    // Gerente solo ve los de su restaurante
    const obs$ = this.isGlobalAdmin
      ? this.proveedorService.getAll()
      : this.selectedRestaurantId
        ? this.proveedorService.getByRestaurante(this.selectedRestaurantId)
        : this.proveedorService.getAll();

    obs$.subscribe({
      next: (data) => {
        this.proveedores = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading providers', err);
        this.isLoading = false;
      }
    });
  }

  openForm(proveedor?: Proveedor): void {
    const dialogRef = this.dialog.open(ProveedorForm, {
      width: '500px',
      data: proveedor || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProveedores();
      }
    });
  }

  onDelete(proveedor: Proveedor): void {
    if (confirm(`¿Está seguro de eliminar al proveedor ${proveedor.nombre}?`)) {
      this.proveedorService.delete(proveedor.id!).subscribe({
        next: () => {
          this.toastr.success('Proveedor eliminado');
          this.loadProveedores();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al eliminar el proveedor');
        }
      });
    }
  }
}
