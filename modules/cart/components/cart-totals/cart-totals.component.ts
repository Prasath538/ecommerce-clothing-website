import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/shared/services/data.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-cart-totals',
  templateUrl: './cart-totals.component.html',
  styleUrls: ['./cart-totals.component.scss'],
})
export class CartTotalsComponent implements OnInit {
  public subtotal: number = 0;
  public shipping: number = 10;
  public total: number = 0;
  alertMessage: boolean = false;

  constructor(
    private router: Router,
    private dataService: DataService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subtotal = this.dataService.getTotalPrice();
    this.total = this.subtotal + this.shipping;
  }

  checkout(): void {
    if (this.dataService.cartItemList.length === 0) {
      alert('Cart is empty');
      return;
    }

    const username = this.authService.getUsername();
    const cartData = {
      username: username,
      products: this.dataService.cartItemList.map((item: any) => ({
        product: item.title,
        price: Number(item.price), // Store as number
        quantity: item.quantity,
        subtotal: item.total,
      })),
      shipping: this.shipping,
      total: this.total,
    };

    this.http.post('http://localhost:5000/api/checkout', cartData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertMessage = true;
          setTimeout(() => {
            this.dataService.removeAllCart();
            this.ngOnInit();
            this.alertMessage = false;
            this.router.navigate(['cart/empty-cart']);
          }, 2000);
        } else {
          alert('Checkout failed: ' + res.message);
        }
      },
      error: (err) => {
        console.error('Checkout error:', err);
        alert('Error during checkout');
      },
    });
  }
}