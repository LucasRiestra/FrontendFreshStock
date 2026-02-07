import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { InventarioService } from '../inventario.service';
import { InventarioResponse, InventarioDetalleResponse } from '../../../models/inventario.model';
import { CategoriaService } from '../../categorias/categoria.service';
import { ProveedorService } from '../../proveedores/proveedor.service';
import { StockIdealService } from '../../stock-ideal/services/stock-ideal.service';
import { Categoria } from '../../../models/categoria.model';
import { Proveedor } from '../../../models/proveedor.model';
import { StockIdealRestauranteResponse } from '../../../models/stock-ideal.model';
import { ToastrService } from 'ngx-toastr';
import { InventarioFinalizarDialog } from '../components/inventario-finalizar-dialog/inventario-finalizar-dialog';
import { InventoryProductSelectionDialog } from '../components/inventory-product-selection-dialog/inventory-product-selection-dialog';

@Component({
    selector: 'app-inventario-detalle',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatSelectModule,
        FormsModule,
        MatDialogModule,
        RouterModule
    ],
    templateUrl: './inventario-detalle.html',
    styleUrl: './inventario-detalle.css'
})
export class InventarioDetalle implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private inventarioService = inject(InventarioService);
    private categoriaService = inject(CategoriaService);
    private proveedorService = inject(ProveedorService);
    private stockIdealService = inject(StockIdealService);
    private toastr = inject(ToastrService);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    inventarioId!: number;
    inventario?: InventarioResponse;
    allDetalles: InventarioDetalleResponse[] = [];
    filteredDetalles: InventarioDetalleResponse[] = [];
    stockIdealMap = new Map<number, StockIdealRestauranteResponse>();

    categorias: Categoria[] = [];
    proveedores: Proveedor[] = [];

    searchTerm = '';
    selectedCategoryId: number | null = null;
    selectedProviderId: number | null = null;

    isLoading = true;
    isSaving = false;

    displayedColumns: string[] = ['producto', 'stockIdeal', 'cantidadSistema', 'cantidadContada', 'observacion'];

    ngOnInit(): void {
        this.inventarioId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.inventarioId) {
            this.loadData();
        }
    }

    loadData(): void {
        this.isLoading = true;

        this.inventarioService.getInventarioById(this.inventarioId).subscribe({
            next: (inv) => {
                this.inventario = inv;

                if (inv && inv.restauranteId) {
                    this.loadMetadata(inv.restauranteId);
                    this.loadDetalles();
                } else {
                    this.toastr.error('Error en la información del inventario');
                    this.isLoading = false;
                }
            },
            error: (err) => {
                this.toastr.error('No se pudo cargar la información básica');
                this.isLoading = false;
            }
        });
    }

    loadMetadata(restauranteId: number): void {
        this.categoriaService.getByRestaurante(restauranteId).subscribe({
            next: (data) => this.categorias = data,
            error: (err) => console.error('Error metadatos categorías:', err)
        });

        this.proveedorService.getByRestaurante(restauranteId).subscribe({
            next: (data) => this.proveedores = data,
            error: (err) => console.error('Error metadatos proveedores:', err)
        });

        this.stockIdealService.getByRestaurante(restauranteId).subscribe({
            next: (items) => {
                this.stockIdealMap.clear();
                items.forEach(item => this.stockIdealMap.set(item.productoId, item));
                this.enrichDetallesWithStockIdeal();
            },
            error: (err) => console.error('Error loading stock ideal:', err)
        });
    }

    private enrichDetallesWithStockIdeal(): void {
        this.allDetalles.forEach(d => {
            const config = this.stockIdealMap.get(d.productoId);
            if (config) {
                d.stockIdeal = config.stockIdeal;
                d.stockMinimo = config.stockMinimo;
            }
        });
        this.performLocalFilter(this.searchTerm.toLowerCase());
    }

    loadDetalles(): void {
        this.inventarioService.getDetalles(this.inventarioId).subscribe({
            next: (data) => {
                this.allDetalles = data || [];
                this.enrichDetallesWithStockIdeal();
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.toastr.error('Fallo al cargar la lista de productos');
                this.isLoading = false;
            }
        });
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase();

        // Si tenemos un proveedor seleccionado, intentamos cargar sus productos directamente (Direct Count Workflow)
        if (this.selectedProviderId) {
            this.isLoading = true;
            this.inventarioService.getProductosByProveedor(this.inventarioId, this.selectedProviderId).subscribe({
                next: (products) => {
                    const mapedProducts: InventarioDetalleResponse[] = products.map(p => {
                        const config = this.stockIdealMap.get(p.id);
                        return {
                            id: 0,
                            inventarioId: this.inventarioId,
                            productoId: p.id,
                            proveedorId: p.proveedorId,
                            categoriaId: p.categoriaId,
                            cantidadContada: p.cantidadContada ?? 0,
                            cantidadSistema: p.cantidadSistema,
                            stockIdeal: config?.stockIdeal ?? p.stockIdeal,
                            stockMinimo: config?.stockMinimo ?? p.stockMinimo,
                            diferencia: (p.cantidadContada ?? 0) - p.cantidadSistema,
                            observacion: p.observacion || '',
                            fechaConteo: new Date(),
                            nombreProducto: p.nombre,
                            unidadMedida: p.unidadMedida,
                        };
                    });

                    // Fusionar con lo que ya tenemos en allDetalles (evitar duplicados)
                    mapedProducts.forEach(newP => {
                        const index = this.allDetalles.findIndex(d => d.productoId === newP.productoId);
                        if (index === -1) {
                            this.allDetalles.push(newP);
                        } else {
                            // Actualizamos solo campos de referencia si ya existe
                            this.allDetalles[index].stockIdeal = newP.stockIdeal;
                            this.allDetalles[index].stockMinimo = newP.stockMinimo;
                        }
                    });

                    this.performLocalFilter(term);
                    this.isLoading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error fetching products for provider:', err);
                    this.isLoading = false;
                    this.performLocalFilter(term);
                }
            });
        } else {
            this.performLocalFilter(term);
        }
    }

    performLocalFilter(term: string): void {
        this.filteredDetalles = this.allDetalles.filter(d => {
            const matchesSearch = d.nombreProducto?.toLowerCase().includes(term);
            const matchesCategory = this.selectedCategoryId ? d.categoriaId === this.selectedCategoryId : true;
            const matchesProvider = this.selectedProviderId ? d.proveedorId === this.selectedProviderId : true;

            return matchesSearch && matchesCategory && matchesProvider;
        });
        this.cdr.detectChanges();
    }

    saveProgress(): void {
        this.isSaving = true;

        // Limpiar y validar datos antes de enviar
        const conteos = this.allDetalles
            .filter(d => d.productoId > 0)
            .map(d => ({
                productoId: d.productoId,
                cantidadContada: Number(d.cantidadContada) || 0,
                observacion: d.observacion || ''
            }));

        const payload = { conteos };
        console.log('Guardando conteos:', payload);

        this.inventarioService.registrarConteoBulk(this.inventarioId, payload).subscribe({
            next: () => {
                this.toastr.success('Progreso guardado correctamente');
                this.isSaving = false;
                this.loadDetalles(); // Recargar para obtener IDs finales del servidor
            },
            error: (err) => {
                console.error('Error al guardar:', err);
                const errorMsg = err.error?.message || 'Error al guardar el progreso';
                this.toastr.error(errorMsg);
                this.isSaving = false;
            }
        });
    }

    openFinalizarDialog(): void {
        const dialogRef = this.dialog.open(InventarioFinalizarDialog, {
            width: '400px',
            data: { notas: '' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.isLoading = true;
                this.inventarioService.finalizarInventario(this.inventarioId, result).subscribe({
                    next: () => {
                        this.toastr.success('Inventario finalizado correctamente');
                        this.router.navigate(['/inventario']);
                    },
                    error: (err) => {
                        console.error(err);
                        this.toastr.error('Error al finalizar el inventario');
                        this.isLoading = false;
                    }
                });
            }
        });
    }

    openAddProductDialog(): void {
        if (!this.inventario) return;

        const currentProductIds = this.allDetalles.map(d => d.productoId);

        const dialogRef = this.dialog.open(InventoryProductSelectionDialog, {
            width: '600px',
            data: {
                selectedRestaurantId: this.inventario.restauranteId,
                existingProductIds: currentProductIds
            }
        });

        dialogRef.afterClosed().subscribe(selectedProducts => {
            if (selectedProducts && selectedProducts.length > 0) {
                this.isLoading = true;
                const nuevosConteos = selectedProducts.map((p: any) => ({
                    productoId: p.id,
                    cantidadContada: 0,
                    observacion: 'Añadido manualmente'
                }));

                this.inventarioService.registrarConteoBulk(this.inventarioId, { conteos: nuevosConteos }).subscribe({
                    next: () => {
                        this.toastr.success('Productos añadidos');
                        this.loadData();
                    },
                    error: (err) => {
                        console.error(err);
                        this.toastr.error('Error al añadir productos');
                        this.isLoading = false;
                    }
                });
            }
        });
    }
}
