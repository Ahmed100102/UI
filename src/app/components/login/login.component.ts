import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.redirectUser();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value as {
        email: string;
        password: string;
      };

      this.authService.authenticate({ email, password }).subscribe({
        next: (response) => {
          this.authService.setToken(response.token);
          this.redirectUser();
        },
        error: () => {
          this.errorMessage = 'Invalid credentials. Please try again.';
        },
      });
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
  }

  private redirectUser(): void {
    const roles = this.authService.getRoles();
    if (roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/user']);
    }
  }
}
