export interface Usuario {
  id: number;
  restauranteId: number | null;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}
