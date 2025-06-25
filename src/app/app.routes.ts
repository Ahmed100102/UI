import { Routes } from '@angular/router';
import { SigninComponent } from './components/signin/signin.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { UserComponent } from './components/user/user.component';
import { AdminComponent } from './components/admin/admin.component';
import { UserHomeComponent } from './components/user/user-home/user-home.component';
import { AdminHomeComponent } from './components/admin/admin-home/admin-home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./components/signup/signup.component').then(m => m.SignupComponent),
  },

  { path: 'signin', component: SigninComponent },

  {
    path: 'user',
    component: UserComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: UserHomeComponent },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'advanced-dashboard',
        loadComponent: () =>
          import('./components/advanced-dashboard/advanced-dashboard.component').then(m => m.AdvancedDashboardComponent)
      },
      {
        path: 'dashboard-pro',
        loadComponent: () =>
          import('./components/dashboard-pro/dashboard-pro.component').then(m => m.DashboardProComponent)
      },
      {
        path: 'monitoring',
        loadComponent: () =>
          import('./components/monitoring-board/monitoring-board.component').then(m => m.MonitoringBoardComponent)
      },
      {
        path: 'dynamic-dashboard',
        loadComponent: () =>
          import('./components/dynamic-dashboard/dynamic-dashboard.component').then(m => m.DynamicDashboardComponent)
      },
      {
        path: 'chatbot',
        loadComponent: () =>
          import('./components/chatbot/chatbot.component').then(m => m.ChatbotComponent)
      },
      {
        path: 'log-dashboard',
        loadComponent: () =>
          import('./components/log-dashboard/log-dashboard.component').then(m => m.LogDashboardComponent)
      },
      {
        path: 'log-analysis',
        loadComponent: () =>
          import('./components/log-analysis/log-analysis.component').then(m => m.LogAnalysisComponent)
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./components/chat/chat.component').then(m => m.ChatComponent)
      },
      {
        path: 'index-observix',
        loadComponent: () =>
          import('./components/index-observix/index-observix.component').then(m => m.IndexObservixComponent)
      },
      {
        path: 'issues',
        loadComponent: () =>
          import('./components/issues/issues.component').then(m => m.IssuesComponent)
      },
      {
        path: 'charts',
        loadComponent: () =>
          import('./components/charts/charts.component').then(m => m.ChartsComponent)
      }
    ]
  },

  {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AdminHomeComponent },
    ],
  },

  { path: '**', component: NotfoundComponent }
];
