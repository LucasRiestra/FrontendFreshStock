import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Restaurante, CreateRestaurante } from '../../models/restaurante.model';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Restaurante`;

  getAll(): Observable<Restaurante[]> {
    console.log('RestauranteService.getAll called at:', this.apiUrl);
    return this.http.get<Restaurante[]>(this.apiUrl).pipe(
      tap(data => console.log('RestauranteService.getAll response:', data))
    );
  }

  getById(id: number): Observable<Restaurante> {
    const url = `${this.apiUrl}/${id}`;
    console.log('RestauranteService.getById called at:', url);
    return this.http.get<Restaurante>(url).pipe(
      tap(data => console.log('RestauranteService.getById response:', data))
    );
  }

  create(restaurante: CreateRestaurante): Observable<Restaurante> {
    return this.http.post<Restaurante>(this.apiUrl, restaurante);
  }

  update(id: number, restaurante: Partial<Restaurante>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, restaurante);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
