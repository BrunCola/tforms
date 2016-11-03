import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { cloneDeep } from 'lodash';
import { cloneDeep } from "lodash";
// var _ = require('lodash');

// import { ClientListService } from './client_list.service';

@Component({
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  providers: [  ]
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
    slots: any = [1,2,3,4];
    time_slots: any = ["5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm"];
    day_names: any = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    days: any = [];
    months_names_short:any  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    months_names:any  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    constructor( ) {
    }
    ngOnInit () {
        this.current_day = this.current_date.getDate();
        this.current_month = this.current_date.getMonth();
        this.current_year = this.current_date.getFullYear();

        this.appointments = {
            "1_10_2016" : {
                "5am" : {
                    "start": 2,
                    "duration" : 6
                },
                "7am" : {
                    "start": 4,
                    "duration" : 2
                },
            }
        }

        // this.getMonthArray(0);
        // this.getWeekArray(0);
        this.getYearArray(0,true);
        // console.log(this.current_full_week);
        // console.log(this.current_full_month);
        // console.log(this.current_full_year);
        setTimeout(() => {
            this.drawAppointments();
        },0)
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
    drawAppointments() {
        let day_element:any;
        let slot_element:any;
        let hour_element: any;
        let div: any;
        for (let days in this.appointments) {
            for (let hours in this.appointments[days]) {
                hour_element = document.getElementById(days+'_'+hours);
                if (hour_element) {
                    slot_element = hour_element.getElementsByClassName("slot-"+this.appointments[days][hours].start);
                    div = document.createElement("div");
                    div.className = 'appointment app-'+this.appointments[days][hours].duration;
                    div.innerHTML = "whatever";
                    slot_element[0].appendChild(div); 
                }
            }

            // if () {
            //     console.log(document.getElementById(a))
            // }
        }
    }
}
