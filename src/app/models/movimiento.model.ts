export interface MovimientoInventario {
  id: number;
  tipo: 'Entrada' | 'Salida';
  productoId: number;
  restauranteId: number;
  cantidad: number;
  lote: string;
  motivo: string;
  costoUnitario?: number;
  fecha: Date;
  usuarioId: number;
  restauranteDestinoId?: number;
}

export interface CreateMovimiento {
  tipo: 'Entrada' | 'Salida';
  productoId: number;
  restauranteId: number;
  cantidad: number;
  lote: string;
  motivo: string;
  usuarioId: number;
  restauranteDestinoId?: number;
}

export interface CreateMerma {
  productoId: number;
  restauranteId: number;
  cantidad: number;
  lote: string;
  tipoMerma: string;
  usuarioId: number;
}
