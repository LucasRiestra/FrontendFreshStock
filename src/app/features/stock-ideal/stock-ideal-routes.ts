import { Routes } from '@angular/router';

export const STOCK_IDEAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./stock-ideal-list/stock-ideal-list').then(m => m.StockIdealList)
  }
];
