import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignee: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  platform: string;
  tags: string[];
}

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssuesComponent implements OnInit {
  issues: Issue[] = [];
  filteredIssues: Issue[] = [];
  selectedSeverity: string = 'all';
  selectedStatus: string = 'all';
  selectedPlatform: string = 'all';
  searchTerm: string = '';
  
  // Statistics
  stats = {
    total: 0,
    critical: 0,
    open: 0,
    resolved: 0
  };

  ngOnInit() {
    this.loadIssues();
    this.calculateStats();
  }

  loadIssues() {
    // Mock data - replace with actual service call
    this.issues = this.generateMockIssues();
    this.applyFilters();
  }

  generateMockIssues(): Issue[] {
    const severities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];
    const statuses: ('open' | 'in-progress' | 'resolved' | 'closed')[] = ['open', 'in-progress', 'resolved', 'closed'];
    const platforms = ['fiscd', 'vgm', 'netprobe'];
    const assignees = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
    const reporters = ['System Monitor', 'User Report', 'Automated Check', 'Admin'];
    
    const issueTitles = [
      'Database connection timeout',
      'Memory leak in payment service',
      'API rate limiting not working',
      'Authentication service down',
      'High CPU usage detected',
      'Disk space running low',
      'SSL certificate expiring soon',
      'Backup process failed',
      'Network connectivity issues',
      'Cache invalidation problems'
    ];

    const issues: Issue[] = [];
    for (let i = 0; i < 50; i++) {
      const createdDate = new Date();
      createdDate.setHours(createdDate.getHours() - i * 2);
      
      const updatedDate = new Date(createdDate);
      updatedDate.setMinutes(updatedDate.getMinutes() + Math.random() * 120);
      
      issues.push({
        id: `ISS-${1000 + i}`,
        title: issueTitles[Math.floor(Math.random() * issueTitles.length)],
        description: `Detailed description of issue ${i + 1}. This issue requires immediate attention and investigation.`,
        severity: severities[Math.floor(Math.random() * severities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        assignee: assignees[Math.floor(Math.random() * assignees.length)],
        reporter: reporters[Math.floor(Math.random() * reporters.length)],
        createdAt: createdDate.toISOString(),
        updatedAt: updatedDate.toISOString(),
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        tags: ['bug', 'performance', 'security'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }
    return issues;
  }

  applyFilters() {
    this.filteredIssues = this.issues.filter(issue => {
      const severityMatch = this.selectedSeverity === 'all' || issue.severity === this.selectedSeverity;
      const statusMatch = this.selectedStatus === 'all' || issue.status === this.selectedStatus;
      const platformMatch = this.selectedPlatform === 'all' || issue.platform === this.selectedPlatform;
      const searchMatch = this.searchTerm === '' || 
        issue.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        issue.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return severityMatch && statusMatch && platformMatch && searchMatch;
    });
    
    this.calculateStats();
  }

  calculateStats() {
    this.stats.total = this.filteredIssues.length;
    this.stats.critical = this.filteredIssues.filter(i => i.severity === 'critical').length;
    this.stats.open = this.filteredIssues.filter(i => i.status === 'open').length;
    this.stats.resolved = this.filteredIssues.filter(i => i.status === 'resolved').length;
  }

  onFilterChange() {
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  }

  exportIssues() {
    const dataStr = JSON.stringify(this.filteredIssues, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `issues-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}