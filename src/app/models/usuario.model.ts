export enum UserRole {
  Admin = 'Admin',
  Gerente = 'Gerente',
  Empleado = 'Empleado'
}

export interface Usuario {
  id: number;
  restauranteId: number | null;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}
