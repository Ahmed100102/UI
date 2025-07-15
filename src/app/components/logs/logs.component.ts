import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  platform: string;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  selectedLevel: string = 'all';
  selectedPlatform: string = 'all';
  searchTerm: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 50;
  totalPages: number = 1;

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    // Mock data - replace with actual service call
    this.logs = this.generateMockLogs();
    this.applyFilters();
  }

  generateMockLogs(): LogEntry[] {
    const levels: ('info' | 'warning' | 'error' | 'debug')[] = ['info', 'warning', 'error', 'debug'];
    const platforms = ['fiscd', 'vgm', 'netprobe'];
    const sources = ['auth-service', 'payment-service', 'user-service', 'notification-service'];
    const messages = [
      'User authentication successful',
      'Payment processing completed',
      'Database connection timeout',
      'Memory usage threshold exceeded',
      'API rate limit reached',
      'Service health check passed',
      'Configuration updated',
      'Backup process started'
    ];

    const logs: LogEntry[] = [];
    for (let i = 0; i < 500; i++) {
      const date = new Date();
      date.setMinutes(date.getMinutes() - i * 2);
      
      logs.push({
        id: `log-${i}`,
        timestamp: date.toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        platform: platforms[Math.floor(Math.random() * platforms.length)]
      });
    }
    return logs;
  }

  applyFilters() {
    this.filteredLogs = this.logs.filter(log => {
      const levelMatch = this.selectedLevel === 'all' || log.level === this.selectedLevel;
      const platformMatch = this.selectedPlatform === 'all' || log.platform === this.selectedPlatform;
      const searchMatch = this.searchTerm === '' || 
        log.message.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return levelMatch && platformMatch && searchMatch;
    });
    
    this.totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onFilterChange() {
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  getPaginatedLogs(): LogEntry[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredLogs.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getLogLevelClass(level: string): string {
    switch (level) {
      case 'error': return 'log-error';
      case 'warning': return 'log-warning';
      case 'info': return 'log-info';
      case 'debug': return 'log-debug';
      default: return '';
    }
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  exportLogs() {
    const dataStr = JSON.stringify(this.filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}