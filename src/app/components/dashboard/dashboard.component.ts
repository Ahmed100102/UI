import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  metrics: MetricCard[] = [
    {
      title: 'Total Logs',
      value: '2.4M',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'fas fa-file-alt',
      color: 'blue'
    },
    {
      title: 'Active Issues',
      value: '23',
      change: '-8.2%',
      changeType: 'positive',
      icon: 'fas fa-exclamation-triangle',
      color: 'red'
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: '+0.1%',
      changeType: 'positive',
      icon: 'fas fa-server',
      color: 'green'
    },
    {
      title: 'Response Time',
      value: '145ms',
      change: '+5.3%',
      changeType: 'negative',
      icon: 'fas fa-tachometer-alt',
      color: 'orange'
    }
  ];

  // Chart data
  logVolumeData: ChartData<'line'> = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Log Volume',
        data: [1200, 1900, 3000, 5000, 4200, 3800],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  errorDistributionData: ChartData<'doughnut'> = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [12, 19, 35, 28],
        backgroundColor: [
          '#ef4444',
          '#f97316',
          '#eab308',
          '#22c55e'
        ],
        borderWidth: 0
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
    }
  };

  ngOnInit() {
    // Initialize dashboard data
  }
}