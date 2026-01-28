// Request para crear stock ideal individual
export interface CreateStockIdealRestauranteDTO {
  productoId: number;
  restauranteId: number;
  stockIdeal: number;
  stockMinimo: number;
  stockMaximo: number;
}

// Request para crear múltiples stock ideal
export interface CreateStockIdealBulkDTO {
  restauranteId: number;
  items: CreateStockIdealItemDTO[];
}

export interface CreateStockIdealItemDTO {
  productoId: number;
  stockIdeal: number;
  stockMinimo: number;
  stockMaximo: number;
}

// Request para actualizar
export interface UpdateStockIdealRestauranteDTO {
  stockIdeal?: number;
  stockMinimo?: number;
  stockMaximo?: number;
  activo?: boolean;
}

// Response
export interface StockIdealRestauranteResponse {
  id: number;
  productoId: number;
  restauranteId: number;
  stockIdeal: number;
  stockMinimo: number;
  stockMaximo: number;
  activo: boolean;
  // Campos enriquecidos
  nombreProducto?: string;
  nombreRestaurante?: string;
  unidadMedida?: string;
}
