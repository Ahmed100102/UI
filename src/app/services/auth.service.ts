import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8089/users';

  constructor(private http: HttpClient) {}

  // ✅ Inscription (signup)
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/new`, userData);
  }

  // ✅ Connexion (login)
  authenticate(credentials: { email: string; password: string }): Observable<any> {
    // 🔧 Correction ici : authentificate → authenticate
    return this.http.post(`${this.apiUrl}/authenticate`, credentials);
  }

  // ✅ Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ✅ Stocke le token
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // ✅ Récupère les rôles depuis le token JWT (à adapter si besoin)
  getRoles(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return [payload.sub]; // ou payload.role selon ton backend
    } catch {
      return [];
    }
  }

  // ✅ Déconnexion
  logout(): void {
    localStorage.removeItem('token');
  }
}
