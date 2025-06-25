import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogApiService {
  private apiUrl = 'http://localhost:5000/chat'; // à adapter selon ton backend

  constructor(private http: HttpClient) {}

  getLogs(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/logs`, { params });
  }

  ingestLog(log: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/logs`, log);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}