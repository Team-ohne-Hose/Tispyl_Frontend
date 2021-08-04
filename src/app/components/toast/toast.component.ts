import { Component } from '@angular/core';
import { AppToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toasts',
  templateUrl: './toast.component.html',
  styles: ['./toast.component.css'],
})
export class AppToastsComponent {
  constructor(public toastService: AppToastService) {}
}
