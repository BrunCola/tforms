import { Component, OnInit, Inject } from '@angular/core';
import { LoginService } from './login.service';
import { Headers } from '@angular/http';
import { Router } from '@angular/router';

@Component({
  // selector: 'client-info',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [{ provide: Window, useValue: window }]
})
export class LoginComponent implements OnInit { 
    errorMessage: any;
    headers: any = new Headers();
    constructor(
        private loginService: LoginService, 
        private router: Router,
        @Inject(Window) private window: Window
    ) {}
    ngOnInit(){}
    
    userChecked(user:any){
        this.loginService.checkUserLogin(user).subscribe((result) => {
            if (result) {
                this.window.sessionStorage['token'] = sessionStorage.getItem('token');
                this.router.navigate(['']);
            }
        });        
    }
}