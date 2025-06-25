import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-advanced-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './advanced-chart.component.html',
  styleUrls: ['./advanced-chart.component.css']
})
export class AdvancedChartComponent implements OnInit {
  advancedChartData: ChartData<'line'> = {
    labels: ['10:00', '10:01', '10:02', '10:03', '10:04'],
    datasets: [
      {
        label: 'Log Events',
        data: [2, 3, 1, 4, 2],
        fill: true,
        tension: 0.5,
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0, 255, 204, 0.2)',
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ]
  };

  advancedChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {},
      y: { beginAtZero: true }
    }
  };

  constructor() {}

  ngOnInit(): void {}
}
