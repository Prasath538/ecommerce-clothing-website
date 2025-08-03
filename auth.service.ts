import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInStatus = false;
  private userRole: string = '';
  private username: string = '';

  login(role: string, username: string) {
    this.isLoggedInStatus = true;
    this.userRole = role;
    this.username = username;
  }

  logout() {
    this.isLoggedInStatus = false;
    this.userRole = '';
    this.username = '';
  }

  isLoggedIn(): boolean {
    return this.isLoggedInStatus;
  }

  getRole(): string {
    return this.userRole;
  }

  getUsername(): string {
    return this.username;
  }
}

