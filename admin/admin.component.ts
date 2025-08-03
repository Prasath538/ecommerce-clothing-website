import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  orders: any[] = [];
  searchUsername: string = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders = res.data.map((order: any) => ({
            ...order,
            products: order.products.map((product: any) => ({
              ...product,
              price: product.price.toString().startsWith('$')
                ? product.price
                : `$${product.price}`,
            })),
          }));
        } else {
          console.error('Failed to load orders:', res.message);
        }
      },
      error: (err) => {
        console.error('Error loading orders:', err);
      },
    });
  }

  findOrders(): void {
    if (this.searchUsername.trim() === '') {
      this.loadAllOrders();
    } else {
      this.orderService.getOrdersByUsername(this.searchUsername).subscribe({
        next: (res) => {
          if (res.success) {
            this.orders = res.data.map((order: any) => ({
              ...order,
              products: order.products.map((product: any) => ({
                ...product,
                price: product.price.toString().startsWith('$')
                  ? product.price
                  : `$${product.price}`,
              })),
            }));
          } else {
            console.error('Failed to find orders:', res.message);
          }
        },
        error: (err) => {
          console.error('Error finding orders:', err);
        },
      });
    }
  }

  formatPrice(product: any): void {
    if (product.price && !product.price.startsWith('$')) {
      product.price = `$${product.price}`;
    }
  }

  updateOrder(order: any): void {
    const id = order._id;
    const updateData = {
      username: order.username,
      products: [
        {
          product: order.products[0].product,
          price: parseFloat(order.products[0].price.replace('$', '')),
          quantity: Number(order.products[0].quantity),
          subtotal: Number(order.products[0].subtotal),
        },
      ],
      shipping: Number(order.shipping),
      total: Number(order.total),
    };

    this.orderService.updateOrder(id, updateData).subscribe({
      next: (res) => {
        alert(res.message);
        this.loadAllOrders();
      },
      error: (err) => {
        console.error('Error updating order:', err);
        alert('Failed to update order');
      },
    });
  }

  deleteOrder(id: string): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: (res) => {
          alert(res.message);
          this.loadAllOrders();
        },
        error: (err) => {
          console.error('Error deleting order:', err);
          alert('Failed to delete order');
        },
      });
    }
  }
}