import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppToastService {
  toasts: any[] = [];

  show(header: string, body: string, className = '', delay: number = null): void {
    this.toasts.push({ header, body, className, delay });
  }

  remove(toast: any): void {
    this.toasts = this.toasts.filter((t) => t != toast);
  }
}
