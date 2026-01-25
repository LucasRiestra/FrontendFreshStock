export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: 'Admin' | 'Gerente' | 'Empleado';
}

export interface Usuario {
  id: number;
  restauranteId: number | null;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiration: Date;
  usuario: Usuario;
}
