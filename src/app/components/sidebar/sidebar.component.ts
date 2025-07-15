import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isCollapsed = false;
  
  menuItems: MenuItem[] = [
    {
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      route: '/dashboard'
    },
    {
      icon: 'fas fa-chart-line',
      label: 'Analytics',
      route: '/analytics',
      badge: 'New'
    },
    {
      icon: 'fas fa-desktop',
      label: 'Monitoring',
      route: '/monitoring'
    },
    {
      icon: 'fas fa-list-alt',
      label: 'Logs',
      route: '/logs'
    },
    {
      icon: 'fas fa-exclamation-triangle',
      label: 'Issues',
      route: '/issues',
      badge: '12'
    },
    {
      icon: 'fas fa-robot',
      label: 'AI Assistant',
      route: '/ai-assistant'
    }
  ];
  
  constructor(private router: Router) {}
  
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}