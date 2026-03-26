import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Cambia esto a tu URL de Python
  private apiUrl = 'https://medisupport-production.up.railway.app/api/auth'; 

  // Mantiene el estado de la sesión en tiempo real
  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) { }

  // Retorna el estado actual como un Observable (para ocultar/mostrar cosas en el HTML)
  isLoggedIn(): Observable<boolean> {
    return this.authState.asObservable();
  }

  // Verifica si hay un token guardado
  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Retorna el token actual
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Retorna los datos del usuario guardado
  getCurrentUser(): any {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.access_token) {
          // Guardamos el token y los datos del usuario
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('current_user', JSON.stringify(res.user));
          
          // Actualizamos el estado a "Conectado"
          this.authState.next(true);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    // Borramos todo
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    
    // Actualizamos el estado a "Desconectado"
    this.authState.next(false);
    
    // Lo pateamos a la pantalla de login
    this.router.navigate(['/auth']);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-profile`, data);
  }


  getDoctors(): Observable<any> {
    // Ajusta la URL si tu prefijo no es /auth
    return this.http.get(`${this.apiUrl}/doctors`); 
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`); 
  }
}