export interface Producto {
  id: number;
  proveedorId: number;
  categoriaId: number;
  nombre: string;
  unidadMedida: string;
  stockMinimo: number;
  costoUnitario: number;
  activo: boolean;
}

export interface CreateProducto {
  proveedorId: number;
  categoriaId: number;
  nombre: string;
  unidadMedida: string;
  stockMinimo: number;
  costoUnitario: number;
}
