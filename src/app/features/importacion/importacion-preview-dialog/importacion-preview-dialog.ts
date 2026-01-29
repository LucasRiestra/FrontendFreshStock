import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { ImportacionService } from '../services/importacion.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-importacion-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './importacion-preview-dialog.html',
  styleUrls: ['./importacion-preview-dialog.css']
})
export class ImportacionPreviewDialog {
  private importService = inject(ImportacionService);
  private toastr = inject(ToastrService);
  private dialogRef = inject(MatDialogRef<ImportacionPreviewDialog>);

  isLoading = false;
  displayedColumns: string[] = ['fila', 'nombre', 'unidad', 'costo', 'estado'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  onConfirm(): void {
    this.isLoading = true;
    
    this.importService.ejecutar(
      this.data.file,
      this.data.proveedorId,
      this.data.categoriaId,
      this.data.restauranteId,
      this.data.actualizarExistentes
    ).subscribe({
      next: (result: any) => {
        if (result.exitoso) {
          this.toastr.success(`Importación completada: ${result.productosCreados} creados, ${result.productosActualizados} actualizados`, 'Éxito');
          this.dialogRef.close(true);
        } else {
          this.toastr.error('Hubo errores durante la importación real', 'Error');
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Error al ejecutar la importación', 'Error');
        this.isLoading = false;
      }
    });
  }
}
