export interface Restaurante {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  activo: boolean;
}

export interface CreateRestaurante {
  nombre: string;
  direccion: string;
  telefono?: string;
}
