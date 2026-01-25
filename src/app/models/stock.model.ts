export interface StockLocal {
  id: number;
  productoId: number;
  restauranteId: number;
  lote: string;
  cantidad: number;
  costoUnitario: number;
  fechaEntrada: Date;
  fechaCaducidad?: Date;
}
