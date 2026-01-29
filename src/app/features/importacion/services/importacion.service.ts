import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ImportacionPreviewResult,
  ImportacionResult,
  ExportacionRequest
} from '../../../models/importacion.model';

@Injectable({
  providedIn: 'root'
})
export class ImportacionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Importacion`;

  // Vista previa de importación
  preview(
    archivo: File,
    proveedorId: number,
    categoriaId: number,
    restauranteId: number
  ): Observable<ImportacionPreviewResult> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('proveedorId', proveedorId.toString());
    formData.append('categoriaId', categoriaId.toString());
    formData.append('restauranteId', restauranteId.toString());

    return this.http.post<ImportacionPreviewResult>(
      `${this.apiUrl}/preview`,
      formData
    );
  }

  // Ejecutar importación
  ejecutar(
    archivo: File,
    proveedorId: number,
    categoriaId: number,
    restauranteId: number,
    actualizarExistentes: boolean = false
  ): Observable<ImportacionResult> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('proveedorId', proveedorId.toString());
    formData.append('categoriaId', categoriaId.toString());
    formData.append('restauranteId', restauranteId.toString());
    formData.append('actualizarExistentes', actualizarExistentes.toString());

    return this.http.post<ImportacionResult>(
      `${this.apiUrl}/ejecutar`,
      formData
    );
  }

  // Descargar plantilla
  descargarPlantilla(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/plantilla`, {
      responseType: 'blob'
    });
  }

  // Exportar productos a Excel
  exportar(request: ExportacionRequest): Observable<Blob> {
    let params = new HttpParams();
    if (request.proveedorId) {
        params = params.set('proveedorId', request.proveedorId.toString());
    }
    if (request.categoriaId) {
        params = params.set('categoriaId', request.categoriaId.toString());
    }
    if (request.restauranteId) {
        params = params.set('restauranteId', request.restauranteId.toString());
    }
    if (request.incluirStock) {
        params = params.set('incluirStock', request.incluirStock.toString());
    }

    return this.http.get(`${this.apiUrl}/exportar`, {
      params,
      responseType: 'blob'
    });
  }
}
