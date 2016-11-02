//a simple service
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class LoginService {
    user_login: any;
    public headers: any;
    constructor(private http:Http) {}
    checkUserLogin (user: any): Observable<any> {
        return this.http.post('https://localhost:3000/login',user)
            .map(this.extractData)
            .catch(this.handleError);
    }
    logout() {
        sessionStorage.removeItem('token');
    }

    isLoggedIn() {
        return !!sessionStorage.getItem('token');
    }
    extractData(res: any) {
        let body = res.json();
        if (body.token) {
            localStorage.setItem('token', body.token);
            sessionStorage.setItem('token', body.token);
        }
        return body || false;
    }
    private handleError (error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
            console.error(errMsg); // log to console instead
        return Promise.reject(errMsg);
    }
}