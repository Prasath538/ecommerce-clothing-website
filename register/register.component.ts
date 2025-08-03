import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  username!: string;
  email!: string;
  phone!: string;
  password!: string;

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    // Validate all fields
    if (!this.username || !this.email || !this.phone || !this.password) {
      alert('All fields are required.');
      return;
    }

    if (!this.validateEmail(this.email)) {
      alert('Email must be a valid Gmail address (e.g., user@gmail.com).');
      return;
    }

    if (!this.validatePhone(this.phone)) {
      alert('Phone number must be a valid 10-digit Indian mobile number (e.g., 9876543210).');
      return;
    }

    if (!this.validatePassword(this.password)) {
      alert(
        'Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.'
      );
      return;
    }

    this.http
      .post('http://localhost:5000/api/register', {
        username: this.username,
        email: this.email,
        phone: this.phone,
        password: this.password,
      })
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Registration Successful');
            this.router.navigate(['/login']);
          } else {
            alert(response.message);
          }
        },
        error: (err) => {
          console.error('Registration error:', err);
          alert('Error during registration');
        },
      });
  }

  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return emailPattern.test(email);
  }

  validatePhone(phone: string): boolean {
    const phonePattern = /^[6-9]\d{9}$/;
    return phonePattern.test(phone);
  }

  validatePassword(password: string): boolean {
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  }
}