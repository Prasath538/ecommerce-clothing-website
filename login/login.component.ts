import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username!: string;
  password!: string;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  login() {
    this.http.post('http://localhost:5000/api/login', {
      username: this.username,
      password: this.password
    }).subscribe((response: any) => {
      if (response.success) {
        this.authService.login(response.role, this.username); // Include username here
        if (response.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        alert(response.message);
      }
    });
  }
}
