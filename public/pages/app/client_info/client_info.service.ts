//a simple service
import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/map';

@Injectable()
export class ClientInfoService {
    client_info: any;
    constructor(private http:Http) {}
    getInfo(id:any) {
        let headers = new Headers();
        let authToken = localStorage.getItem('token');
        headers.append('Authorization', `Bearer ${authToken}`);

        let params = new URLSearchParams();
        params.set('id', id);

        this.client_info = this.http.get('https://localhost:3000/api/client_info', {search: params, headers:headers})
            .map(response => response.json());
    }

    saveInfo (session: any): Observable<any> {
        let headers = new Headers();
        let authToken = localStorage.getItem('token');
        headers.append('Authorization', `Bearer ${authToken}`);
        let options = new RequestOptions({ headers: headers });

        return this.http.post('https://localhost:3000/api/save_session', session, options)
    }
}