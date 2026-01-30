import { Component, inject, OnInit, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { ProductoService } from "../producto.service";
import { ProveedorService } from "../../proveedores/proveedor.service";
import { CategoriaService } from "../../categorias/categoria.service";
import { AuthService } from "../../../core/services/auth.service";
import { Proveedor } from "../../../models/proveedor.model";
import { Categoria } from "../../../models/categoria.model";

@Component({
    selector: 'app-producto-form',
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
    templateUrl: './producto-form.html',
    styles: [`
    .form-container { display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem; }
    .full-width { width: 100%; }
  `]
})
export class ProductoForm implements OnInit {
    private fb = inject(FormBuilder);
    private productoService = inject(ProductoService);
    private proveedorService = inject(ProveedorService);
    private categoriaService = inject(CategoriaService);
    private authService = inject(AuthService);
    private toastr = inject(ToastrService);
    private dialogRef = inject(MatDialogRef<ProductoForm>);

    productoForm: FormGroup;
    isLoading = false;
    isGlobalAdmin = false;
    proveedores: Proveedor[] = [];
    categorias: Categoria[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.productoForm = this.fb.group({
            nombre: [data?.nombre || '', Validators.required],
            unidadMedida: [data?.unidadMedida || '', Validators.required],
            stockMinimo: [data?.stockMinimo || 0, [Validators.required, Validators.min(0)]],
            costoUnitario: [data?.costoUnitario || 0, [Validators.required, Validators.min(0)]],
            proveedorId: [data?.proveedorId || null, Validators.required],
            categoriaId: [data?.categoriaId || null, Validators.required]
        });
    }

    ngOnInit(): void {
        this.isGlobalAdmin = this.authService.isGlobalAdmin();
        this.loadInitialData();
    }

    loadInitialData(): void {
        const restauranteId = this.authService.getSelectedRestaurantId();
        
        if (restauranteId) {
            // Cargar datos del restaurante seleccionado
            this.proveedorService.getByRestaurante(restauranteId).subscribe({
                next: (data) => this.proveedores = data,
                error: (err) => {
                    console.error(err);
                    this.toastr.error('Error al cargar proveedores');
                }
            });

            this.categoriaService.getByRestaurante(restauranteId).subscribe({
                next: (data) => this.categorias = data,
                error: (err) => {
                    console.error(err);
                    this.toastr.error('Error al cargar categorías');
                }
            });
        } else if (this.isGlobalAdmin) {
            // Si es SuperAdmin y no hay restaurante seleccionado, cargar TODOS los proveedores y categorías
            this.proveedorService.getAll().subscribe({
                next: (data) => this.proveedores = data,
                error: (err) => {
                    console.error(err);
                    this.toastr.error('Error al cargar proveedores globales');
                }
            });

            this.categoriaService.getAll().subscribe({
                next: (data) => this.categorias = data,
                error: (err) => {
                    console.error(err);
                    this.toastr.error('Error al cargar categorías globales');
                }
            });
        } else {
            this.toastr.warning('Por favor, selecciona un restaurante para filtrar la lista de proveedores y categorías');
        }
    }

    onSave(): void {
        if (this.productoForm.invalid) return;

        this.isLoading = true;
        const productoData = this.productoForm.value;

        if (this.data?.id) {
            // Actualizar - mantener el estado activo del producto original
            this.productoService.update(this.data.id, { ...productoData, id: this.data.id, activo: this.data.activo ?? true }).subscribe({
                next: () => {
                    this.toastr.success('Producto actualizado correctamente');
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error(err);
                    this.toastr.error('Error al actualizar el producto');
                    this.isLoading = false;
                }
            });
        } else {
            // Crear
            this.productoService.create(productoData).subscribe({
                next: () => {
                    this.toastr.success('Producto creado correctamente');
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error(err);
                    this.toastr.error('Error al crear el producto');
                    this.isLoading = false;
                }
            });
        }
    }
}