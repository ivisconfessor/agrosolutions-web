import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError, timeout } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Usuario } from '@core/auth/models/usuario.model';
import { LoginRequest, LoginResponse } from '@core/auth/models/login.model';

const STORAGE_KEY = 'agro_token';
const STORAGE_USER_KEY = 'agro_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser$: Observable<Usuario | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  login(email: string, senha: string): Observable<LoginResponse> {
    const url = `${environment.apiUrls.usuario}/login`;
    const body: LoginRequest = { email, senha };

    console.log(`[AuthService] Iniciando login para: ${email}`);
    console.log(`[AuthService] URL da API: ${url}`);

    return this.http.post<LoginResponse>(url, body).pipe(
      timeout(15000), // Timeout de 15 segundos
      tap((response) => {
        console.log('[AuthService] Login bem-sucedido');
        this.setToken(response.token);
        this.currentUserSubject.next(response.usuario);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.usuario));
      }),
      catchError((error) => {
        console.error('[AuthService] Erro no login:', error);
        throw error;
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(STORAGE_KEY, token);
  }
}
