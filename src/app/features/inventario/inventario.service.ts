import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockLocal } from '../../models/stock.model';
import { MovimientoInventario, CreateMovimiento } from '../../models/movimiento.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private http = inject(HttpClient);
  private stockUrl = `${environment.apiUrl}/StockLocal`;
  private movimientoUrl = `${environment.apiUrl}/MovimientoInventario`;

  // Stock methods
  getAllStock(): Observable<StockLocal[]> {
    return this.http.get<StockLocal[]>(this.stockUrl);
  }

  getStockByRestaurante(restauranteId: number): Observable<StockLocal[]> {
    return this.http.get<StockLocal[]>(`${this.stockUrl}/restaurante/${restauranteId}`);
  }

  createStock(stock: any): Observable<StockLocal> {
    return this.http.post<StockLocal>(this.stockUrl, stock);
  }

  // Movimientos methods
  getAllMovimientos(): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(this.movimientoUrl);
  }

  getMovimientosByRestaurante(restauranteId: number): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.movimientoUrl}/restaurante/${restauranteId}`);
  }

  createMovimiento(movimiento: CreateMovimiento): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(this.movimientoUrl, movimiento);
  }

  registrarMerma(merma: any): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.movimientoUrl}/merma`, merma);
  }
}
