import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login) 
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },

  // Rutas protegidas
  {
    path: '',
    canActivate: [authGuard], 
    loadComponent: () => import('./shared/components/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', redirectTo: 'restaurantes', pathMatch: 'full' },
      { 
        path: 'restaurantes', 
        loadChildren: () => import('./features/restaurantes/restaurantes-module').then(m => m.RestaurantesModule) 
      },
      { 
        path: 'categorias', 
        loadChildren: () => import('./features/categorias/categorias-module').then(m => m.CategoriasModule) 
      },
      { 
        path: 'proveedores', 
        loadChildren: () => import('./features/proveedores/proveedores-module').then(m => m.ProveedoresModule) 
      },
      { 
        path: 'productos', 
        loadChildren: () => import('./features/productos/productos-module').then(m => m.ProductosModule) 
      },
      { 
        path: 'inventario', 
        loadChildren: () => import('./features/inventario/inventario-module').then(m => m.InventarioModule) 
      },
      { 
        path: 'usuarios', 
        loadChildren: () => import('./features/usuarios/usuarios-module').then(m => m.UsuariosModule) 
      },
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];
