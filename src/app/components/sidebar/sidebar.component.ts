import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgChartsModule } from 'ng2-charts';
import {
  ChartData,
  ChartOptions,
  ChartType
} from 'chart.js';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgChartsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }

  // 📊 Bar Chart
  urgencyChartType: ChartType = 'bar';
  urgencyChartData: ChartData<'bar'> = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Notables',
        data: [45, 102, 87, 36],
        backgroundColor: ['#dc2626', '#f97316', '#eab308', '#22c55e']
      }
    ]
  };
  urgencyChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Nombre' }
      }
    }
  };

  // 📈 Line Chart
  lineChartType: ChartType = 'line';
  lineChartData: ChartData<'line'> = {
    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25'],
    datasets: [
      {
        label: 'Access',
        data: [10, 20, 15, 30, 25, 35],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Network',
        data: [5, 10, 8, 20, 18, 22],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Nombre' }
      },
      x: {
        title: { display: true, text: 'Heure' }
      }
    }
  };
}