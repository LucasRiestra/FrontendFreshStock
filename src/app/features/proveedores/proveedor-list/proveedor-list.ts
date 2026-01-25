import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../../../models/proveedor.model';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './proveedor-list.html',
  styleUrl: './proveedor-list.css',
})
export class ProveedorList implements OnInit {
  private proveedorService = inject(ProveedorService);
  proveedores: Proveedor[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores(): void {
    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading providers', err);
        this.isLoading = false;
      }
    });
  }
}
