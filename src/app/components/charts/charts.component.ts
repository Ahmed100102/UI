import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartData } from 'chart.js';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { Router } from '@angular/router';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent
} from '@coreui/angular';
import { LogService } from '../../services/LogService';

@Component({
  selector: 'app-charts',
  standalone: true,
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ChartjsComponent
  ]
})
export class ChartsComponent implements OnInit {
  logs: any[] = [];
  filteredLogs: any[] = [];
  selectedPlatform: string = 'all';
  
  // Filtres temporels
  startDate: string = '';
  endDate: string = '';
  startTime: string = '00:00';
  endTime: string = '23:59';

  options = {
    maintainAspectRatio: false,
    responsive: true
  };

  chartBarData: ChartData = { labels: [], datasets: [] };
  chartPieData: ChartData = {
    labels: ['ERROR', 'WARNING', 'INFO'],
    datasets: [{ data: [], backgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'] }]
  };

  topErrorMessages: { message: string; count: number; timestamp: string; expanded?: boolean }[] = [];

  constructor(private logService: LogService, private router: Router) {
    // Initialiser les dates par défaut (7 derniers jours)
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = weekAgo.toISOString().split('T')[0];
  }
  
  

  ngOnInit(): void {
    this.loadLogs();
  }

  private loadLogs(): void {
    this.logService.getPlatformLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.applyFilters();
        this.updateCharts();
      },
      error: (err) => console.error('Erreur lors du chargement des logs :', err)
    });
  }

  onPlatformChange(): void {
    this.applyFilters();
    this.updateCharts();
  }

  onDateFilterChange(): void {
    this.applyFilters();
    this.updateCharts();
  }

  clearDateFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.startTime = '00:00';
    this.endTime = '23:59';
    this.onDateFilterChange();
  }

  private applyFilters(): void {
    let filtered = this.logs;

    // Filtre par plateforme
    if (this.selectedPlatform !== 'all') {
      filtered = filtered.filter(log =>
        log.source?.toLowerCase() === this.selectedPlatform.toLowerCase()
      );
    }

    // Filtre par période
    if (this.startDate || this.endDate) {
      filtered = filtered.filter(log => {
        const rawTimestamp = log.timestamp || log['@timestamp'];
        if (!rawTimestamp) return false;

        const logDate = new Date(rawTimestamp);
        if (isNaN(logDate.getTime())) return false;

        // Construction des timestamps de début et fin
        let startTimestamp: Date | null = null;
        let endTimestamp: Date | null = null;

        if (this.startDate) {
          startTimestamp = new Date(`${this.startDate}T${this.startTime}:00`);
        }

        if (this.endDate) {
          endTimestamp = new Date(`${this.endDate}T${this.endTime}:59`);
        }

        // Vérification des conditions de filtre
        if (startTimestamp && endTimestamp) {
          return logDate >= startTimestamp && logDate <= endTimestamp;
        } else if (startTimestamp) {
          return logDate >= startTimestamp;
        } else if (endTimestamp) {
          return logDate <= endTimestamp;
        }

        return true;
      });
    }

    this.filteredLogs = filtered;
  }

  private updateCharts(): void {
    const levelCounts = { ERROR: 0, WARNING: 0, INFO: 0 };
    const errorMap: { [key: string]: { count: number; timestamp: string } } = {};
    const volumeByDate: { [date: string]: number } = {};

    this.filteredLogs.forEach(log => {
      const level = log.level || log.log_level || 'INFO';
      const rawTimestamp = log.timestamp || log['@timestamp'];
      const date = new Date(rawTimestamp);

      if (!isNaN(date.getTime())) {
        const formatted = date.toLocaleDateString('fr-FR');
        volumeByDate[formatted] = (volumeByDate[formatted] || 0) + 1;
      }

      // Normalisation des niveaux de log
      let normalizedLevel = level.toUpperCase();
      if (normalizedLevel === 'WARN') normalizedLevel = 'WARNING';
      
      if (levelCounts[normalizedLevel as keyof typeof levelCounts] !== undefined) {
        levelCounts[normalizedLevel as keyof typeof levelCounts]++;
      } else if (normalizedLevel.includes('ERROR')) {
        levelCounts.ERROR++;
      } else if (normalizedLevel.includes('WARN')) {
        levelCounts.WARNING++;
      } else {
        levelCounts.INFO++;
      }

      // Collecte des messages d'erreur
      if (normalizedLevel === 'ERROR' || normalizedLevel.includes('ERROR')) {
        const message = log.message || log.log_message || log.error_message || log.description;
        if (message) {
          const key = message.substring(0, 200); // Limiter la longueur pour le regroupement
          if (!errorMap[key]) {
            errorMap[key] = { count: 1, timestamp: rawTimestamp };
          } else {
            errorMap[key].count++;
            // Garder le timestamp le plus récent
            if (new Date(rawTimestamp) > new Date(errorMap[key].timestamp)) {
              errorMap[key].timestamp = rawTimestamp;
            }
          }
        }
      }
    });

    // Tri des dates pour les graphiques
    const labels = Object.keys(volumeByDate).sort((a, b) => {
      return new Date(a.split('/').reverse().join('-')).getTime() - 
             new Date(b.split('/').reverse().join('-')).getTime();
    });
    const data = labels.map(label => volumeByDate[label]);

    // Mise à jour des données du graphique en barres
    this.chartBarData = {
      labels,
      datasets: [{
        label: 'Volume de logs par jour',
        backgroundColor: '#f87979',
        borderColor: '#f87979',
        data
      }]
    };

    this.chartPieData.datasets[0].data = [
      levelCounts.ERROR,
      levelCounts.WARNING,
      levelCounts.INFO
    ];

    // Top 5 des messages d'erreur
    this.topErrorMessages = Object.entries(errorMap)
      .map(([message, info]) => ({
        message,
        count: info.count,
        timestamp: new Date(info.timestamp).toLocaleString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        expanded: false
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  toggleExpand(error: any): void {
    error.expanded = !error.expanded;
  }

  // Méthodes utilitaires pour l'interface
  getTotalLogs(): number {
    return this.filteredLogs.length;
  }

  getErrorCount(): number {
    return this.filteredLogs.filter(log => {
      const level = (log.level || log.log_level || '').toUpperCase();
      return level === 'ERROR' || level.includes('ERROR');
    }).length;
  }

  getWarningCount(): number {
    return this.filteredLogs.filter(log => {
      const level = (log.level || log.log_level || '').toUpperCase();
      return level === 'WARNING' || level === 'WARN' || level.includes('WARN');
    }).length;
  }

  // Nouvelles méthodes pour le KPI Error Rate
  getErrorRate(): number {
    const total = this.getTotalLogs();
    if (total === 0) return 0;
    const errors = this.getErrorCount();
    return Math.round((errors / total) * 100 * 100) / 100; // Arrondi à 2 décimales
  }

  getErrorRateClass(): string {
    const rate = this.getErrorRate();
    if (rate >= 10) return 'text-danger';
    if (rate >= 5) return 'text-warning';
    return 'text-success';
  }

  exportData(): void {
    const dataStr = JSON.stringify(this.filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `logs_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Nouvelles méthodes de navigation
  navigateToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }

  navigateToErrorDashboard(): void {
    this.router.navigate(['/user/dynamic-dashboard']);
  }
}