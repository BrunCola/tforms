import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';


// <input required id="email" type="email" name="email" placeholder="Email" class="m-wrap placeholder-no-fix" ng-model="login.user.email" autofocus="autofocus"/>
// <input required id="password" type="password" name="password" placeholder="Password" class="m-wrap placeholder-no-fixcommon/auth" ng-model="login.user.password"/>

@Component({
    selector: 'login-form',
    template: `
        <form>    
            <div>
                <label>Email</label>
                <input type="text" name="email" [(ngModel)]="login_user.email">
            </div>
            <div>
                <label>Password</label>
                <input type="password" name="passord" [(ngModel)]="login_user.passord">
            </div>
            <button type="submit" (click)="checkUser()">Login</button>
        </form>
  `
})
export class Login implements OnInit { 
    public login_user:any;
    // @Input() name: any;
    @Output() check_login = new EventEmitter();
    constructor() {}
    ngOnInit(){
        this.login_user = {
            email: '',
            passord: '',
        }
    }

    checkUser (e: any) {
        this.check_login.next(this.login_user);
    }
}