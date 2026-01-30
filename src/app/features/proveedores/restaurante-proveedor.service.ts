import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RestauranteProveedor {
  id: number;
  restauranteId: number;
  proveedorId: number;
}

export interface CreateRestauranteProveedor {
  restauranteId: number;
  proveedorId: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestauranteProveedorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/RestauranteProveedor`;

  getAll(): Observable<RestauranteProveedor[]> {
    return this.http.get<RestauranteProveedor[]>(this.apiUrl);
  }

  getByProveedor(proveedorId: number): Observable<RestauranteProveedor[]> {
    return this.http.get<RestauranteProveedor[]>(`${this.apiUrl}/proveedor/${proveedorId}`);
  }

  getByRestaurante(restauranteId: number): Observable<RestauranteProveedor[]> {
    return this.http.get<RestauranteProveedor[]>(`${this.apiUrl}/restaurante/${restauranteId}`);
  }

  create(data: CreateRestauranteProveedor): Observable<RestauranteProveedor> {
    return this.http.post<RestauranteProveedor>(this.apiUrl, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
