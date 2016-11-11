import { Component, Inject, OnInit, HostListener, EventEmitter, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import { cloneDeep, indexOf } from "lodash";

// import { ClientListService } from './client_list.service';

@Component({
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    providers: [ 
        { provide: "Window", useValue: window},
        { provide: "Document", useValue: document},
    ]
})
export class CalendarComponent implements OnInit {
    calendar_year_days = new Date().getFullYear() % 4 == 0 ? 366 : 365;
    current_date = new Date();
    current_year: any;
    current_month: any;
    current_day: any;
    current_full_week:any;
    rest_of_last_month: any = [];
    current_full_month:any;
    start_of_next_month: any = [];
    appointments: any = {};
    current_full_year:any;
    day_slots_div:any;
    mouse_event: any = {};
    new_appointment: any = {};
    show_popup: boolean = false;
    slot_num: number = 0;
    assessment_durations:any = [
        {duration: 3, text:"30 mins"},
        {duration: 4, text:"45 mins"},
        {duration: 5, text:"60 mins"},
        {duration: 7, text:"90 mins"}
    ];
    slots: any = ["00","15","30","45"];
    time_slots: any = ["5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm"];
    day_names: any = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    days: any = [];
    months_names_short:any  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    months_names:any  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    constructor(
        @Inject('Window') private window:any,
        @Inject('Document') private document:any
    ){}
    ngOnInit () {
        this.current_day = this.current_date.getDate();
        this.current_month = this.current_date.getMonth();
        this.current_year = this.current_date.getFullYear();

        this.appointments = {
            "6_10_2016": {
                "5am_00" : {
                    "duration" : 1,
                    "obj" : {}
                },
            },
            "7_10_2016": {
                "5am_00" : {
                    "duration" : 2,
                    "obj" : {}
                },
                "5am_30" : {
                    "duration" : 2,
                    "obj" : {}
                },
            },
            "8_10_2016": {
                "5am_00": {
                    "duration" : 3,
                    "obj" : {}
                },
            },
            "9_10_2016":{
                "5am_00": {
                    "duration" : 4,
                    "obj" : {}
                },
            },
            "10_10_2016": {
                "5am_00": {
                    "duration" : 5,
                    "obj" : {}
                },
            },
            "11_10_2016": {
                "5am_00": {
                    "duration" : 6,
                    "obj" : {}
                },
            },
            "12_10_2016": {
                "5am_00": {
                    "duration" : 7,
                    "obj" : {}
                },
            },
        }
        // this.appointments = {
        //     "6_10_2016": {
        //         "5am_00" : {
        //             "duration" : 1,
        //             "obj" : {}
        //         },
        //     },
        //     "7_10_2016": {
        //         "5am_00" : {
        //             "duration" : 2,
        //             "obj" : {}
        //         },
        //         "5am_45" : {
        //             "duration" : 4,
        //             "obj" : {}
        //         },
        //         "7am_45": {
        //             "duration" : 3,
        //             "obj" : {}
        //         }
        //     },
        //     "8_10_2016": {
        //         "5am_00": {
        //             "duration" : 3,
        //             "obj" : {}
        //         },
        //     },
        //     "9_10_2016":{
        //         "5am_00": {
        //             "duration" : 4,
        //             "obj" : {}
        //         },
        //         "12pm_30": {
        //             "duration" : 5,
        //             "obj" : {}
        //         },
        //     },
        //     "10_10_2016": {
        //         "5am_00": {
        //             "duration" : 5,
        //             "obj" : {}
        //         },
        //         "7am_00": {
        //             "duration" : 7,
        //             "obj" : {}
        //         },
        //         "8am_45": {
        //             "duration" : 3,
        //             "obj" : {}
        //         },
        //     },
        //     "11_10_2016": {
        //         "5am_00": {
        //             "duration" : 6,
        //             "obj" : {}
        //         },
        //         "6am_45": {
        //             "duration" : 5,
        //             "obj" : {}
        //         }
        //     },
        //     "12_10_2016": {
        //         "5am_00": {
        //             "duration" : 7,
        //             "obj" : {}
        //         },
        //     },
        // }

        this.day_slots_div = this.document.getElementById("daySlots");
        this.day_slots_div.onmousedown = this.mousedown.bind(this);
        this.day_slots_div.onmousemove = this.mousemove.bind(this);
        this.day_slots_div.onmouseup = this.mouseup.bind(this);
        this.day_slots_div.onmouseout = this.mouseout.bind(this);

        // this.getMonthArray(0);
        // this.getWeekArray(0);
        this.getYearArray(0,true);
        this.resetMouseEvent();

    }
    getYearArray(value:number, getrest:boolean){
        let date = cloneDeep(this.current_date);
        let new_date = new Date(date.getFullYear() + value, date.getMonth()+1, 0);

        // doing this check just for feb 29 day
        var days_of_month = new Date(new_date.getFullYear(), new_date.getMonth()+1, 0).getDate();
        let day = date.getDate();
        if (day > days_of_month) day = days_of_month; 

        new_date = new Date(date.getFullYear() + value, date.getMonth(), day);

        var year = this.current_date.getFullYear();
        let alter_date = new Date(year,0), i:number, full_year:any = [],temp_date:any;
        full_year.push(cloneDeep(alter_date));
        for (i = 0; i < this.calendar_year_days-1; i++) {
            temp_date = new Date(alter_date.setDate(alter_date.getDate() + 1));
            full_year.push(temp_date);
        }
        this.current_full_year = full_year;
        this.current_year = new_date.getFullYear();
        this.setCurrentDates(new_date);
        if (getrest) {
            this.getMonthArray(0, true);
        }
    }
    getMonthArray(value:number, getrest:boolean){
        let date = cloneDeep(this.current_date);
        let month = new Date(date.getFullYear(), date.getMonth()+value);
        var days_of_month = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();

        let day = date.getDate();
        if (day > days_of_month) day = days_of_month;
        let set_day = cloneDeep(new Date(month.getFullYear(), month.getMonth(), day));

        let full_month:any = [], i:number, temp_date: any;
        
        for(i = 1; i <= days_of_month; i++) {
            temp_date = new Date(month.getFullYear(), month.getMonth(), i);
            full_month.push(temp_date)
        }
        this.current_full_month = full_month;
        this.current_month = set_day.getMonth();
        this.setCurrentDates(set_day);
        this.getBeforeAfterMonthArray();
        if (getrest) {
            this.getWeekArray(0);
        }
    }
    getWeekArray(value: number){
        let date = cloneDeep(this.current_date);
        var new_date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + value);
        let set_date = cloneDeep(new_date);
        let full_week:any = [], i:number, dayday:any;
        for (i = 0; i < 7; i++) {
            dayday = new Date(new_date.setDate((new_date.getDate() - new_date.getDay()) + i));
            full_week.push(dayday)
        }
        this.days = full_week;
        this.setCurrentDates(set_date);
    }
    getBeforeAfterMonthArray() {
        let date = cloneDeep(this.current_date);
        let first_day = new Date(date.getFullYear(), date.getMonth());
        var lastDay = new Date(first_day.getFullYear(), first_day.getMonth()+1, 0);

        let r_o_l_m:any = [], i:number, temp_date:any, prev: number = first_day.getDay();
        for (i = 0; i < prev; i++) {
            temp_date = new Date(first_day.setDate((first_day.getDate() - first_day.getDay()) + i));
            r_o_l_m.push(temp_date)
        }
        this.rest_of_last_month = r_o_l_m;

        let s_o_n_m:any = [], j:number, start:number = lastDay.getDay()+1;
        for(j = start; j < 7; j++){
            temp_date = new Date(lastDay.setDate((lastDay.getDate() - lastDay.getDay()) + j));
            s_o_n_m.push(temp_date)
        }
        this.start_of_next_month = s_o_n_m;
    }
    checkIfCurrentDay(date: Date){
        return ((date.getFullYear() === this.current_date.getFullYear()) &&
            (date.getMonth() === this.current_date.getMonth()) &&
            (date.getDate() === this.current_date.getDate()));
    }
    getToday () {
        let date = cloneDeep(new Date());
        this.setCurrentDates(date);
        this.getWeekArray(0);
    }
    setDate (date:Date) {
        this.current_date = cloneDeep(date);
        this.getWeekArray(0);
    }
    setCurrentDates(date: Date) {
        this.calendar_year_days = date.getFullYear() % 4 == 0 ? 366 : 365;
        let refresh_year = false, refresh_month = false;
        if (this.current_year !== date.getFullYear()) refresh_year = true;
        if (this.current_month !== date.getMonth()) refresh_month = true;
        this.current_date = cloneDeep(date);
        this.current_month = this.current_date.getMonth();
        this.current_year = this.current_date.getFullYear();
        if (refresh_year) this.getYearArray(0, true);
        if (refresh_month) this.getMonthArray(0, false);
    }
    resetMouseEvent() {
        this.mouse_event = {
            down : false,
            startY : 0,
            date_selected : "",
            time : "",
            time_slot : "",
            min : 1,
            max : 50,
        }
    }
    mousedown(event:any) {
        event.preventDefault();
        this.mouse_event.down = true;
        this.mouse_event.startY = event.pageY;
   
        if (event.target.offsetParent.id) {
            this.mouse_event.date_selected = event.target.offsetParent.id.split("-")[0];
            this.mouse_event.time = event.target.offsetParent.id.split("-")[1];
            this.mouse_event.time_slot = event.target.classList[1].split("-")[1];
            this.getMinMaxSlot();
            if (!this.appointments[this.mouse_event.date_selected]) {
                this.appointments[this.mouse_event.date_selected] = {}
            }
            this.appointments[this.mouse_event.date_selected][this.mouse_event.time+"_"+this.mouse_event.time_slot] = {
                "duration" : 1,
                "obj" : {}
            }
        } else {
            this.mouse_event.down = false;
        }
    }
    mousemove(event:any) {
        event.preventDefault();
        if (this.mouse_event.down) {
            this.appointments[this.mouse_event.date_selected][this.mouse_event.time+"_"+this.mouse_event.time_slot].duration = (Math.max(this.mouse_event.min,Math.min(Math.round((event.pageY-this.mouse_event.startY) / this.document.getElementsByClassName("slot")[0].clientHeight)+1,this.mouse_event.max)));
            // this.appointments[this.mouse_event.date_selected][this.mouse_event.time+"_"+this.mouse_event.time_slot].duration = Math.round((event.pageY-this.mouse_event.startY) / this.document.getElementsByClassName("slot")[0].clientHeight)+1;
        }
    }
    mouseup(event:any) {
        event.preventDefault();
        if (this.mouse_event.down) {
            this.appointments[this.mouse_event.date_selected][this.mouse_event.time+"_"+this.mouse_event.time_slot].date_selected = this.mouse_event.date_selected;
            this.appointments[this.mouse_event.date_selected][this.mouse_event.time+"_"+this.mouse_event.time_slot].time = this.mouse_event.time+"_"+this.mouse_event.time_slot;
            this.new_appointment = this.appointments[this.mouse_event.date_selected][this.mouse_event.time+"_"+this.mouse_event.time_slot]
            this.show_popup = true;
        }
        this.resetMouseEvent();
    }
    mouseout(event:any) {
        event.preventDefault();
        if (this.mouse_event.down) {
            if ((indexOf(event.toElement.classList, 'appointment') === -1) && (indexOf(event.toElement.classList, 'slot') === -1) ) {
                this.appointments[this.mouse_event.date_selected][this.mouse_event.time+"_"+this.mouse_event.time_slot].date_selected = this.mouse_event.date_selected;
                this.appointments[this.mouse_event.date_selected][this.mouse_event.time+"_"+this.mouse_event.time_slot].time = this.mouse_event.time+"_"+this.mouse_event.time_slot;
                this.new_appointment = this.appointments[this.mouse_event.date_selected][this.mouse_event.time+"_"+this.mouse_event.time_slot]
                this.show_popup = true;
                this.resetMouseEvent();

            }
        }
    }
    getMinMaxSlot(){
        let time_slots_taken: any = [];
        if (this.appointments[this.mouse_event.date_selected]) {
            for (let a in this.appointments[this.mouse_event.date_selected]) {
                time_slots_taken.push(a)
            }
        }
        let t: any, s: any;
        let count: any = -1;
        let passed: boolean = false;
        for (t in this.time_slots) {
            for (s in this.slots) {
                if (this.mouse_event.time+"_"+this.mouse_event.time_slot === this.time_slots[t]+"_"+this.slots[s]) {
                    passed = true;
                }
                if (passed) {
                    count++;
                    if (time_slots_taken.indexOf(this.time_slots[t]+"_"+this.slots[s]) > -1) {
                        this.mouse_event.max = Math.min(7,count);
                        return;
                    }
                }
            }
        }
    }
    closePopup (new_app:any) {
        if (new_app.duration === 0) {
            delete this.appointments[new_app.date_selected][new_app.time]
        }
        this.show_popup = false;
        this.new_appointment = {};
    }
}
