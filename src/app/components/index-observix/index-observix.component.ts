import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartConfiguration } from 'chart.js';
import { LogService } from '../../services/LogService';
import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  RowComponent,
  ColComponent
} from '@coreui/angular';

@Component({
  selector: 'app-index-observix',
  standalone: true,
  templateUrl: './index-observix.component.html',
  styleUrls: ['./index-observix.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent
  ]
})
export class IndexObservixComponent implements OnInit {
  indexes: string[] = ['logstash-vgm-*', 'logstash-netprobe-*', '.ds-logs-generic-default-*'];
  selectedIndex: string = this.indexes[0];

  allCharts: {
    index: string;
    hourData: ChartData<'bar'>;
    minuteData: ChartData<'line'>;
    secondData: ChartData<'line'>;
    errorTypeData: ChartData<'bar'>;
    errorMessageData: ChartData<'pie'>;
    repeatedMessages: [string, number][];
  }[] = [];

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#ccc' } },
      tooltip: { enabled: true }
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
      y: { beginAtZero: true, ticks: { color: '#aaa' }, grid: { color: '#333' } }
    }
  };

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.indexes.forEach(index => {
      this.logService.getLogs(index).subscribe(res => {
        const logs = res.hits.hits.map((hit: any) => hit._source);
        const charts = this.buildCharts(logs);
        this.allCharts.push({ index, ...charts });
      });
    });
  }

  get selectedChart() {
    return this.allCharts.find(chart => chart.index === this.selectedIndex);
  }

  buildCharts(logs: any[]) {
    const group = (keyFn: (d: Date) => string) => {
      const buckets: { [key: string]: number } = {};
      logs.forEach(log => {
        const d = new Date(log['@timestamp'] || log.timestamp);
        const key = keyFn(d);
        buckets[key] = (buckets[key] || 0) + 1;
      });
      return Object.entries(buckets).sort();
    };

    const hour = group(d => d.getHours().toString().padStart(2, '0'));
    const minute = group(d => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
    const second = group(d => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`);

    const byType: { [level: string]: number } = {};
    logs.forEach(log => {
      const level = (log.level || 'UNKNOWN').toUpperCase();
      byType[level] = (byType[level] || 0) + 1;
    });

    const msgCount: { [msg: string]: number } = {};
    logs.forEach(log => {
      const msg = log.message || 'UNKNOWN';
      msgCount[msg] = (msgCount[msg] || 0) + 1;
    });
    const topMessages = Object.entries(msgCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return {
      hourData: {
        labels: hour.map(([h]) => h),
        datasets: [{
          data: hour.map(([, v]) => v),
          backgroundColor: '#0d6efd'
        }]
      },
      minuteData: {
        labels: minute.map(([m]) => m),
        datasets: [{
          label: 'Logs / Minute',
          data: minute.map(([, v]) => v),
          borderColor: '#ffc107',
          backgroundColor: 'rgba(255,193,7,0.2)',
          fill: true,
          tension: 0.3
        }]
      },
      secondData: {
        labels: second.map(([s]) => s),
        datasets: [{
          label: 'Logs / Second',
          data: second.map(([, v]) => v),
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220,53,69,0.2)',
          fill: false,
          tension: 0.4
        }]
      },
      errorTypeData: {
        labels: Object.keys(byType),
        datasets: [{
          label: 'Error Types',
          data: Object.values(byType),
          backgroundColor: ['#f44336', '#ffc107', '#4caf50']
        }]
      },
      errorMessageData: {
        labels: topMessages.map(([msg]) => msg),
        datasets: [{
          label: 'Top Messages',
          data: topMessages.map(([, v]) => v),
          backgroundColor: ['#0dcaf0', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c']
        }]
      },
      repeatedMessages: topMessages
    };
  }
}
