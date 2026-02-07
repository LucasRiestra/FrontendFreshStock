import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadComponent: () => import('./stock-list/stock-list').then(m => m.StockList), pathMatch: 'full' },
  { path: 'detalle/:id', loadComponent: () => import('./inventario-detalle/inventario-detalle').then(m => m.InventarioDetalle) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioRoutingModule { }
