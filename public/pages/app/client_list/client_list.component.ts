import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ClientListService } from './client_list.service';

@Component({
  templateUrl: './client_list.component.html',
  styleUrls: ['./client_list.component.css'],
  providers: [  ]
})
export class ClientListComponent implements OnInit {
    client_list:any;
    days: any;
    months: any;
    total_years: any;
    start_year: any;
    new_client:any = {};
    fakeArray: any = [1,2,3,4,5,6]
    constructor(
        clientListService:ClientListService,
        private router: Router
    ) {
        clientListService.client_list
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
    newAssessment(id:any){
        this.router.navigate(['/ongoing_assessment', { id: id }]);
    }
    viewClient(id:any){
        this.router.navigate(['/client_profile', { id: id }]);
    }
}