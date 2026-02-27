import { Usuario } from './usuario.model'

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
  usuario: Usuario;
}
