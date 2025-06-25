import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../services/LogService';

@Component({
  selector: 'app-monitoring-board',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './monitoring-board.component.html',
  styleUrls: ['./monitoring-board.component.css']
})
export class MonitoringBoardComponent implements OnInit {
  isLoading = false;

  chartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Répartition globale des logs par type' }
    }
  };

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.refreshData();
    setInterval(() => this.refreshData(), 60000); // auto-refresh every 60s
  }

  refreshData(): void {
    this.isLoading = true;
    this.logService.getLogs().subscribe(response => {
      const hits = response?.hits?.hits || [];

      const typeCounts: { [key: string]: number } = {
        ERROR: 0,
        INFO: 0,
        WARNING: 0,
        DEBUG: 0,
        AUTRE: 0
      };

      for (const hit of hits) {
        const message = hit._source?.message?.toLowerCase() || '';

        const type = message.includes('error') ? 'ERROR' :
                     message.includes('warn') ? 'WARNING' :
                     message.includes('info') ? 'INFO' :
                     message.includes('debug') ? 'DEBUG' : 'AUTRE';

        typeCounts[type]++;
      }

      this.chartData = {
        labels: Object.keys(typeCounts),
        datasets: [
          {
            label: 'Logs',
            data: Object.values(typeCounts),
            backgroundColor: ['#ef4444', '#3b82f6', '#facc15', '#10b981', '#9ca3af']
          }
        ]
      };

      this.isLoading = false;
    });
  }
}
