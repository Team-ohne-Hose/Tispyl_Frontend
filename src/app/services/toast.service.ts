import { Injectable } from '@angular/core';

interface Toast {
  header: string;
  body: string;
  className: string;
  delay: number | null;
}

@Injectable({ providedIn: 'root' })
export class AppToastService {
  toasts: Toast[] = [];

  show(header: string, body: string, className = '', delay: number = null): void {
    this.toasts.push({ header, body, className, delay });
  }

  remove(toast: Toast): void {
    this.toasts = this.toasts.filter((t) => t != toast);
  }
}
