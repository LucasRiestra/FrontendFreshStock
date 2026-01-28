import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StockIdealService } from '../services/stock-ideal.service';
import { AuthService } from '../../../core/services/auth.service';
import { StockIdealRestauranteResponse } from '../../../models/stock-ideal.model';
import { ToastrService } from 'ngx-toastr';

import { StockIdealForm } from '../stock-ideal-form/stock-ideal-form';
import { StockSelectionDialog } from '../stock-selection-dialog/stock-selection-dialog';

@Component({
  selector: 'app-stock-ideal-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './stock-ideal-list.html',
  styleUrls: ['./stock-ideal-list.css']
})
export class StockIdealList implements OnInit {
  private stockIdealService = inject(StockIdealService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  stockIdeales: StockIdealRestauranteResponse[] = [];
  isLoading = true;
  displayedColumns: string[] = ['producto', 'stockMinimo', 'stockIdeal', 'stockMaximo', 'acciones'];
  selectedRestaurantId: number | null = null;

  ngOnInit(): void {
    this.authService.selectedRestaurant$.subscribe(id => {
      this.selectedRestaurantId = id;
      if (id) {
        this.loadStockIdeales();
      } else {
        this.stockIdeales = [];
        this.isLoading = false;
      }
    });
  }

  loadStockIdeales(): void {
    if (!this.selectedRestaurantId) return;
    
    this.isLoading = true;
    this.stockIdealService.getByRestaurante(this.selectedRestaurantId).subscribe({
      next: (data) => {
        this.stockIdeales = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading ideal stock', err);
        this.toastr.error('Error al cargar los niveles de stock', 'Error');
        this.isLoading = false;
      }
    });
  }

  openEditDialog(element: StockIdealRestauranteResponse): void {
    const dialogRef = this.dialog.open(StockIdealForm, {
      width: '400px',
      data: { ...element }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStockIdeales();
      }
    });
  }

  openBulkAssignment(): void {
    if (!this.selectedRestaurantId) {
      this.toastr.warning('Por favor seleccione un restaurante primero', 'Aviso');
      return;
    }

    const currentProductIds = this.stockIdeales.map(s => s.productoId);

    const dialogRef = this.dialog.open(StockSelectionDialog, {
      width: '500px',
      data: {
        selectedRestaurantId: this.selectedRestaurantId,
        existingProductIds: currentProductIds
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStockIdeales();
      }
    });
  }
}
