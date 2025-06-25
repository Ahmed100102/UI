import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component'; // 👈 Vérifie le chemin

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent], // 👈 SidebarComponent bien importé
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {}
