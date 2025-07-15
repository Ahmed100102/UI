import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  source: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit {
  systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: 68,
      unit: '%',
      status: 'healthy',
      trend: 'stable'
    },
    {
      name: 'Memory Usage',
      value: 84,
      unit: '%',
      status: 'warning',
      trend: 'up'
    },
    {
      name: 'Disk Usage',
      value: 45,
      unit: '%',
      status: 'healthy',
      trend: 'down'
    },
    {
      name: 'Network I/O',
      value: 156,
      unit: 'MB/s',
      status: 'healthy',
      trend: 'stable'
    }
  ];

  alerts: Alert[] = [
    {
      id: '1',
      title: 'High Memory Usage',
      description: 'Memory usage has exceeded 80% threshold on server-01',
      severity: 'high',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      source: 'server-01',
      status: 'active'
    },
    {
      id: '2',
      title: 'Database Connection Pool Full',
      description: 'All database connections are in use, new requests are queuing',
      severity: 'critical',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      source: 'database',
      status: 'acknowledged'
    },
    {
      id: '3',
      title: 'SSL Certificate Expiring',
      description: 'SSL certificate for api.example.com expires in 7 days',
      severity: 'medium',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      source: 'security',
      status: 'active'
    }
  ];

  // Real-time metrics chart
  realTimeData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'CPU %',
        data: [],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Memory %',
        data: [],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    animation: {
      duration: 0
    }
  };

  ngOnInit() {
    this.initializeRealTimeData();
    this.startRealTimeUpdates();
  }

  private initializeRealTimeData() {
    const now = new Date();
    const labels = [];
    const cpuData = [];
    const memoryData = [];

    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 2000);
      labels.push(time.toLocaleTimeString());
      cpuData.push(Math.random() * 30 + 40);
      memoryData.push(Math.random() * 20 + 60);
    }

    this.realTimeData.labels = labels;
    this.realTimeData.datasets[0].data = cpuData;
    this.realTimeData.datasets[1].data = memoryData;
  }

  private startRealTimeUpdates() {
    setInterval(() => {
      this.updateRealTimeData();
      this.updateSystemMetrics();
    }, 2000);
  }

  private updateRealTimeData() {
    const now = new Date();
    const labels = this.realTimeData.labels as string[];
    const cpuData = this.realTimeData.datasets[0].data as number[];
    const memoryData = this.realTimeData.datasets[1].data as number[];

    // Add new data point
    labels.push(now.toLocaleTimeString());
    cpuData.push(Math.random() * 30 + 40);
    memoryData.push(Math.random() * 20 + 60);

    // Remove old data point
    if (labels.length > 30) {
      labels.shift();
      cpuData.shift();
      memoryData.shift();
    }

    // Trigger chart update
    this.realTimeData = { ...this.realTimeData };
  }

  private updateSystemMetrics() {
    this.systemMetrics = this.systemMetrics.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() - 0.5) * 5
    }));
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
    }
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
    }
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'healthy': 'status-healthy',
      'warning': 'status-warning',
      'critical': 'status-critical'
    };
    return statusMap[status] || 'status-healthy';
  }

  getSeverityClass(severity: string): string {
    const severityMap: { [key: string]: string } = {
      'critical': 'severity-critical',
      'high': 'severity-high',
      'medium': 'severity-medium',
      'low': 'severity-low'
    };
    return severityMap[severity] || 'severity-low';
  }

  getTrendIcon(trend: string): string {
    const trendMap: { [key: string]: string } = {
      'up': 'fas fa-arrow-up',
      'down': 'fas fa-arrow-down',
      'stable': 'fas fa-minus'
    };
    return trendMap[trend] || 'fas fa-minus';
  }
}