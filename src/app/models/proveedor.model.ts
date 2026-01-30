export interface Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  contacto: string;
  direccion?: string;
  activo: boolean;
}

export interface CreateProveedor {
  nombre: string;
  telefono: string;
  email: string;
  contacto: string;
  direccion?: string;
  restauranteIds?: number[];
}

export interface UpdateProveedor {
  id?: number;
  nombre: string;
  telefono: string;
  email: string;
  contacto: string;
  direccion?: string;
  activo?: boolean;
  restauranteIds?: number[];
}
