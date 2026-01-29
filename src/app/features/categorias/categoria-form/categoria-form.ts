import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
 import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CategoriaService } from '../categoria.service';
import { RestauranteService } from '../../restaurantes/restaurante.service';
import { AuthService } from '../../../core/services/auth.service';
import { Restaurante } from '../../../models/restaurante.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-categoria-form',
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
  templateUrl: './categoria-form.html',
  styles: [`
    .form-container { display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem; }
    .full-width { width: 100%; }
  `]
})
export class CategoriaForm implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private restauranteService = inject(RestauranteService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private dialogRef = inject(MatDialogRef<CategoriaForm>);

  categoriaForm: FormGroup;
  isLoading = false;
  isGlobalAdmin = false;
  restaurantes: Restaurante[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    const activeRestId = this.authService.getSelectedRestaurantId();

    this.categoriaForm = this.fb.group({
      nombre: [data.nombre || '', Validators.required],
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
    if (this.categoriaForm.invalid) return;

    this.isLoading = true;
    const { restauranteId, ...catData } = this.categoriaForm.value;

    if (this.data.id) {
      // Update
      this.categoriaService.update(this.data.id, { ...catData, id: this.data.id }).subscribe({
        next: () => {
          if (restauranteId) {
            this.categoriaService.asignarARestaurante(this.data.id, restauranteId).subscribe({
              next: () => {
                this.toastr.success('Categoría actualizada y asignada correctamente');
                this.dialogRef.close(true);
              },
              error: (err) => {
                console.error(err);
                this.toastr.warning('Categoría actualizada, pero hubo un error en la asignación');
                this.dialogRef.close(true);
              }
            });
          } else {
            this.toastr.success('Categoría actualizada correctamente');
            this.dialogRef.close(true);
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al actualizar la categoría');
          this.isLoading = false;
        }
      });
    } else {
      // Create
      if (restauranteId) {
        this.categoriaService.createAndAssign(catData, restauranteId).subscribe({
          next: () => {
            this.toastr.success('Categoría creada y asignada correctamente');
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error al crear la categoría');
            this.isLoading = false;
          }
        });
      } else {
        this.categoriaService.create(catData).subscribe({
          next: () => {
            this.toastr.success('Categoría creada correctamente');
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error al crear la categoría');
            this.isLoading = false;
          }
        });
      }
    }
  }
}
