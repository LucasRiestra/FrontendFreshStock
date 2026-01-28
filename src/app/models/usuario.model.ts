export enum UserRole {
  Admin = 1,
  Gerente = 2,
  Empleado = 3
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  rol?: number | string; // Legacy support for Admin check
  restauranteId?: number; // Legacy support for restaurant context
}

export interface UsuarioRestaurante {
  id: number;
  usuarioId: number;
  restauranteId: number;
  rol: UserRole;
  activo: boolean;
  nombreUsuario?: string;
  email?: string;
  nombre?: string; // For normalization
  nombreRestaurante?: string;
}

export interface PermisoRestaurante {
  restauranteId: number;
  nombreRestaurante: string;
  rol: UserRole;
  puedeCrearUsuarios: boolean;
  puedeCrearCategorias: boolean;
  puedeCrearProveedores: boolean;
  puedeGestionarInventario: boolean;
}

export interface PermisoUsuario {
  usuarioId: number;
  puedeCrearRestaurantes: boolean;
  restaurantes: PermisoRestaurante[];
}

export interface CreateUsuarioDTO {
  nombre: string;
  email: string;
  password?: string;
}

export interface CreateUsuarioRestauranteDTO {
  usuarioId: number;
  restauranteId: number;
  rol: UserRole;
}

export interface UpdateUsuarioRestauranteDTO {
  id: number;
  rol: UserRole;
  activo: boolean;
}
