import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CategoriaService } from '../categoria.service';
import { Categoria } from '../../../models/categoria.model';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css',
})
export class CategoriaList implements OnInit {
  private categoriaService = inject(CategoriaService);
  categorias: Categoria[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.categoriaService.getAll().subscribe({
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
}
