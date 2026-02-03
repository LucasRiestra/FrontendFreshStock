import { EstadoInventario } from './enums';

// ========== INVENTARIO (Cabecera) ==========

export interface CreateInventarioDTO {
  restauranteId: number;
  nombre: string;
  notas?: string;
}

export interface FinalizarInventarioDTO {
  notas?: string;
  actualizarStock?: boolean;
}

export interface InventarioResponse {
  id: number;
  restauranteId: number;
  nombre: string;
  fechaInicio: Date;
  fechaFin?: Date;
  estado: EstadoInventario;
  usuarioId: number;
  notas?: string;
  // Campos enriquecidos
  nombreRestaurante?: string;
  nombreUsuario?: string;
  totalProductos: number;
  productosContados: number;
  porcentajeProgreso: number;
}

export interface InventarioResumen {
  id: number;
  nombre: string;
  fechaInicio: Date;
  fechaFin?: Date;
  estado: EstadoInventario;
  productosContados: number;
}

// ========== INVENTARIO DETALLE (Conteos) ==========

export interface CreateInventarioDetalleDTO {
  productoId: number;
  cantidadContada: number;
  observacion?: string;
}

export interface CreateInventarioDetalleBulkDTO {
  conteos: CreateInventarioDetalleDTO[];
}

export interface UpdateInventarioDetalleDTO {
  id: number;
  cantidadContada: number;
  observacion?: string;
}

export interface InventarioDetalleResponse {
  id: number;
  inventarioId: number;
  productoId: number;
  proveedorId: number;
  categoriaId: number;
  cantidadContada: number;
  cantidadSistema?: number;
  diferencia?: number;
  observacion?: string;
  fechaConteo: Date;
  // Campos enriquecidos
  nombreProducto?: string;
  nombreProveedor?: string;
  nombreCategoria?: string;
  unidadMedida?: string;
}

// ========== NAVEGACIÓN PARA CONTEO ==========

export interface CategoriaConteo {
  id: number;
  nombre: string;
  totalProductos: number;
  productosContados: number;
  completada: boolean;
}

export interface ProveedorConteo {
  id: number;
  nombre: string;
  totalProductos: number;
  productosContados: number;
  completado: boolean;
}

export interface ProductoConteo {
  id: number;
  nombre: string;
  unidadMedida: string;
  proveedorId: number;
  categoriaId: number;
  cantidadSistema: number;
  cantidadContada?: number;
  yaContado: boolean;
  observacion?: string;
}

// ========== PROGRESO ==========

export interface ProgresoInventario {
  inventarioId: number;
  totalProductos: number;
  productosContados: number;
  porcentajeProgreso: number;
  categoriasPendientes: CategoriaProgreso[];
}

export interface CategoriaProgreso {
  categoriaId: number;
  nombreCategoria: string;
  pendientes: number;
}
