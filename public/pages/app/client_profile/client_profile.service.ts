//a simple service
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
// import 'rxjs/add/operator/map';

@Injectable()
export class ClientProfileService {
    client_list: any;
    constructor(http:Http) {
        let headers = new Headers();
        let authToken = localStorage.getItem('token');
        headers.append('Authorization', `Bearer ${authToken}`);

        this.client_list = http.get('https://localhost:3000/api/client_list', {headers})
            .map(response => response.json());
    }
}