import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InventarioService } from '../inventario.service';
import { RestauranteService } from '../../restaurantes/restaurante.service';
import { ProductoService } from '../../productos/producto.service';
import { ProveedorService } from '../../proveedores/proveedor.service';
import { InventarioResumen } from '../../../models/inventario.model';
import { Restaurante } from '../../../models/restaurante.model';
import { Producto } from '../../../models/producto.model';
import { EstadoInventario } from '../../../models/enums';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './stock-list.html',
  styleUrl: './stock-list.css',
})
export class StockList implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private inventarioService = inject(InventarioService);
  private restauranteService = inject(RestauranteService);
  private productoService = inject(ProductoService);
  private proveedorService = inject(ProveedorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);

  private destroy$ = new Subject<void>();

  inventarios: InventarioResumen[] = [];
  isLoading = false;
  selectedRestaurantId: number | null = null;
  EstadoInventario = EstadoInventario;

  isGlobalAdmin = false;
  restaurantes: Restaurante[] = [];

  // Merma mode
  isMermaMode = false;
  mermaForm!: FormGroup;
  productos: Producto[] = [];
  stockLotes: any[] = [];
  tiposMerma = ['Caducidad', 'Daño', 'Robo', 'Error'];
  proveedores: any[] = [];
  productosPorProveedor: Map<number, Producto[]> = new Map();

  ngOnInit(): void {
    this.isGlobalAdmin = this.authService.isGlobalAdmin();
    this.isMermaMode = this.route.snapshot.url[0]?.path === 'merma';

    if (this.isMermaMode) {
      this.initMermaForm();
    }

    if (this.isGlobalAdmin) {
      this.loadRestaurantes();
    }

    // Suscribirse a cambios de restaurante selecccionado (Header)
    this.authService.selectedRestaurant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        this.selectedRestaurantId = id;
        if (id) {
          if (this.isMermaMode) {
            this.loadProductosAndStock(id);
          } else {
            this.loadInventarios(id);
          }
        } else {
          this.inventarios = [];
          this.productos = [];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRestaurantes(): void {
    this.restauranteService.getAll().subscribe({
      next: (data) => this.restaurantes = data,
      error: (err) => console.error('Error loading restaurants', err)
    });
  }

  onRestaurantSelectionChange(event: any): void {
    const newId = event.value;
    if (newId) {
      this.authService.setSelectedRestaurant(newId);
    }
  }

  loadInventarios(restauranteId: number): void {
    this.isLoading = true;
    this.inventarioService.getByRestaurante(restauranteId).subscribe({
      next: (data) => {
        this.inventarios = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar inventarios', err);
        this.toastr.error('Error al cargar el historial de inventarios');
        this.isLoading = false;
      }
    });
  }

  iniciarNuevoInventario(): void {
    if (!this.selectedRestaurantId) {
      this.toastr.warning('Por favor seleccione un restaurante primero');
      return;
    }

    const enProgreso = this.inventarios.find(i => i.estado === EstadoInventario.EnProgreso);
    if (enProgreso) {
      this.continuarInventario(enProgreso.id);
      return;
    }

    this.isLoading = true;
    this.inventarioService.createInventario({
      restauranteId: this.selectedRestaurantId,
      nombre: `Inventario ${new Date().toLocaleDateString()}`
    }).subscribe({
      next: (inv) => {
        this.toastr.success('Nuevo inventario iniciado');
        this.router.navigate(['/inventario/detalle', inv.id]);
      },
      error: (err) => {
        this.toastr.error('No se pudo crear el inventario');
        this.isLoading = false;
      }
    });
  }

  continuarInventario(id: number): void {
    this.router.navigate(['/inventario/detalle', id]);
  }

  eliminarInventario(event: Event, inv: InventarioResumen): void {
    event.stopPropagation(); // Evitar navegar al detalle

    if (confirm(`¿Está seguro de que desea eliminar el inventario "${inv.nombre}"? Esta acción no se puede deshacer.`)) {
      this.isLoading = true;
      this.inventarioService.deleteInventario(inv.id).subscribe({
        next: () => {
          this.toastr.success('Inventario eliminado correctamente');
          if (this.selectedRestaurantId) {
            this.loadInventarios(this.selectedRestaurantId);
          }
        },
        error: (err) => {
          console.error('Error al eliminar inventario', err);
          this.toastr.error('No se pudo eliminar el inventario');
          this.isLoading = false;
        }
      });
    }
  }

  // ===== MERMA MODE METHODS =====

  initMermaForm(): void {
    this.mermaForm = this.fb.group({
      proveedorId: ['', Validators.required],
      productoId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      tipoMerma: ['', Validators.required]
    });

    this.mermaForm.get('proveedorId')?.valueChanges.subscribe(() => {
      this.mermaForm.get('productoId')?.reset();
    });
  }

  loadProductosAndStock(restauranteId: number): void {
    this.isLoading = true;

    // Cargar stock, productos y proveedores en paralelo
    Promise.all([
      this.inventarioService.getStockByRestaurante(restauranteId).toPromise(),
      this.productoService.getAll().toPromise(),
      this.proveedorService.getAll().toPromise()
    ]).then(([stock, productos, proveedores]) => {
      this.stockLotes = stock || [];
      this.productos = productos || [];
      this.proveedores = proveedores || [];
      this.agruparProductosPorProveedor();
      this.isLoading = false;
    }).catch(err => {
      console.error('Error loading data', err);
      this.toastr.error('Error al cargar datos');
      this.isLoading = false;
    });
  }

  agruparProductosPorProveedor(): void {
    this.productosPorProveedor.clear();

    this.productos.forEach(p => {
      // Solo agregar si hay stock en el restaurante seleccionado
      const tieneStock = this.stockLotes.some(s => s.productoId === p.id && s.cantidad > 0);
      if (tieneStock && p.proveedorId) {
        if (!this.productosPorProveedor.has(p.proveedorId)) {
          this.productosPorProveedor.set(p.proveedorId, []);
        }
        this.productosPorProveedor.get(p.proveedorId)!.push(p);
      }
    });
  }

  getProductosByProveedor(proveedorId: number): Producto[] {
    return this.productosPorProveedor.get(proveedorId) || [];
  }

  getProductosUnicos(): any[] {
    const seen = new Set();
    return this.stockLotes.filter(s => {
      if (seen.has(s.productoId)) return false;
      seen.add(s.productoId);
      return s.cantidad > 0;
    });
  }

  getLotesByProducto(productoId: number): string[] {
    return this.stockLotes
      .filter(s => s.productoId == productoId && s.cantidad > 0)
      .map(s => s.lote);
  }

  registrarMerma(): void {
    if (!this.mermaForm.valid || !this.selectedRestaurantId) {
      this.toastr.warning('Por favor complete todos los campos');
      return;
    }

    const usuario = this.authService.getCurrentUserValue();
    if (!usuario) {
      this.toastr.error('Error: usuario no encontrado');
      return;
    }

    const productoId = Number(this.mermaForm.get('productoId')?.value);
    const stockProducto = this.stockLotes.find(s => s.productoId === productoId && s.cantidad > 0);

    if (!stockProducto) {
      this.toastr.error('No hay stock disponible para este producto');
      return;
    }

    const mermaData = {
      productoId: productoId,
      restauranteId: this.selectedRestaurantId,
      lote: stockProducto.lote,
      cantidad: Number(this.mermaForm.get('cantidad')?.value),
      tipoMerma: this.mermaForm.get('tipoMerma')?.value,
      usuarioId: usuario.id
    };

    this.isLoading = true;
    this.inventarioService.registrarMerma(mermaData).subscribe({
      next: () => {
        this.toastr.success('Merma registrada correctamente');
        this.mermaForm.reset();
        if (this.selectedRestaurantId) {
          this.loadProductosAndStock(this.selectedRestaurantId);
        }
      },
      error: (err) => {
        console.error('Error al registrar merma', err);
        this.toastr.error(err.error?.message || 'Error al registrar merma');
        this.isLoading = false;
      }
    });
  }
}
