import { EstadoStock } from './enums';

export interface ComparativaStock {
  restauranteId: number;
  ultimoInventarioId?: number;
  fechaUltimoInventario?: Date;
  productos: ComparativaProducto[];
  resumen: ResumenComparativa;
}

export interface ComparativaProducto {
  productoId: number;
  nombreProducto: string;
  nombreProveedor: string;
  nombreCategoria: string;
  stockIdeal: number;
  stockMinimo: number;
  stockReal: number;
  diferenciaIdeal: number;
  estado: EstadoStock;
}

export interface ResumenComparativa {
  totalProductos: number;
  productosCriticos: number;
  productosBajos: number;
  productosNormales: number;
  productosExceso: number;
}

export interface HistorialComparativa {
  inventarioId: number;
  nombre: string;
  fechaInventario: Date;
  resumen: ResumenComparativa;
}
