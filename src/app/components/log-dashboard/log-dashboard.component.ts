import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { LogApiService } from '../../services/log-api.service';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

export interface LogStats {
  total: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

@Component({
  selector: 'app-log-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgChartsModule],
  templateUrl: './log-dashboard.component.html',
  styleUrls: ['./log-dashboard.component.css']
})
export class LogDashboardComponent implements OnInit {
  logs: LogEntry[] = [];
  allLogs: LogEntry[] = [];

  stats: LogStats = { total: 0, errorCount: 0, warningCount: 0, infoCount: 0 };
  keyword: string = '';
  isLoading: boolean = false;

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Type de log',
          font: { size: 14 }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de logs',
          font: { size: 14 }
        }
      }
    }
  };

  public barChartType: 'bar' = 'bar';

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['ERROR', 'WARNING', 'INFO'],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Logs par priorité',
        backgroundColor: ['#e74c3c', '#f39c12', '#3498db'],
        borderRadius: 6,
        borderWidth: 1
      }
    ]
  };

  constructor(private logApiService: LogApiService) {}

  ngOnInit(): void {
    this.loadLogsFromApi();
  }

  loadLogsFromApi(): void {
    this.isLoading = true;
    this.logApiService.getLogs().subscribe({
      next: (data: LogEntry[]) => {
        this.logs = data;
        this.allLogs = [...data];
        this.updateStats();
        this.updateChart();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des logs :', err.message);
        this.isLoading = false;
      }
    });
  }

  updateStats(): void {
    this.stats = {
      total: this.logs.length,
      errorCount: this.logs.filter(l => l.level.toLowerCase() === 'error').length,
      warningCount: this.logs.filter(l => l.level.toLowerCase() === 'warning').length,
      infoCount: this.logs.filter(l => l.level.toLowerCase() === 'info').length
    };
  }

  updateChart(): void {
    this.barChartData.datasets[0].data = [
      this.stats.errorCount,
      this.stats.warningCount,
      this.stats.infoCount
    ];
  }

  onSearch(): void {
    const kw = this.keyword.toLowerCase().trim();

    if (!kw) {
      this.loadLogsFromApi();
      return;
    }

    this.logApiService.getLogs({ keyword: kw }).subscribe({
      next: (data: LogEntry[]) => {
        this.logs = data;
        this.allLogs = [...data];
        this.updateStats();
        this.updateChart();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la recherche :', err.message);
      }
    });
  }

  exportToCSV(): void {
    const headers = ['Timestamp', 'Level', 'Message', 'Source'];
    const rows = this.logs.map(log => [log.timestamp, log.level, log.message, log.source]);
    const csvContent = 'data:text/csv;charset=utf-8,' +
      headers.join(',') + '\n' +
      rows.map(r => r.map(val => `"${val}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'log_export.csv';
    link.click();
  }
}
