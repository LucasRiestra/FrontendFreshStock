import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { StockIdealService } from '../services/stock-ideal.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-ideal-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './stock-ideal-form.html',
  styles: [`
    .stock-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
    .row { display: flex; gap: 1rem; }
    .full-width { width: 100%; }
    .product-info h3 { margin: 0; color: #333; }
    .alert { padding: 0.75rem; border-radius: 4px; font-size: 0.85rem; margin-top: 1rem; }
    .alert-warning { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
  `]
})
export class StockIdealForm implements OnInit {
  private fb = inject(FormBuilder);
  private stockIdealService = inject(StockIdealService);
  private toastr = inject(ToastrService);
  private dialogRef = inject(MatDialogRef<StockIdealForm>);

  stockForm: FormGroup;
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.stockForm = this.fb.group({
      stockMinimo: [data.stockMinimo || 0, [Validators.required, Validators.min(0)]],
      stockIdeal: [data.stockIdeal || 0, [Validators.required, Validators.min(0)]],
      stockMaximo: [data.stockMaximo || 0, [Validators.required, Validators.min(0)]]
    }, { validators: this.levelValidator });
  }

  ngOnInit(): void { }

  levelValidator(control: AbstractControl): ValidationErrors | null {
    const min = control.get('stockMinimo')?.value;
    const ideal = control.get('stockIdeal')?.value;
    const max = control.get('stockMaximo')?.value;

    if (min > ideal || ideal > max) {
      return { invalidLevels: true };
    }
    return null;
  }

  onSave(): void {
    if (this.stockForm.invalid) return;

    this.isLoading = true;
    const formValue = this.stockForm.value;

    if (this.data.id) {
      // Editar existente
      this.stockIdealService.update(this.data.id, formValue).subscribe({
        next: (response) => {
          this.toastr.success('Stock ideal actualizado', 'Éxito');
          this.dialogRef.close(response);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al actualizar', 'Error');
          this.isLoading = false;
        }
      });
    } else {
      // Crear nuevo
      const dto = {
        ...formValue,
        productoId: this.data.productoId,
        restauranteId: this.data.restauranteId
      };
      this.stockIdealService.create(dto).subscribe({
        next: (response) => {
          this.toastr.success('Stock ideal asignado', 'Éxito');
          this.dialogRef.close(response); // Return the full object including new ID
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al asignar', 'Error');
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
