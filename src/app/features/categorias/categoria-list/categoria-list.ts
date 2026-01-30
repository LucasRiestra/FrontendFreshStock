import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriaService } from '../categoria.service';
import { AuthService } from '../../../core/services/auth.service';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaForm } from '../categoria-form/categoria-form';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css',
})
export class CategoriaList implements OnInit {
  private categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);

  categorias: Categoria[] = [];
  isLoading = true;
  selectedRestaurantId: number | null = null;
  isGlobalAdmin = false;

  ngOnInit(): void {
    this.isGlobalAdmin = this.authService.isGlobalAdmin();

    this.authService.selectedRestaurant$.subscribe(id => {
      this.selectedRestaurantId = id;
      this.loadCategorias();
    });
  }

  loadCategorias(): void {
    this.isLoading = true;

    // SuperAdmin siempre ve todas las categorías
    // Gerente solo ve las de su restaurante
    const obs$ = this.isGlobalAdmin
      ? this.categoriaService.getAll()
      : this.selectedRestaurantId
        ? this.categoriaService.getByRestaurante(this.selectedRestaurantId)
        : this.categoriaService.getAll();

    obs$.subscribe({
      next: (data) => {
        this.categorias = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.isLoading = false;
      }
    });
  }

  openForm(categoria?: Categoria): void {
    const dialogRef = this.dialog.open(CategoriaForm, {
      width: '400px',
      data: categoria || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategorias();
      }
    });
  }

  onDelete(categoria: Categoria): void {
    if (confirm(`¿Está seguro de eliminar la categoría ${categoria.nombre}?`)) {
      this.categoriaService.delete(categoria.id!).subscribe({
        next: () => {
          this.toastr.success('Categoría eliminada');
          this.loadCategorias();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al eliminar la categoría');
        }
      });
    }
  }
}
