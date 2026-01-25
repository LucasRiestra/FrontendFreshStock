import { Usuario, UserRole } from './usuario.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  restauranteId: number | null;
}

// Redundant Usuario interface removed as it's now imported

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiration: Date;
  usuario: Usuario;
}
