import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  selectedTimeRange = '24h';
  selectedPlatform = 'all';
  
  timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];
  
  platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'vgm', label: 'VGM' },
    { value: 'fiscd', label: 'FISCD' },
    { value: 'netprobe', label: 'NetProbe' }
  ];

  // Performance metrics
  performanceData: ChartData<'line'> = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [120, 135, 180, 165, 145, 130],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Throughput (req/s)',
        data: [850, 920, 1100, 980, 890, 820],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  // Error trends
  errorTrendsData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Critical',
        data: [12, 8, 15, 6, 9, 4, 7],
        backgroundColor: '#ef4444'
      },
      {
        label: 'High',
        data: [25, 18, 32, 14, 21, 12, 16],
        backgroundColor: '#f59e0b'
      },
      {
        label: 'Medium',
        data: [45, 38, 52, 28, 41, 25, 33],
        backgroundColor: '#eab308'
      }
    ]
  };

  // System health
  systemHealthData: ChartData<'radar'> = {
    labels: ['CPU', 'Memory', 'Disk', 'Network', 'Database', 'Cache'],
    datasets: [
      {
        label: 'Current',
        data: [85, 72, 68, 91, 78, 88],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        pointBackgroundColor: '#667eea'
      },
      {
        label: 'Average',
        data: [75, 68, 65, 82, 74, 80],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left'
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  radarOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  ngOnInit() {
    this.loadAnalyticsData();
  }

  onTimeRangeChange() {
    this.loadAnalyticsData();
  }

  onPlatformChange() {
    this.loadAnalyticsData();
  }

  private loadAnalyticsData() {
    // Simulate data loading based on filters
    console.log(`Loading data for ${this.selectedTimeRange} on ${this.selectedPlatform}`);
  }

  exportData() {
    // Export functionality
    console.log('Exporting analytics data...');
  }
}