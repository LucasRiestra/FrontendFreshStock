import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, CreateUsuarioDTO, UsuarioRestaurante, CreateUsuarioRestauranteDTO, UpdateUsuarioRestauranteDTO } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private userUrl = `${environment.apiUrl}/Usuario`;
  private assignmentUrl = `${environment.apiUrl}/UsuarioRestaurante`;

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.userUrl);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.userUrl}/${id}`);
  }

  getByRestaurante(restauranteId: number): Observable<UsuarioRestaurante[]> {
    return this.http.get<UsuarioRestaurante[]>(`${this.assignmentUrl}/restaurante/${restauranteId}`);
  }

  create(usuario: CreateUsuarioDTO): Observable<Usuario> {
    return this.http.post<Usuario>(this.userUrl, usuario);
  }

  update(id: number, usuario: Partial<Usuario>): Observable<void> {
    return this.http.put<void>(`${this.userUrl}/${id}`, usuario);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.userUrl}/${id}`);
  }

  // Assignment methods
  assignToRestaurante(assignment: CreateUsuarioRestauranteDTO): Observable<UsuarioRestaurante> {
    return this.http.post<UsuarioRestaurante>(this.assignmentUrl, assignment);
  }

  updateAssignment(id: number, update: UpdateUsuarioRestauranteDTO): Observable<void> {
    return this.http.put<void>(`${this.assignmentUrl}/${id}`, update);
  }

  removeAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.assignmentUrl}/${id}`);
  }
}
