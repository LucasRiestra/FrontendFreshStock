import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ProductoService } from '../producto.service';
import { Producto } from '../../../models/producto.model';
import { CurrencyFormatPipe } from '../../../shared/pipes';
import { ProductoForm } from '../producto-form/producto-form';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    CurrencyFormatPipe
  ],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList {
  private productoService = inject(ProductoService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);

  @Input() productos: Producto[] = [];
  @Input() selectedProveedorId: number | null = null;
  @Output() productoUpdated = new EventEmitter<void>();

  openForm(producto?: Producto): void {
    const dialogRef = this.dialog.open(ProductoForm, {
      width: '500px',
      data: producto || { proveedorId: this.selectedProveedorId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productoUpdated.emit();
      }
    });
  }

  onDelete(producto: Producto): void {
    if (confirm(`¿Está seguro de eliminar el producto ${producto.nombre}?`)) {
      this.productoService.delete(producto.id).subscribe({
        next: () => {
          this.toastr.success('Producto eliminado');
          this.productoUpdated.emit();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al eliminar el producto');
        }
      });
    }
  }
}
