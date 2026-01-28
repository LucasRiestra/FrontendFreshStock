// Preview Request (se envía como FormData)
export interface ImportacionPreviewRequest {
  proveedorId: number;
  categoriaId: number;
  restauranteId: number;
}

// Preview Result
export interface ImportacionPreviewResult {
  totalFilas: number;
  productosNuevos: number;
  productosExistentes: number;
  filasConError: number;
  productos: ProductoImportacion[];
  errores: ErrorImportacion[];
}

export interface ProductoImportacion {
  fila: number;
  nombre: string;
  unidadMedida: string;
  stockMinimo: number;
  costoUnitario: number;
  descripcion?: string;
  esNuevo: boolean;
  productoExistenteId?: number;
  tieneError: boolean;
  mensajeError?: string;
}

export interface ErrorImportacion {
  fila: number;
  columna: string;
  mensaje: string;
}

// Ejecutar Request (se envía como FormData)
export interface ImportacionEjecutarRequest {
  proveedorId: number;
  categoriaId: number;
  restauranteId: number;
  actualizarExistentes: boolean;
}

// Ejecutar Result
export interface ImportacionResult {
  exitoso: boolean;
  productosCreados: number;
  productosActualizados: number;
  productosOmitidos: number;
  erroresValidacion: number;
  detalle: ProductoImportado[];
  errores: ErrorImportacion[];
}

export interface ProductoImportado {
  id?: number;
  nombre: string;
  accion: 'Creado' | 'Actualizado' | 'Omitido';
}

// Exportación Request
export interface ExportacionRequest {
  proveedorId?: number;
  categoriaId?: number;
  restauranteId?: number;
  incluirStock?: boolean;
}
