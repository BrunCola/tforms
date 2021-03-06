import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ClientInfoService } from './client_info.service';

@Component({
  // selector: 'client-info',
  templateUrl: './client_info.component.html',
  styleUrls: ['./client_info.component.css'],
})
export class ClientInfoComponent implements OnInit{ 
    client_info: any;
    constructor(
        private route: ActivatedRoute,
        private clientInfoService: ClientInfoService
    ) {}
    ngOnInit(){
        let id = +this.route.snapshot.params['id'];

        this.clientInfoService.getInfo(id);

        this.clientInfoService.client_info
            .subscribe(
                (client_info:any) => {
                    // if (client_info.length === 0) {
                    //     this.client_info = {client_id:id};
                    // } else {
                        this.client_info = client_info[0];
                    // }
                }
        );
    }

    saveInfo(session:any) {
        this.clientInfoService.saveInfo(session).subscribe();
    }
}