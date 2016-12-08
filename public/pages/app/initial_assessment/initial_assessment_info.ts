import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
    selector: 'initial-info',
    templateUrl: './initial_assessment_info.html',
    styleUrls: ['./initial_assessment.component.scss'],
})
export class InitialAssessmentInfo implements OnInit { 
    @Input() session: any;
    @Output() save_session = new EventEmitter();
    checkbox_col_1: any;
    checkbox_col_2: any;
    checkbox_col_3: any;
    checkbox_col_4: any;
    consent: any;
    constructor() {}
    ngOnInit(){
        this.session = {};
        this.session.checkbox_col_1 = {};
        this.session.checkbox_col_2 = {};
        this.session.checkbox_col_3 = {};
        this.session.checkbox_col_4 = {};
        this.consent = [
            {title: "Treatment Consent", selected: false},
            {title: "Assessment Consent", selected: false},
        ]
        this.checkbox_col_1 = [
            {title: "Full Body", selected: false},
            {title: "Face", selected: false},
            {title: "Head", selected: false},
            {title: "Neck", selected: false},
            {title: "Shoulders", selected: false},
            {title: "Chest / Pecs", selected: false},
            {title: "Upper Back", selected: false},
            {title: "Lower Back", selected: false},
            {title: "Gluts", selected: false},
            {title: "Hips", selected: false},
        ]
        this.checkbox_col_2 = [
            {title: "Arms", selected: false},
            {title: "Wrist / Hands", selected: false},
            {title: "Legs", selected: false},
            {title: "Knee", selected: false},
            {title: "Feet", selected: false},
            {title: "Abdomen", selected: false},
            {title: "Breast", selected: false},
            {title: "Intra-oral", selected: false},
            {title: "Other", selected: false},
        ]
        this.checkbox_col_3 = [
            {title: "Compression", selected: false},
            {title: "GST", selected: false},
            {title: "Fascial", selected: false},
            {title: "GTO", selected: false},
            {title: "TRP", selected: false},
            {title: "Hydrotherapy", selected: false},
            {title: "Stretch", selected: false},
        ]
        this.checkbox_col_4 = [
            {title: "JT Mobs", selected: false},
            {title: "Dynamic Release", selected: false},
            {title: "Tapotement", selected: false},
            {title: "Other", selected: false},
        ]
    }
    ngOnChanges() {
        if (this.session) {
            if (!this.session.checkbox_col_1) this.session.checkbox_col_1 = []; 
            if (!this.session.checkbox_col_2) this.session.checkbox_col_2 = []; 
            if (!this.session.checkbox_col_3) this.session.checkbox_col_3 = []; 
            if (!this.session.checkbox_col_4) this.session.checkbox_col_4 = []; 
            
            for (let a  in this.checkbox_col_1) {
                if (this.session.checkbox_col_1.indexOf(this.checkbox_col_1[a].title) > -1) this.checkbox_col_1[a].selected = true;
            }
            for (let e  in this.checkbox_col_2) {
                if (this.session.checkbox_col_2.indexOf(this.checkbox_col_2[e].title) > -1) this.checkbox_col_2[e].selected = true;
            }
            for (let t  in this.checkbox_col_3) {
                if (this.session.checkbox_col_3.indexOf(this.checkbox_col_3[t].title) > -1) this.checkbox_col_3[t].selected = true;
            }
            for (let t  in this.checkbox_col_4) {
                if (this.session.checkbox_col_4.indexOf(this.checkbox_col_4[t].title) > -1) this.checkbox_col_4[t].selected = true;
            }
            console.log(this.session);
        }
    }
    save_checkbox_col_1(info: any) {
        for (let a  in this.checkbox_col_1) {
            if (this.checkbox_col_1[a].title === info.title) {
                this.checkbox_col_1[a].selected = !this.checkbox_col_1[a].selected;
                break;
            }
        }
        this.saveImage();
    }
    save_checkbox_col_2(info: any) {
        for (let e  in this.checkbox_col_2) {
            if (this.checkbox_col_2[e].title === info.title) {
                this.checkbox_col_2[e].selected = !this.checkbox_col_2[e].selected;
                break;
            }
        }
        this.saveImage();
    }
    save_checkbox_col_3(info: any) {
        for (let t  in this.checkbox_col_3) {
            if (this.checkbox_col_3[t].title === info.title) {
                this.checkbox_col_3[t].selected = !this.checkbox_col_3[t].selected;
                break;
            }
        }
        this.saveImage();
    }
    save_checkbox_col_4(info: any) {
        for (let t  in this.checkbox_col_4) {
            if (this.checkbox_col_4[t].title === info.title) {
                this.checkbox_col_4[t].selected = !this.checkbox_col_4[t].selected;
                break;
            }
        }
        this.saveImage();
    }
    saveConsentInfo(info: any) {
        console.log(info)
        for (let t  in this.consent) {
            if (this.consent[t].title === info.title) {
                this.consent[t].selected = !this.consent[t].selected;
                break;
            }
        }
        this.saveImage();
    }

    clearValues() {
        this.checkbox_col_1.map((data: any) => data.selected = false)
        this.checkbox_col_2.map((data: any) => data.selected = false)
        this.checkbox_col_3.map((data: any) => data.selected = false)
        this.checkbox_col_4.map((data: any) => data.selected = false)

        let temp_checkbox_col_1: any = []; 
        let temp_checkbox_col_2: any = []; 
        let temp_checkbox_col_3: any = []; 
        let temp_checkbox_col_4: any = []; 
        let temp_obj: any = {};

        temp_obj = {
            checkbox_col_1: temp_checkbox_col_1,
            checkbox_col_2: temp_checkbox_col_2,
            checkbox_col_3: temp_checkbox_col_3,
            checkbox_col_4: temp_checkbox_col_4,
            client_id : this.session.client_id
        }
        this.save_session.next(temp_obj);
    }
    saveImage() {
        let temp_checkbox_col_1: any = []; 
        let temp_checkbox_col_2: any = []; 
        let temp_checkbox_col_3: any = []; 
        let temp_checkbox_col_4: any = []; 
        let temp_obj: any = {};

        for (let a  in this.checkbox_col_1) {
            if (this.checkbox_col_1[a].selected) {
                temp_checkbox_col_1.push(this.checkbox_col_1[a].title)
            }
        }
        for (let e  in this.checkbox_col_2) {
            if (this.checkbox_col_2[e].selected) {
                temp_checkbox_col_2.push(this.checkbox_col_2[e].title);
            }
        }
        for (let t  in this.checkbox_col_3) {
            if (this.checkbox_col_3[t].selected) {
                temp_checkbox_col_3.push(this.checkbox_col_3[t].title)
            }
        }
        for (let t  in this.checkbox_col_4) {
            if (this.checkbox_col_4[t].selected) {
                temp_checkbox_col_4.push(this.checkbox_col_4[t].title)
            }
        }
        temp_obj = {
            checkbox_col_1: temp_checkbox_col_1,
            checkbox_col_2: temp_checkbox_col_2,
            checkbox_col_3: temp_checkbox_col_3,
            checkbox_col_4: temp_checkbox_col_4,
            client_id : this.session.client_id
        }
        this.save_session.next(temp_obj);
    }
}