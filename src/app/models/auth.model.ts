import { Usuario, UserRole } from './usuario.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

// Redundant Usuario interface removed as it's now imported

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiration: Date;
  usuario: Usuario;
}
