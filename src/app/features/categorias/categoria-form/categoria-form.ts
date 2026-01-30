import { Component, Inject, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriaService } from '../categoria.service';
import { RestauranteCategoriaService } from '../restaurante-categoria.service';
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
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './categoria-form.html',
  styles: [`
    .form-container { display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem; }
    .full-width { width: 100%; }
    .loading-container { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; }
  `]
})
export class CategoriaForm implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private restauranteCategoriaService = inject(RestauranteCategoriaService);
  private restauranteService = inject(RestauranteService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private dialogRef = inject(MatDialogRef<CategoriaForm>);
  private cdr = inject(ChangeDetectorRef);

  categoriaForm: FormGroup;
  isLoading = false;
  isLoadingData = false;
  isGlobalAdmin = false;
  restaurantes: Restaurante[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.categoriaForm = this.fb.group({
      nombre: [data.nombre || '', Validators.required],
      restauranteIds: [[]]  // Array para multiselect
    });
  }

  ngOnInit(): void {
    this.isGlobalAdmin = this.authService.isGlobalAdmin();
    if (this.isGlobalAdmin) {
      this.isLoadingData = true;
      this.restauranteService.getAll().subscribe({
        next: (data) => {
          this.restaurantes = data;
          // Si estamos editando, cargar las asociaciones existentes
          if (this.data.id) {
            this.loadExistingAssociations();
          } else {
            this.isLoadingData = false;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error(err);
          this.isLoadingData = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private loadExistingAssociations(): void {
    this.restauranteCategoriaService.getByCategoria(this.data.id).subscribe({
      next: (associations) => {
        // Preseleccionar los restaurantes ya asociados
        const selectedIds = associations.map(a => a.restauranteId);
        this.categoriaForm.patchValue({ restauranteIds: selectedIds });
        this.isLoadingData = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoadingData = false;
        this.cdr.detectChanges();
      }
    });
  }

  onRestaurantesChange(event: any): void {
    const selectedValues: number[] = event.value;

    // Si seleccionó "Global (Ninguno)" = 0
    if (selectedValues.includes(0)) {
      // Si había otros valores y ahora selecciona 0, dejar solo 0
      if (selectedValues.length > 1 && selectedValues[selectedValues.length - 1] === 0) {
        this.categoriaForm.patchValue({ restauranteIds: [0] });
      }
      // Si tenía 0 y selecciona otro, quitar el 0
      else if (selectedValues.length > 1 && selectedValues[0] === 0) {
        this.categoriaForm.patchValue({ restauranteIds: selectedValues.filter(v => v !== 0) });
      }
    }
  }

  onSave(): void {
    if (this.categoriaForm.invalid) return;

    this.isLoading = true;
    const { restauranteIds, nombre } = this.categoriaForm.value;
    // Filtrar el 0 (Global) - si solo tiene 0 o está vacío, enviar array vacío
    const selectedIds: number[] = (restauranteIds || []).filter((id: number) => id !== 0);

    if (this.data.id) {
      // EDITAR - incluir el id en el body
      const updateData = {
        id: this.data.id,
        nombre,
        restauranteIds: selectedIds
      };
      this.categoriaService.update(this.data.id, updateData).subscribe({
        next: () => {
          this.toastr.success('Categoría actualizada correctamente');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al actualizar la categoría');
          this.isLoading = false;
        }
      });
    } else {
      // CREAR
      const createData = {
        nombre,
        restauranteIds: selectedIds
      };
      this.categoriaService.create(createData).subscribe({
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
