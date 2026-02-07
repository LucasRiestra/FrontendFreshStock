import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateStockIdealRestauranteDTO,
  CreateStockIdealBulkDTO,
  UpdateStockIdealRestauranteDTO,
  StockIdealRestauranteResponse
} from '../../../models/stock-ideal.model';

@Injectable({
  providedIn: 'root'
})
export class StockIdealService {
  private apiUrl = `${environment.apiUrl}/StockIdealRestaurante`;

  constructor(private http: HttpClient) { }

  // Obtener stock ideal por restaurante
  getByRestaurante(restauranteId: number): Observable<StockIdealRestauranteResponse[]> {
    return this.http.get<StockIdealRestauranteResponse[]>(
      `${this.apiUrl}/restaurante/${restauranteId}`
    );
  }

  // Obtener stock ideal por producto en un restaurante
  getByProducto(restauranteId: number, productoId: number): Observable<StockIdealRestauranteResponse> {
    return this.http.get<StockIdealRestauranteResponse>(
      `${this.apiUrl}/restaurante/${restauranteId}/producto/${productoId}`
    );
  }

  // Crear stock ideal individual
  create(dto: CreateStockIdealRestauranteDTO): Observable<StockIdealRestauranteResponse> {
    return this.http.post<StockIdealRestauranteResponse>(this.apiUrl, dto);
  }

  // Crear stock ideal en bulk
  createBulk(dto: CreateStockIdealBulkDTO): Observable<StockIdealRestauranteResponse[]> {
    return this.http.post<StockIdealRestauranteResponse[]>(`${this.apiUrl}/bulk`, dto);
  }

  // Actualizar stock ideal
  update(id: number, dto: UpdateStockIdealRestauranteDTO): Observable<StockIdealRestauranteResponse> {
    return this.http.put<StockIdealRestauranteResponse>(`${this.apiUrl}/${id}`, dto);
  }

  // Eliminar stock ideal (soft delete)
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
