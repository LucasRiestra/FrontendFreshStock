import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Usuario, RegisterRequest } from '../../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(environment.userKey);
    if (userJson) {
      try {
        this.currentUserSubject.next(JSON.parse(userJson));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, credentials).pipe(
      tap(response => {
        this.storeSession(response);
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(environment.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(environment.tokenKey, response.accessToken);
    localStorage.setItem(environment.refreshTokenKey, response.refreshToken);
    localStorage.setItem(environment.userKey, JSON.stringify(response.usuario));
    this.currentUserSubject.next(response.usuario);
  }

  get token(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }
}
