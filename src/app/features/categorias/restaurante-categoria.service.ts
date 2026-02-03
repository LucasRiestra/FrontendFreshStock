import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RestauranteCategoria, CreateRestauranteCategoria } from '../../models/restauranteCategoria.model';

@Injectable({
  providedIn: 'root'
})
export class RestauranteCategoriaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/RestauranteCategoria`;

  getAll(): Observable<RestauranteCategoria[]> {
    return this.http.get<RestauranteCategoria[]>(this.apiUrl);
  }

  getByCategoria(categoriaId: number): Observable<RestauranteCategoria[]> {
    return this.http.get<RestauranteCategoria[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }

  getByRestaurante(restauranteId: number): Observable<RestauranteCategoria[]> {
    return this.http.get<RestauranteCategoria[]>(`${this.apiUrl}/restaurante/${restauranteId}`);
  }

  create(data: CreateRestauranteCategoria): Observable<RestauranteCategoria> {
    return this.http.post<RestauranteCategoria>(this.apiUrl, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
