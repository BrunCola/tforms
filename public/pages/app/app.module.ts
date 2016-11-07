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
import { PopupComponent } from './calendar/popup/popup.component';

import { InitialAssessmentComponent } from './initial_assessment/initial_assessment.component';
import { InitialAssessmentService } from './initial_assessment/initial_assessment.service';
import { InitialAssessment } from './initial_assessment/initial_assessment';
import { InitialAssessmentInfo } from './initial_assessment/initial_assessment_info';

import { OngoingAssessmentComponent } from './ongoing_assessment/ongoing_assessment.component';
import { OngoingAssessmentService } from './ongoing_assessment/ongoing_assessment.service';
import { OngoingAssessment } from './ongoing_assessment/ongoing_assessment';
import { OngoingAssessmentInfo } from './ongoing_assessment/ongoing_assessment_info';

import { ClientListComponent } from './client_list/client_list.component';
import { ClientListService } from './client_list/client_list.service';
import { ClientList } from './client_list/client_list';

import { ClientProfileComponent } from './client_profile/client_profile.component';
import { ClientProfileService } from './client_profile/client_profile.service';
import { ClientProfile } from './client_profile/client_profile';

let routes = [
    { path: 'login', component: LoginComponent, data: { title: 'Login Page'}  },
    { path: 'client_list', component: ClientListComponent, useAsDefault: true, canActivate: [LoggedInGuard]},
    { path: 'client_profile', component: ClientProfileComponent, canActivate: [LoggedInGuard] },
    { path: 'initial_assessment', component: InitialAssessmentComponent, canActivate: [LoggedInGuard] },
    { path: 'ongoing_assessment', component: OngoingAssessmentComponent, canActivate: [LoggedInGuard] },
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
        InitialAssessmentComponent,
        InitialAssessment,
        InitialAssessmentInfo,
        OngoingAssessmentComponent,
        OngoingAssessment,
        OngoingAssessmentInfo,
        ClientListComponent,
        ClientList,
        ClientProfileComponent,
        ClientProfile,
        PopupComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot(routes)
    ],
    providers: [LoginService, ClientProfileService, ClientListService, InitialAssessmentService, OngoingAssessmentService, LoggedInGuard],
    bootstrap: [AppComponent]
})
export class AppModule {}