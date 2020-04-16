import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css']
})
export class InterfaceComponent implements OnInit {

  routes;

  constructor(private router: Router) {
    this.routes = router.config.filter( route => route.path !== '**' && route.path.length > 0);
  }

  ngOnInit(): void {
  }

}
