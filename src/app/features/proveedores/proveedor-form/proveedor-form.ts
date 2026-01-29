import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ProveedorService } from '../proveedor.service';
import { RestauranteService } from '../../restaurantes/restaurante.service';
import { AuthService } from '../../../core/services/auth.service';
import { Restaurante } from '../../../models/restaurante.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './proveedor-form.html',
  styles: [`
    .form-container { display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem; }
    .full-width { width: 100%; }
  `]
})
export class ProveedorForm implements OnInit {
  private fb = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);
  private restauranteService = inject(RestauranteService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private dialogRef = inject(MatDialogRef<ProveedorForm>);

  proveedorForm: FormGroup;
  isLoading = false;
  isGlobalAdmin = false;
  restaurantes: Restaurante[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    const activeRestId = this.authService.getSelectedRestaurantId();
    
    this.proveedorForm = this.fb.group({
      nombre: [data.nombre || '', Validators.required],
      email: [data.email || '', [Validators.email]],
      telefono: [data.telefono || ''],
      contacto: [data.contacto || ''],
      restauranteId: [activeRestId || null]
    });
  }

  ngOnInit(): void {
    this.isGlobalAdmin = this.authService.isGlobalAdmin();
    if (this.isGlobalAdmin) {
      this.restauranteService.getAll().subscribe(data => this.restaurantes = data);
    }
  }

  onSave(): void {
    if (this.proveedorForm.invalid) return;

    this.isLoading = true;
    const { restauranteId, ...providerData } = this.proveedorForm.value;

    if (this.data.id) {
      // Update
      this.proveedorService.update(this.data.id, { ...providerData, id: this.data.id }).subscribe({
        next: () => {
          this.toastr.success('Proveedor actualizado correctamente');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al actualizar el proveedor');
          this.isLoading = false;
        }
      });
    } else {
      // Create
      if (restauranteId) {
        this.proveedorService.createAndAssign(providerData, restauranteId).subscribe({
          next: () => {
            this.toastr.success('Proveedor creado y asignado correctamente');
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error al crear el proveedor');
            this.isLoading = false;
          }
        });
      } else {
        this.proveedorService.create(providerData).subscribe({
          next: () => {
            this.toastr.success('Proveedor creado correctamente');
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error al crear el proveedor');
            this.isLoading = false;
          }
        });
      }
    }
  }
}
