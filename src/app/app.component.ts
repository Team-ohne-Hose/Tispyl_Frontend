import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  routes;

  constructor (public router: Router) {
    this.routes = router.config.filter( route => route.path !== '**' && route.path.length > 0);
  }

  ngOnInit(): void {
  }
}
