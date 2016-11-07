import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
    selector: 'ongoing-info',
    // templateUrl: './client_info.component.html',
    styleUrls: ['./ongoing_assessment.component.css'],
    template: `
    <div id="sessionInfo">
        <div class="session_column">
            <div class="session_row" (click)="saveAreaInfo(area)" *ngFor="let area of injury_area">
                <div class="checkbox"><input type="checkbox" name="area.title" [(ngModel)]="area.selected"></div><div class="label">{{area.title}}</div>
            </div>
        </div>
        <div class="session_column">
            <div class="session_row" (click)="saveEffectInfo(effect)" *ngFor="let effect of injury_effect">
                <div class="checkbox"><input type="checkbox" name="effect.title" [(ngModel)]="effect.selected"></div><div class="label">{{effect.title}}</div>
            </div>
        </div>
        <div class="session_column">
            <div class="session_row" (click)="saveTypeInfo(type)" *ngFor="let type of injury_type">
                <div class="checkbox"><input type="checkbox" name="type.title" [(ngModel)]="type.selected"></div><div class="label">{{type.title}}</div>
            </div>
        </div>
        <button (click)="clearValues()">Clear Values</button>
    </div>
  `
})
export class OngoingAssessmentInfo implements OnInit { 
    @Input() session: any;
    @Output() save_session = new EventEmitter();
    injury_area: any;
    injury_effect: any;
    injury_type: any;
    constructor() {}
    ngOnInit(){
        this.session = {};
        this.session.injury_area = {};
        this.session.injury_effect = {};
        this.session.injury_type = {};
        this.injury_area = [
            {title: "Full Body", selected: false},
            {title: "Head", selected: false},
            {title: "Neck", selected: false},
            {title: "Shoulders", selected: false},
            {title: "Arms", selected: false},
            {title: "Wrist / Hands", selected: false},
            {title: "Chest", selected: false},
            {title: "Upper Back", selected: false},
            {title: "Lower Back", selected: false},
            {title: "Hip", selected: false},
            {title: "Legs", selected: false},
            {title: "Knee", selected: false},
            {title: "Feet", selected: false},
        ]
        this.injury_effect = [
            {title: "Squeezing", selected: false},
            {title: "Stroking", selected: false},
            {title: "Rocking", selected: false},
            {title: "Effleurage", selected: false},
            {title: "Friction", selected: false},
            {title: "Vibration", selected: false},
            {title: "Tapotement", selected: false},
            {title: "Intra-oral", selected: false},
            {title: "Fascial Techniques", selected: false},
            {title: "MTP Release", selected: false},
            {title: "Stretch", selected: false},
            {title: "Joint Mobilization", selected: false},
        ]
        this.injury_type = [
            {title: "C-Bowing", selected: false},
            {title: "C-Scooping", selected: false},
            {title: "GTO", selected: false},
            {title: "Ischemic Compression", selected: false},
            {title: "Thumb stripping", selected: false},
            {title: "Elbow stripping", selected: false},
            {title: "Kneading", selected: false},
            {title: "Wringing", selected: false},
            {title: "Compression", selected: false},
            {title: "ART", selected: false},
            {title: "ROM", selected: false},
        ]
    }
    ngOnChanges() {
        if (this.session) {
            if (!this.session.injury_area) this.session.injury_area = []; 
            if (!this.session.injury_effect) this.session.injury_effect = []; 
            if (!this.session.injury_type) this.session.injury_type = []; 
            
            for (let a  in this.injury_area) {
                if (this.session.injury_area.indexOf(this.injury_area[a].title) > -1) this.injury_area[a].selected = true;
            }
            for (let e  in this.injury_effect) {
                if (this.session.injury_effect.indexOf(this.injury_effect[e].title) > -1) this.injury_effect[e].selected = true;
            }
            for (let t  in this.injury_type) {
                if (this.session.injury_type.indexOf(this.injury_type[t].title) > -1) this.injury_type[t].selected = true;
            }
        }
    }
    saveAreaInfo(info: any) {
        for (let a  in this.injury_area) {
            if (this.injury_area[a].title === info.title) {
                this.injury_area[a].selected = !this.injury_area[a].selected;
                break;
            }
        }
        this.saveImage();
    }
    saveEffectInfo(info: any) {
        for (let e  in this.injury_effect) {
            if (this.injury_effect[e].title === info.title) {
                this.injury_effect[e].selected = !this.injury_effect[e].selected;
                break;
            }
        }
        this.saveImage();
    }
    saveTypeInfo(info: any) {
        for (let t  in this.injury_type) {
            if (this.injury_type[t].title === info.title) {
                this.injury_type[t].selected = !this.injury_type[t].selected;
                break;
            }
        }
        this.saveImage();
    }

    clearValues() {
        this.injury_area.map((data: any) => data.selected = false)
        this.injury_effect.map((data: any) => data.selected = false)
        this.injury_type.map((data: any) => data.selected = false)

        let temp_injury_area: any = []; 
        let temp_injury_effect: any = []; 
        let temp_injury_type: any = []; 
        let temp_obj: any = {};

        temp_obj = {
            injury_area: temp_injury_area,
            injury_effect: temp_injury_effect,
            injury_type: temp_injury_type,
            client_id : this.session.client_id
        }
        this.save_session.next(temp_obj);
    }
    saveImage() {
        let temp_injury_area: any = []; 
        let temp_injury_effect: any = []; 
        let temp_injury_type: any = []; 
        let temp_obj: any = {};

        for (let a  in this.injury_area) {
            if (this.injury_area[a].selected) {
                temp_injury_area.push(this.injury_area[a].title)
            }
        }
        for (let e  in this.injury_effect) {
            if (this.injury_effect[e].selected) {
                temp_injury_effect.push(this.injury_effect[e].title);
            }
        }
        for (let t  in this.injury_type) {
            if (this.injury_type[t].selected) {
                temp_injury_type.push(this.injury_type[t].title)
            }
        }
        temp_obj = {
            injury_area: temp_injury_area,
            injury_effect: temp_injury_effect,
            injury_type: temp_injury_type,
            client_id : this.session.client_id
        }
        this.save_session.next(temp_obj);
    }
}