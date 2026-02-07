import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockLocal } from '../../models/stock.model';
import { MovimientoInventario, CreateMovimiento } from '../../models/movimiento.model';
import { FinalizarInventarioDTO, InventarioResponse, CreateInventarioDTO, InventarioResumen, InventarioDetalleResponse, CreateInventarioDetalleDTO, CreateInventarioDetalleBulkDTO } from '../../models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private http = inject(HttpClient);
  private stockUrl = `${environment.apiUrl}/StockLocal`;
  private movimientoUrl = `${environment.apiUrl}/MovimientoInventario`;
  private inventarioUrl = `${environment.apiUrl}/Inventario`;

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

  // Inventario Process Methods (New)

  createInventario(dto: CreateInventarioDTO): Observable<InventarioResponse> {
    return this.http.post<InventarioResponse>(`${this.inventarioUrl}/nuevo`, dto);
  }

  getInventarioById(id: number): Observable<InventarioResponse> {
    return this.http.get<InventarioResponse>(`${this.inventarioUrl}/${id}`);
  }

  getInventarioActual(restauranteId: number): Observable<InventarioResponse> {
    return this.http.get<InventarioResponse>(`${this.inventarioUrl}/restaurante/${restauranteId}/actual`);
  }

  finalizarInventario(id: number, dto: FinalizarInventarioDTO): Observable<InventarioResponse> {
    return this.http.post<InventarioResponse>(`${this.inventarioUrl}/${id}/finalizar`, dto);
  }

  deleteInventario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.inventarioUrl}/${id}`);
  }

  getByRestaurante(restauranteId: number): Observable<InventarioResumen[]> {
    return this.http.get<InventarioResumen[]>(`${this.inventarioUrl}/restaurante/${restauranteId}`);
  }

  getDetalles(inventarioId: number): Observable<InventarioDetalleResponse[]> {
    return this.http.get<InventarioDetalleResponse[]>(`${this.inventarioUrl}/${inventarioId}/detalles`);
  }

  registrarConteo(inventarioId: number, dto: CreateInventarioDetalleDTO): Observable<InventarioDetalleResponse> {
    return this.http.post<InventarioDetalleResponse>(`${this.inventarioUrl}/${inventarioId}/contar`, dto);
  }

  registrarConteoBulk(inventarioId: number, dto: CreateInventarioDetalleBulkDTO): Observable<void> {
    return this.http.post<void>(`${this.inventarioUrl}/${inventarioId}/contar/bulk`, dto);
  }

  // Navigation for Counting
  getCategorias(inventarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.inventarioUrl}/${inventarioId}/categorias`);
  }

  getProveedoresByCategoria(inventarioId: number, categoriaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.inventarioUrl}/${inventarioId}/categoria/${categoriaId}/proveedores`);
  }

  getProductosByProveedor(inventarioId: number, proveedorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.inventarioUrl}/${inventarioId}/proveedor/${proveedorId}/productos`);
  }
}
