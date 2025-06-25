import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogLlmApiService } from '../../services/log-llm-api.service';

@Component({
  selector: 'app-log-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-analysis.component.html',
  styleUrls: ['./log-analysis.component.css']
})
export class LogAnalysisComponent {
  start_time: string = '2024-01-01T00:00:00Z';
  end_time: string = '2025-05-28T23:59:59Z';
  source: string = 'netprobe';

  status: string = '';
  results: any[] = [];

  constructor(private logLlmApiService: LogLlmApiService) {}

  startAnalysis() {
    this.status = 'Analyse en cours...';
    this.results = [];

    const payload = {
      start_time: this.start_time,
      end_time: this.end_time,
      source: this.source
    };

    this.logLlmApiService.startAnalysis(payload).subscribe({
      next: (data) => {
        if (data.status === 'started') {
          this.status = 'Analyse démarrée...';
        } else if (data.status === 'progress') {
          this.results.push(data.result);
        } else if (data.status === 'complete') {
          this.status = `✅ ${data.summary}`;
        } else if (data.status === 'error') {
          this.status = `❌ Erreur : ${data.message}`;
        }
      },
      error: (err) => {
        console.error('Erreur SSE :', err);
        this.status = '❌ Erreur lors du streaming SSE';
      }
    });
  }
}