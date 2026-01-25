export interface Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  contacto: string;
  activo: boolean;
}

export interface CreateProveedor {
  nombre: string;
  telefono: string;
  email: string;
  contacto: string;
}
