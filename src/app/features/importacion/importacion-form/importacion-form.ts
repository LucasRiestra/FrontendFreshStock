import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImportacionService } from '../services/importacion.service';
import { ImportacionPreviewResult } from '../../../models/importacion.model';
import { CategoriaService } from '../../categorias/categoria.service';
import { ProveedorService } from '../../proveedores/proveedor.service';
import { RestauranteService } from '../../restaurantes/restaurante.service';
import { AuthService } from '../../../core/services/auth.service';
import { Categoria } from '../../../models/categoria.model';
import { Proveedor } from '../../../models/proveedor.model';
import { Restaurante } from '../../../models/restaurante.model';
import { ToastrService } from 'ngx-toastr';
import { ImportacionPreviewDialog } from '../importacion-preview-dialog/importacion-preview-dialog';

@Component({
  selector: 'app-importacion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    ImportacionPreviewDialog
  ],
  templateUrl: './importacion-form.html',
  styleUrls: ['./importacion-form.css']
})
export class ImportacionForm implements OnInit {
  private fb = inject(FormBuilder);
  private importService = inject(ImportacionService);
  private categoriaService = inject(CategoriaService);
  private proveedorService = inject(ProveedorService);
  private restauranteService = inject(RestauranteService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  importForm: FormGroup;
  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];
  restaurantes: Restaurante[] = [];
  selectedFile: File | null = null;
  isLoading = false;
  isGlobalAdmin = false;

  constructor() {
    this.importForm = this.fb.group({
      restauranteId: [null, Validators.required],
      categoriaId: [null, Validators.required],
      proveedorId: [null, Validators.required],
      actualizarExistentes: [false]
    });
  }

  ngOnInit(): void {
    this.isGlobalAdmin = this.authService.isGlobalAdmin();
    this.loadRestaurantes();

    this.authService.selectedRestaurant$.subscribe(id => {
      if (id) {
        // Solo parcheamos si el valor es distinto para evitar ciclos o reseteos innecesarios
        if (this.importForm.get('restauranteId')?.value !== id) {
          this.importForm.patchValue({ restauranteId: id }, { emitEvent: false });
          this.onRestaurantChange(id);
        }
      }
    });
  }

  loadRestaurantes(): void {
    const obs$ = this.isGlobalAdmin 
      ? this.restauranteService.getAll() 
      : this.restauranteService.getMisRestaurantes();

    obs$.subscribe(data => {
      this.restaurantes = data;
      if (!this.isGlobalAdmin) {
        this.importForm.get('restauranteId')?.disable();
      }
    });
  }

  onRestaurantChange(restaurantId: number): void {
    this.importForm.patchValue({ categoriaId: null, proveedorId: null });
    this.loadDependentData(restaurantId);
  }

  loadDependentData(restaurantId: number): void {
    this.categoriaService.getByRestaurante(restaurantId).subscribe(data => this.categorias = data);
    this.proveedorService.getByRestaurante(restaurantId).subscribe(data => this.proveedores = data);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.selectedFile = file;
      } else {
        this.toastr.error('Solo se permiten archivos Excel (.xlsx, .xls)', 'Error de formato');
        event.target.value = null;
      }
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
  }

  downloadTemplate(): void {
    this.importService.descargarPlantilla().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Plantilla_Importacion.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toastr.error('Error al descargar la plantilla', 'Error')
    });
  }

  onPreview(): void {
    const { restauranteId, categoriaId, proveedorId } = this.importForm.value;
    if (this.importForm.invalid || !this.selectedFile || !restauranteId) return;

    this.isLoading = true;

    this.importService.preview(
      this.selectedFile,
      proveedorId,
      categoriaId,
      restauranteId
    ).subscribe({
      next: (result: ImportacionPreviewResult) => {
        this.isLoading = false;
        this.openPreviewDialog(result);
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Error al procesar el archivo', 'Error');
        this.isLoading = false;
      }
    });
  }

  openPreviewDialog(previewData: ImportacionPreviewResult): void {
    const { restauranteId, categoriaId, proveedorId, actualizarExistentes } = this.importForm.getRawValue();

    const dialogRef = this.dialog.open(ImportacionPreviewDialog, {
      width: '900px',
      maxHeight: '90vh',
      data: {
        preview: previewData,
        file: this.selectedFile,
        categoriaId: categoriaId,
        proveedorId: proveedorId,
        restauranteId: restauranteId,
        actualizarExistentes: actualizarExistentes
      }
    });

    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.selectedFile = null;
        this.importForm.reset({ actualizarExistentes: false });
      }
    });
  }
}
