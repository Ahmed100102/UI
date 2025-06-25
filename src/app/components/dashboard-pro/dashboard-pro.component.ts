import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { LogService } from '../../services/LogService';
import { FormsModule } from '@angular/forms';

type LogType = 'ERROR' | 'INFO' | 'WARNING' | 'DEBUG' | 'AUTRE';

interface LogSummaryRow {
  date: string;
  counts: { [key in LogType]: number };
  dominantType: LogType;
}

@Component({
  selector: 'app-dashboard-pro',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './dashboard-pro.component.html',
  styleUrls: ['./dashboard-pro.component.css']
})
export class DashboardProComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  selectedType: string = '';
  selectedPlatform: string = '';

  chartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Most Frequent Log Type per Day'
      }
    }
  };

  logSummary: LogSummaryRow[] = [];
  errorMessage: string = '';
  totalErrors: number = 0;
  errorRate: number = 0;

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  applyFilters(): void {
    this.fetchLogs();
  }

  resetFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.selectedType = '';
    this.selectedPlatform = '';
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.errorMessage = '';

    const platformIndex = this.selectedPlatform
      ? `logstash-${this.selectedPlatform.toLowerCase()}-*`
      : '*';

    this.logService.getFilteredLogs(this.startDate, this.endDate, this.selectedType, platformIndex).subscribe({
      next: (response) => {
        const hits = response.hits?.hits || [];
        const logs = hits.map((hit: any) => ({
          timestamp: hit._source['@timestamp'],
          message: hit._source.message
        }));

        this.processLogs(logs);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des logs :', err);
        this.errorMessage = 'Erreur lors de la récupération des logs. Vérifiez la plateforme sélectionnée.';
      }
    });
  }

  processLogs(logs: { timestamp: string; message: string }[]) {
    const logMap: { [date: string]: { [type in LogType]?: number } } = {};
    let skippedLogs = 0;
    let totalLogs = 0;
    let totalErrors = 0;

    logs.forEach(log => {
      const parsedDate = new Date(log.timestamp);
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid timestamp:', log.timestamp);
        skippedLogs++;
        return;
      }

      const date = parsedDate.toISOString().split('T')[0];
      const type = this.extractLogType(log.message) as LogType;

      if (!logMap[date]) logMap[date] = {};
      if (!logMap[date][type]) logMap[date][type] = 0;
      logMap[date][type]!++;
    });

    if (skippedLogs > 0) {
      console.warn(`${skippedLogs} logs were skipped due to invalid timestamps.`);
    }

    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColors: string[] = [];

    const colorMap: { [key in LogType]: string } = {
      'ERROR': '#FF6384',
      'INFO': '#36A2EB',
      'WARNING': '#FFCE56',
      'DEBUG': '#4BC0C0',
      'AUTRE': '#999999'
    };

    this.logSummary = [];

    for (const date in logMap) {
      const counts: { [key in LogType]: number } = {
        ERROR: 0,
        INFO: 0,
        WARNING: 0,
        DEBUG: 0,
        AUTRE: 0,
        ...logMap[date]
      };

      const dominantType = Object.keys(counts).reduce((a, b) =>
        counts[a as LogType] > counts[b as LogType] ? a : b
      ) as LogType;

      labels.push(`${date} (${dominantType})`);
      data.push(counts[dominantType]);
      backgroundColors.push(colorMap[dominantType]);

      this.logSummary.push({ date, counts, dominantType });

      totalLogs += Object.values(counts).reduce((sum, val) => sum + val, 0);
      totalErrors += counts.ERROR;
    }

    this.totalErrors = totalErrors;
    this.errorRate = totalLogs > 0 ? Math.round((totalErrors / totalLogs) * 100) : 0;

    this.chartData = {
      labels,
      datasets: [{
        label: 'Log Count (Dominant Type)',
        data,
        backgroundColor: backgroundColors
      }]
    };
  }

  extractLogType(message: string): LogType {
    const upperMsg = message.toUpperCase();
    if (upperMsg.includes('ERROR')) return 'ERROR';
    if (upperMsg.includes('WARN')) return 'WARNING';
    if (upperMsg.includes('INFO')) return 'INFO';
    if (upperMsg.includes('DEBUG')) return 'DEBUG';
    return 'AUTRE';
  }
}
