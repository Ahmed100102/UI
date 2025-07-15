import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  currentTime = new Date();
  currentRoute = 'Dashboard';
  
  constructor(private router: Router) {
    // Update time every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    // Track current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url)
    ).subscribe(url => {
      this.currentRoute = this.getRouteTitle(url);
    });
  }
  
  private getRouteTitle(url: string): string {
    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/analytics': 'Analytics',
      '/monitoring': 'Monitoring',
      '/logs': 'Logs',
      '/issues': 'Issues',
      '/ai-assistant': 'AI Assistant'
    };
    return routeMap[url] || 'Dashboard';
  }
}