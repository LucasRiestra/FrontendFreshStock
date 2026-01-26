import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadComponent: () => import('./restaurante-list/restaurante-list').then(m => m.RestauranteList) },
  { path: 'nuevo', loadComponent: () => import('./restaurante-form/restaurante-form').then(m => m.RestauranteForm) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantesRoutingModule { }
