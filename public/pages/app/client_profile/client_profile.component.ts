import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ClientProfileService } from './client_profile.service';

@Component({
  templateUrl: './client_profile.component.html',
  styleUrls: ['./client_profile.component.css'],
  providers: [  ]
})
export class ClientProfileComponent implements OnInit {
    client_list:any;
    days: any;
    months: any;
    total_years: any;
    start_year: any;
    new_client:any = {};
    fakeArray: any = [1,2,3,4,5,6]
    constructor(
        clientprofileService:ClientProfileService,
        private router: Router
    ) {
        clientprofileService.client_list
            .subscribe(
                (client_list:any) => {this.client_list = client_list},
                console.error
        );
    }
    ngOnInit () {
        this.days = new Array(31);
        this.months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        this.total_years = new Array(100);
        this.start_year = 1916;
    }
    newSession(id:any){
        this.router.navigate(['/client_info', { id: id }]);
    }
    editSession(id:any){
        this.router.navigate(['/client_info', { id: id }]);
    }
    deleteSession(id:any){
        this.router.navigate(['/client_info', { id: id }]);
    }
}