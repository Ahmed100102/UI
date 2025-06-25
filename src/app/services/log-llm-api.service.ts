
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { EventSourcePolyfill } from 'event-source-polyfill';

@Injectable({ providedIn: 'root' })
export class LogLlmApiService {
  constructor(private zone: NgZone) {}

  startAnalysis(payload: any): Observable<any> {
    return new Observable((observer) => {
      const eventSource = new EventSourcePolyfill('http://localhost:5000/chat', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          message: `analyze ${payload.source} logs from ${payload.start_time} to ${payload.end_time}`
        })
      } as any); // ← indique ici "as any" pour ignorer le typage strict

      eventSource.onmessage = (event) => {
        this.zone.run(() => {
          try {
            const data = JSON.parse(event.data);
            observer.next(data);
          } catch (e) {
            console.error('Erreur parsing SSE:', e);
          }
        });
      };

      eventSource.onerror = (error) => {
        this.zone.run(() => {
          console.error('Erreur SSE:', error);
          observer.error(error);
          eventSource.close();
        });
      };

      return () => eventSource.close();
    });
  }
}