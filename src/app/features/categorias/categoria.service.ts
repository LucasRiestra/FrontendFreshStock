import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, CreateCategoria } from '../../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Categoria`;

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getByRestaurante(restauranteId: number): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/restaurante/${restauranteId}`);
  }

  create(categoria: CreateCategoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  createAndAssign(categoria: CreateCategoria, restauranteId: number): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/crear-y-asignar/${restauranteId}`, categoria);
  }

  update(id: number, categoria: Partial<Categoria>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, categoria);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  asignarARestaurante(categoriaId: number, restauranteId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/asignar/${categoriaId}/${restauranteId}`, {});
  }
}
