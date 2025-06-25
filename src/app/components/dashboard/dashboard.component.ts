import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../services/LogService';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgChartsModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  logs: any[] = [];
  filteredLogs: any[] = [];
  paginatedLogs: any[] = [];

  currentPage = 1;
  pageSize = 20;
  totalPages = 1;

  // Filtres
  selectedLevel: string = '';
  selectedPlatform: string = '';
  startDate: string = '';
  endDate: string = '';
  startTime: string = '';
  endTime: string = '';
  selectedTimestamp: string = '';

  availablePlatforms: string[] = ['VGM', 'Netprobe', 'FISCD'];

  selectedMessage: string = '';
  expandedRows: Set<number> = new Set();

  chartData: ChartData<'line', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Logs per hour',
      fill: false,
      tension: 0.4,
      borderColor: 'blue',
      backgroundColor: 'lightblue'
    }]
  };

  Math = Math;

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.logService.getAllLogsByIndex().subscribe(allLogs => {
      this.logs = allLogs.map((log: any) => ({
        ...log,
        level: log.level || log.log_level || 'unknown',
        message: log.message || log.log_message || 'No message provided',
        timestamp: log['@timestamp'] || log.timestamp || new Date().toISOString(),
        index: log._index || '',
        host: log.host || { name: 'N/A' }
      })).filter(log => !!log && !!log.level);

      this.prepareChartData();
      this.filteredLogs = [];
      this.totalPages = Math.ceil(this.logs.length / this.pageSize);
      this.setPaginatedLogs();
    });
  }

  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      // Filtre par niveau
      const matchesLevel = this.selectedLevel
        ? log.level.toLowerCase() === this.selectedLevel.toLowerCase()
        : true;

      // Filtre par plateforme
      const matchesPlatform = this.selectedPlatform
        ? (this.selectedPlatform === 'Netprobe' && log.index.includes('logstash-netprobe')) ||
          (this.selectedPlatform === 'VGM' && log.index.includes('logstash-vgm')) ||
          (this.selectedPlatform === 'FISCD' && log.index.includes('logstash-fiscd'))
        : true;

      // Filtre par recherche dans le timestamp
      const matchesTimestampSearch = this.selectedTimestamp
        ? log.timestamp.toLowerCase().includes(this.selectedTimestamp.toLowerCase())
        : true;

      // Filtre par date et heure
      const logDate = new Date(log.timestamp);
      
      // Validation de la date du log
      if (isNaN(logDate.getTime())) {
        return false;
      }

      // Filtre par date de début
      let matchesStartDate = true;
      if (this.startDate) {
        const startDateTime = new Date(this.startDate);
        if (this.startTime) {
          const [hours, minutes] = this.startTime.split(':');
          startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          startDateTime.setHours(0, 0, 0, 0);
        }
        matchesStartDate = logDate >= startDateTime;
      }

      // Filtre par date de fin
      let matchesEndDate = true;
      if (this.endDate) {
        const endDateTime = new Date(this.endDate);
        if (this.endTime) {
          const [hours, minutes] = this.endTime.split(':');
          endDateTime.setHours(parseInt(hours), parseInt(minutes), 59, 999);
        } else {
          endDateTime.setHours(23, 59, 59, 999);
        }
        matchesEndDate = logDate <= endDateTime;
      }

      return matchesLevel && matchesPlatform && matchesTimestampSearch && matchesStartDate && matchesEndDate;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredLogs.length / this.pageSize);
    this.setPaginatedLogs();
    this.updateChartWithFilteredData();
  }

  resetFilters(): void {
    this.selectedLevel = '';
    this.selectedPlatform = '';
    this.startDate = '';
    this.endDate = '';
    this.startTime = '';
    this.endTime = '';
    this.selectedTimestamp = '';
    this.filteredLogs = [];
    this.currentPage = 1;
    this.setPaginatedLogs();
    this.prepareChartData(); // Réinitialise le graphique avec toutes les données
  }

  prepareChartData(): void {
    const countByHour: { [hour: string]: number } = {};
    this.logs.forEach(log => {
      const date = new Date(log.timestamp);
      if (!isNaN(date.getTime())) {
        const hourLabel = `${date.getHours().toString().padStart(2, '0')}:00`;
        countByHour[hourLabel] = (countByHour[hourLabel] || 0) + 1;
      }
    });

    this.chartData.labels = Object.keys(countByHour).sort();
    this.chartData.datasets[0].data = this.chartData.labels.map(label => countByHour[label]);
  }

  updateChartWithFilteredData(): void {
    const dataToUse = this.filteredLogs.length > 0 ? this.filteredLogs : this.logs;
    const countByHour: { [hour: string]: number } = {};
    
    dataToUse.forEach(log => {
      const date = new Date(log.timestamp);
      if (!isNaN(date.getTime())) {
        const hourLabel = `${date.getHours().toString().padStart(2, '0')}:00`;
        countByHour[hourLabel] = (countByHour[hourLabel] || 0) + 1;
      }
    });

    this.chartData.labels = Object.keys(countByHour).sort();
    this.chartData.datasets[0].data = this.chartData.labels.map(label => countByHour[label]);
  }

  setPaginatedLogs(): void {
    const base = this.filteredLogs.length ? this.filteredLogs : this.logs;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedLogs = base.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.setPaginatedLogs();
    }
  }

  exportToExcel(): void {
    const base = this.filteredLogs.length ? this.filteredLogs : this.logs;

    const exportData = base.map(log => ({
      Level: log.level,
      Message: log.message,
      Timestamp: log.timestamp,
      Service: log.host?.name,
      Index: log.index
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { logs: worksheet },
      SheetNames: ['logs']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, `logs-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  showFullMessage(log: any): void {
    this.selectedMessage = log?.message || 'No message available';
    const modal = new (window as any).bootstrap.Modal(document.getElementById('messageModal'));
    modal.show();
  }

  toggleRow(index: number): void {
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index);
    } else {
      this.expandedRows.add(index);
    }
  }

  getLogLevelClass(log: any): string {
    if (!log || !log.level) return '';
    switch (log.level.toLowerCase()) {
      case 'error': return 'table-danger';
      case 'warn': return 'table-warning';
      case 'info': return 'table-info';
      case 'debug': return 'table-secondary';
      default: return '';
    }
  }

  // Méthodes utilitaires pour les filtres de temps
  clearStartTime(): void {
    this.startTime = '';
  }

  clearEndTime(): void {
    this.endTime = '';
  }

  // Méthode pour formater la date/heure pour l'affichage
  formatDateTime(timestamp: string): string {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}