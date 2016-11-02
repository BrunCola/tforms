import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { RouterModule }   from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.service';
import { Login } from './login/login';
import { LoggedInGuard } from './logged-in.guard';


import { CalendarComponent } from './calendar/calendar.component';

import { ClientInfoComponent } from './client_info/client_info.component';
import { ClientInfoService } from './client_info/client_info.service';
import { ClientInfo } from './client_info/client_info';
import { ClientInfoInfo } from './client_info/client_info_info';

import { ClientListComponent } from './client_list/client_list.component';
import { ClientListService } from './client_list/client_list.service';
import { ClientList } from './client_list/client_list';

let routes = [
    { path: 'login', component: LoginComponent, data: { title: 'Login Page'}  },
    { path: 'client_list', component: ClientListComponent, useAsDefault: true, canActivate: [LoggedInGuard]},
    { path: 'client_info', component: ClientInfoComponent, canActivate: [LoggedInGuard] },
    { path: 'calendar', component: CalendarComponent, canActivate: [LoggedInGuard] },
    {path: '**', component: ClientListComponent, canActivate: [LoggedInGuard]}
];

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        Login,
        HeaderComponent,
        FooterComponent,
        CalendarComponent,
        ClientInfoComponent,
        ClientInfo,
        ClientInfoInfo,
        ClientListComponent,
        ClientList,
    ],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot(routes)
    ],
    providers: [LoginService, ClientListService, ClientInfoService, LoggedInGuard],
    bootstrap: [AppComponent]
})
export class AppModule {}