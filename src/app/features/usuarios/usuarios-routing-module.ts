import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadComponent: () => import('./usuario-list/usuario-list').then(m => m.UsuarioList) },
  { path: 'nuevo', loadComponent: () => import('./usuario-form/usuario-form').then(m => m.UsuarioForm) },
  { path: ':id/editar', loadComponent: () => import('./usuario-form/usuario-form').then(m => m.UsuarioForm) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }
