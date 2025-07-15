import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  
  {
    path: 'analytics',
    loadComponent: () =>
      import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  
  {
    path: 'monitoring',
    loadComponent: () =>
      import('./components/monitoring/monitoring.component').then(m => m.MonitoringComponent)
  },
  
  {
    path: 'logs',
    loadComponent: () =>
      import('./components/logs/logs.component').then(m => m.LogsComponent)
  },
  
  {
    path: 'issues',
    loadComponent: () =>
      import('./components/issues/issues.component').then(m => m.IssuesComponent)
  },
  
  {
    path: 'ai-assistant',
    loadComponent: () =>
      import('./components/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent)
  },
  
  { path: '**', redirectTo: '/dashboard' }
];