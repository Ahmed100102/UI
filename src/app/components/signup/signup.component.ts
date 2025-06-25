import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  result: string = "";

  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
  });

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['user']);
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const { email, password, firstName, lastName } = this.signupForm.value;

      this.authService.register({ email, password, firstName, lastName }).subscribe({
        next: () => {
          // ✅ Redirection vers la page de login après inscription
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Signup failed:', err);
          if (err.status === 409 && err.error?.error?.includes('Email already in use')) {
            this.result = 'Cet email est déjà utilisé.';
          } else {
            this.result = 'Erreur lors de l’inscription. Veuillez réessayer.';
          }
        }
      });
    }
  }
}
