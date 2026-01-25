import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proveedor, CreateProveedor } from '../../models/proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Proveedor`;

  getAll(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  create(proveedor: CreateProveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedor);
  }

  update(id: number, proveedor: Partial<Proveedor>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, proveedor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
