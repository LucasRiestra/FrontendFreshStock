import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialogContent, MatDialogActions, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface FinalizarInventarioData {
    notas?: string;
}

@Component({
    selector: 'app-inventario-finalizar-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatDialogContent,
        MatDialogActions,
        MatDialogTitle
    ],
    template: `
      <h2 mat-dialog-title>Finalizar Inventario</h2>
      <mat-dialog-content class="dialog-content">
        <p class="mb-4">¿Está seguro que desea finalizar el inventario? Esta acción no se puede deshacer.</p>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Notas / Comentarios</mat-label>
          <textarea matInput [(ngModel)]="notas" rows="3" placeholder="Ej: Inventario inicial de apertura"></textarea>
        </mat-form-field>

        <div class="update-stock-container">
          <mat-checkbox [(ngModel)]="actualizarStock" color="primary" class="font-medium">
            Actualizar Stock del Sistema con estos conteos
          </mat-checkbox>
          <p class="help-text">
            Útil para inventarios iniciales o reseteos totales. Sobrescribirá el stock actual con lo contado.
          </p>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" (click)="onConfirm()">Finalizar</button>
      </mat-dialog-actions>
    `,
    styles: [`
      .dialog-content { min-width: 400px; max-width: 600px; }
      .w-full { width: 100%; }
      .mb-4 { margin-bottom: 1rem; }
      .update-stock-container { margin-top: 1rem; padding: 1rem; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
      .font-medium { font-weight: 500; }
      .help-text { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; margin-left: 2rem; }
    `]
})
export class InventarioFinalizarDialog {
    actualizarStock = false;
    notas = '';

    constructor(
        public dialogRef: MatDialogRef<InventarioFinalizarDialog>,
        @Inject(MAT_DIALOG_DATA) public data: FinalizarInventarioData
    ) {
        if (data && data.notas) {
            this.notas = data.notas;
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onConfirm(): void {
        this.dialogRef.close({
            notas: this.notas,
            actualizarStock: this.actualizarStock
        });
    }
}
