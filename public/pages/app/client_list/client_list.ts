import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
    selector: 'client-list',
    template: `
        <tr>
            <td>{{user.name}}</td>
            <td>{{user.sexe}}</td>
            <td>{{user.dob}}</td>
            <td>{{user.first_visit}}</td>
            <td>{{user.last_visit}}</td>
            <td (click)="sayHello()">NEW</td>
            <td (click)="sayHello()">EDIT</td>
            <td>DELETE</td>
        </tr>
   `
})
export class ClientList implements OnInit { 
    @Input() user: any;
    @Output() hello = new EventEmitter();
    constructor() {}
    ngOnInit(){
    }
    sayHello (e: any) {
        this.hello.next(this.user.id);
    }
}