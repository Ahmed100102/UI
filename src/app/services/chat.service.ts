import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

// Interface for /chat endpoint response
interface ChatResponse {
  status: string;
  intent?: string;
  endpoint?: string;
  payload?: {
    start_time: string;
    end_time: string;
    source: string;
    component?: string;
    tags?: string[];
  };
  message?: string;
}

// Interface for SSE events from /analyse endpoint
interface AnalysisEvent {
  status: string;
  analysis_id?: string;
  message?: string;
  result?: {
    timestamp: string;
    component: string;
    log_message: string;
    rca: { error_id: string; root_cause: string; confidence: number };
    remediation: { error_id: string; remediation_steps: string[]; priority: string };
  };
  summary?: string;
  results?: any[];
}

// Interface for /results endpoint response
interface ResultsResponse {
  status: string;
  results: any[];
  summary: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = '/api/chat';
  private analyseUrl = '/api/analyse';

  constructor(private http: HttpClient) {}

  // Send message to /chat endpoint and handle response
  sendMessage(message: string): Observable<AnalysisEvent | ResultsResponse> {
    const subject = new Subject<AnalysisEvent | ResultsResponse>();

    fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
      .then((response) => {
        const reader = response.body?.getReader();
        if (!reader) {
          subject.error({ status: 'error', message: 'No response body stream' });
          return;
        }
        const decoder = new TextDecoder();

        function readChunk(): Promise<void> {
          return reader!.read().then(({ done, value }) => {
            if (done) {
              subject.complete();
              return;
            }
            const chunkText = decoder.decode(value, { stream: true });
            // Split the SSE stream by double newlines into individual events
            const events = chunkText.split(/\n\n/).filter((e) => e.trim() !== '');
            events.forEach((event) => {
              if (event.startsWith('data:')) {
                event = event.substring(5).trim();
              }
              try {
                const data = JSON.parse(event);
                subject.next(data);
              } catch (err: any) {
                subject.error({ status: 'error', message: 'Failed to parse SSE data' });
              }
            });
            return readChunk();
          });
        }
        return readChunk();
      })
      .catch((err) => {
        subject.error({ status: 'error', message: err.message });
      });

    return subject.asObservable();
  }

  // Handle SSE for /analyse endpoint
  private handleSSE(payload: any): Observable<AnalysisEvent> {
    return new Observable<AnalysisEvent>((observer) => {
      const eventSource = new EventSource(this.buildSSEUrl(payload));

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as AnalysisEvent;
          observer.next(data);
          if (data.status === 'complete') {
            eventSource.close();
            observer.complete();
          }
        } catch (e) {
          observer.error({ status: 'error', message: 'Failed to parse SSE data' });
        }
      };

      eventSource.onerror = () => {
        observer.error({ status: 'error', message: 'SSE connection failed' });
        eventSource.close();
      };

      // Cleanup on unsubscribe
      return () => {
        eventSource.close();
      };
    });
  }

  // Build SSE URL with query parameters
  private buildSSEUrl(payload: any): string {
    const params = new HttpParams()
      .set('start_time', payload.start_time)
      .set('end_time', payload.end_time)
      .set('source', payload.source)
      .set('component', payload.component || '')
      .set('tags', payload.tags ? payload.tags.join(',') : '');

    return `${this.analyseUrl}?${params.toString()}`;
  }

  // Fetch results for /results endpoint
  private getResults(payload: any): Observable<ResultsResponse> {
    const params = new HttpParams()
      .set('start_time', payload.start_time)
      .set('end_time', payload.end_time)
      .set('source', payload.source);

    return this.http.get<ResultsResponse>('/api/results', { params });
  }
}