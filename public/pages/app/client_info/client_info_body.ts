import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'client-info',
  template: `
    <div>
      <span>{{client}}</span>
    </div>
  `
})
export class ClientInfo implements OnInit { 
    @Input() client: any;
    // @Output() hello = new EventEmitter();
    constructor() {}
    ngOnInit(){
      // console.log(this.client)
    }
}