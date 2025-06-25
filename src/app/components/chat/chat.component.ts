import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  message: string = '';
  isLoading: boolean = false;
  results: any[] = [];
  stats: { total: number; infoCount: number; warningCount: number; errorCount: number } | null = null;

  constructor(private chatService: ChatService) {}

  sendMessage() {
    if (!this.message.trim()) return;

    this.isLoading = true;
    this.results = [];
    this.stats = null;

    this.chatService.sendMessage(this.message).subscribe({
      next: (response) => {
        // Cas : événement SSE avec un résultat unique
        if ('result' in response && response.status === 'progress') {
          this.results.push(response.result);
        }

        // Cas : réponse finale avec un tableau de résultats
        if ('results' in response && response.status === 'complete' && Array.isArray(response.results)) {
          this.results.push(...response.results);
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'analyse :', err);
        this.isLoading = false;
      },
      complete: () => {
        this.computeStats();
        this.isLoading = false;
      },
    });
  }

  computeStats() {
    const total = this.results.length;
    let infoCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    for (const r of this.results) {
      const level = r.level?.toLowerCase();
      if (level === 'info') infoCount++;
      else if (level === 'warning') warningCount++;
      else if (level === 'error') errorCount++;
    }

    this.stats = { total, infoCount, warningCount, errorCount };
  }

  exportToCSV() {
    const headers = ['Timestamp', 'Composant', 'Message', 'Cause', 'Remédiation', 'Priorité'];
    const rows = this.results.map(r => [
      r.timestamp,
      r.component,
      r.log_message,
      Array.isArray(r.rca?.root_cause) ? r.rca.root_cause.join('; ') : r.rca?.root_cause,
      r.remediation?.remediation_steps?.join('; '),
      r.remediation?.priority
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs_analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
