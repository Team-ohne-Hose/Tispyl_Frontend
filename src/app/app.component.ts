import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {

  routes;

  constructor(public router: Router) {
    this.routes = router.config.filter(route => route.path !== '**' && route.path.length > 0);
  }
}
