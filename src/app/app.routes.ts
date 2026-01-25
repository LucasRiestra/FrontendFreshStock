import { Routes } from '@angular/router';

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
    // canActivate: [AuthGuard], // TODO: Implement Guard
    loadComponent: () => import('./shared/components/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule) 
      },
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
