import { Routes } from '@angular/router';

export const IMPORTACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./importacion-form/importacion-form').then(m => m.ImportacionForm)
  }
];
