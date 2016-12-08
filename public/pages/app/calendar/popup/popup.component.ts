import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';

@Component({
    selector: 'calendar-pop-up',
    styleUrls: ['./popup.component.scss'],
    templateUrl: './popup.component.html',
})
export class PopupComponent implements OnInit { 
    @Input() new_appointment: any;
    assessment_durations:any = [
        {duration: 3, text:"30 mins", price: "$50.00"},
        {duration: 4, text:"45 mins", price: "$75.00"},
        {duration: 5, text:"60 mins", price: "$90.00"},
        {duration: 7, text:"90 mins", price: "$120.00"}
    ];
    prices:any = {
        "3" : "$50.00",
        "4" : "$75.00",
        "5" : "$90.00",
        "7" : "$120.00",
    }
    appointment_type:any = [
        {type: "massage", text:"Registered Massage Therapy"},
    ];
    date = new Date();
    repeats: any = ["daily", "weekly", "monthly", "yearly"];
    day_names: any = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    months_names:any  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    @Output() close_popup = new EventEmitter();
    
    constructor() {}
    ngOnInit(){

        let d = this.new_appointment.date_selected.split("_");
        this.date = new Date(d[2], d[1], d[0], this.new_appointment.hour,this.new_appointment.time.split("_")[1]);
        console.log(this.new_appointment)
    }
    // ngOnChanges(){
    //     console.log("ngOnChanges")
    //     console.log(this.new_appointment)
    // }
    close(event:any) {
        this.close_popup.next(this.new_appointment)
    }
    cancel(event:any) {
        this.new_appointment.duration = 0;
        this.close_popup.next(this.new_appointment)
    }
    getDate() {
        return this.day_names[this.date.getDay()]+", "+this.months_names[this.date.getMonth()]+" "+ this.date.getDate()+", "+this.date.getFullYear();
    }
    getStartTime() {
      var hours = this.date.getHours();
      var minutes:any = this.date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      if (minutes == 0) {
          minutes = "00";
      }
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }
    getEndTime() {
      var newDateObj = new Date(this.date.getTime() + ((this.new_appointment.duration*15)*60000));
      var hours = newDateObj.getHours();
      var minutes:any  = newDateObj.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      if (minutes == 0) {
          minutes = "00";
      }
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }
    getPrice() {
        if (this.new_appointment.obj.initial) {
            return "$120.00"
        }
        return this.prices[this.new_appointment.duration] ? this.prices[this.new_appointment.duration] : "$ Price not set yet $";
    }
}