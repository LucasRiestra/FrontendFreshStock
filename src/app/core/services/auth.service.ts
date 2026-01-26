import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../../models/auth.model';
import { Usuario, UserRole, PermisoUsuario } from '../../models/usuario.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private permissionsSubject = new BehaviorSubject<PermisoUsuario | null>(null);
  public permissions$ = this.permissionsSubject.asObservable();

  private selectedRestaurantSubject = new BehaviorSubject<number | null>(null);
  public selectedRestaurant$ = this.selectedRestaurantSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(environment.userKey);
    const permissionsJson = localStorage.getItem(environment.permissionsKey);
    const selectedRestaurantStr = localStorage.getItem(environment.selectedRestaurantKey);

    if (userJson) {
      try {
        this.currentUserSubject.next(JSON.parse(userJson));
      } catch (e) {
        this.logout();
        return;
      }
    }

    if (permissionsJson) {
      try {
        this.permissionsSubject.next(JSON.parse(permissionsJson));
      } catch (e) {
        console.error('Error parsing permissions from storage', e);
      }
    }

    if (selectedRestaurantStr) {
      this.selectedRestaurantSubject.next(Number(selectedRestaurantStr));
    }
  }

  login(credentials: LoginRequest): Observable<PermisoUsuario> {
    console.log('Attempting login for:', credentials.email);
    return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, credentials).pipe(
      tap(response => {
        console.log('Login successful, storing session');
        this.storeSession(response);
      }),
      switchMap(() => {
        console.log('Fetching permissions...');
        return this.getPermissions();
      }),
      tap(permissions => {
        console.log('Permissions received:', permissions);
        this.storePermissions(permissions);
        
        const currentRestId = this.getSelectedRestaurantId();
        const user = this.getCurrentUserValue();

        if (permissions.restaurantes.length === 1) {
          console.log('Only one restaurant found, auto-selecting:', permissions.restaurantes[0].restauranteId);
          this.setSelectedRestaurant(permissions.restaurantes[0].restauranteId);
        } else if (permissions.restaurantes.length === 0 && user?.restauranteId) {
          console.log('No modern assignments, using legacy restauranteId:', user.restauranteId);
          this.setSelectedRestaurant(user.restauranteId);
        }
      })
    );
  }

  getPermissions(): Observable<PermisoUsuario> {
    return this.http.get<PermisoUsuario>(`${environment.apiUrl}/Permiso/mis-permisos`);
  }

  setSelectedRestaurant(id: number): void {
    localStorage.setItem(environment.selectedRestaurantKey, id.toString());
    this.selectedRestaurantSubject.next(id);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(environment.userKey);
    localStorage.removeItem(environment.permissionsKey);
    localStorage.removeItem(environment.selectedRestaurantKey);
    this.currentUserSubject.next(null);
    this.permissionsSubject.next(null);
    this.selectedRestaurantSubject.next(null);
    this.router.navigate(['/login']);
  }

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(environment.tokenKey, response.accessToken);
    localStorage.setItem(environment.refreshTokenKey, response.refreshToken);
    localStorage.setItem(environment.userKey, JSON.stringify(response.usuario));
    this.currentUserSubject.next(response.usuario);
  }

  getCurrentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isGlobalAdmin(): boolean {
    const perms = this.permissionsSubject.value;
    const user = this.currentUserSubject.value;

    if (perms?.puedeCrearRestaurantes) return true;
    
    // Legacy fallback for ID 1 or Role "Admin" / 1
    if (perms?.usuarioId === 1 || user?.id === 1) return true;
    if (user?.rol === 1 || user?.rol === 'Admin') return true;

    return false;
  }

  public storePermissions(permissions: PermisoUsuario): void {
    localStorage.setItem(environment.permissionsKey, JSON.stringify(permissions));
    this.permissionsSubject.next(permissions);
  }

  getPermissionsValue(): PermisoUsuario | null {
    return this.permissionsSubject.value;
  }

  getSelectedRestaurantId(): number | null {
    return this.selectedRestaurantSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }
}
