import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MessageComponent} from '../message/message.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public  email:  string  =  "";
  public  password:  string  =  "";

  @Input() languageObjects: { };

  constructor(private  dialog:  MatDialog) { }
  login(){
    if(this.email  ===  "email@email.com"  &&  this.password  === "p@ssw0rd")
    {
      console.log("NICE")
    }
    else
    {
      this.dialog.open(MessageComponent,{ data: {
          message:  "Error!!!"
        }});
    }
  }

  ngOnInit(): void {
  }
}
