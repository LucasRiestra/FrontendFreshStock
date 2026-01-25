import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  let clonedRequest = req;

  // Si tenemos un token, lo añadimos a la cabecera Authorization
  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un 401 (Unauthorized) de cualquier ruta, forzamos logout
      // si el error no es del propio login
      if (error.status === 401 && !req.url.includes('Auth/login')) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
