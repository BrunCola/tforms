import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';

@Component({
    selector: 'calendar-pop-up',
    styleUrls: ['./popup.component.css'],
    templateUrl: './popup.component.html',
})
export class PopupComponent implements OnInit { 
    @Input() new_app: any;
    @Output() close_popup = new EventEmitter();
    
    constructor() {}
    ngOnInit(){
        console.log(this.new_app)
    }
    // ngOnChanges(){
    //     console.log("ngOnChanges")
    //     console.log(this.new_app)
    // }
    close(event:any) {
        this.close_popup.next(this.new_app)
    }
    cancel(event:any) {
        this.new_app.duration = 0;
        this.close_popup.next(this.new_app)
    }
}