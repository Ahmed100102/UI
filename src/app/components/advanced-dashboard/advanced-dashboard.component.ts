import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { LogService } from '../../services/LogService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-advanced-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './advanced-dashboard.component.html',
  styleUrls: ['./advanced-dashboard.component.css']
})
export class AdvancedDashboardComponent implements OnInit {
  selectedCategory: string = ''; // 🔹 Catégorie sélectionnée : vgm, fiscd, netprobe

  public lineChartType: 'line' = 'line';

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Logs per Minute',
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13,110,253,0.2)',
        pointBackgroundColor: '#0d6efd',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
        pointRadius: 4,
        tension: 0.4,
        fill: true
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 14, weight: 'bold' },
          color: '#444'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (tooltipItems) => `Time: ${tooltipItems[0].label}`,
          label: (tooltipItem) => `Logs: ${tooltipItem.formattedValue}`
        }
      },
      title: {
        display: true,
        text: 'Log Activity (per minute)',
        font: { size: 18 }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        title: { display: true, text: 'Date and Time' },
        ticks: { color: '#333' },
        grid: { display: false }
      },
      y: {
        title: { display: true, text: 'Number of Logs' },
        beginAtZero: true,
        ticks: { stepSize: 5, color: '#333' },
        grid: { color: '#eee' }
      }
    }
  };

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    const indexMap: { [key: string]: string } = {
      vgm: 'logstash-vgm-*',
      fiscd: 'logstash-netprobe*',
      netprobe: 'logstash-fiscd*'
    };

    const index = this.selectedCategory ? indexMap[this.selectedCategory] : '';

    this.logService.getLogs(index).subscribe(response => {
      const buckets = this.aggregateLogsByMinute(response.hits.hits);
      this.lineChartData = {
        labels: buckets.map(b => b.time),
        datasets: [
          {
            ...this.lineChartData.datasets[0],
            data: buckets.map(b => b.count)
          }
        ]
      };
    });
  }

  private aggregateLogsByMinute(logs: any[]): { time: string, count: number }[] {
    const counts: { [minute: string]: number } = {};

    logs.forEach(log => {
      const timestamp = log._source?.['@timestamp'];
      if (!timestamp) return;

      const date = new Date(timestamp);
      const minute = date.toISOString().substring(0, 16).replace('T', ' ');
      counts[minute] = (counts[minute] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }
}
