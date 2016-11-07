import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';

@Component({
    selector: 'initial-body',
    styleUrls: ['./initial_assessment.component.css'],
    template: `
        <div class="overlay"><img src="`+require("./bodies.jpg")+`" height="{{image_height}}" width="{{image_width}}"></div>
        <canvas id="canvas"></canvas>
        <button (click)="clearImage()">Clear Image</button>
    `
})
export class InitialAssessment implements OnInit , OnChanges { 
    @Input() session: any;
    @Output() save_session = new EventEmitter();
    // session: any;
    canvas: any;
    ctx: any;
    painting: boolean = false;
    image_width: number = 600;
    image_height: number = 500;
    image_ratio: number = 5/6;
    lastX: number = 0;
    lastY: number = 0;
    mouseX: number = 0;
    mouseY: number = 0;
    lineThickness: number = 1;
    constructor() {}
    ngOnChanges() {
        if (this.session) {
            var background = new Image();
            background.src = this.session.injury_body;

            background.onload = () => {
                this.ctx.drawImage(background,0,0,this.image_width,this.image_height); 
            }​
        }
    }
    ngOnInit(){
        var image = new Image();
        image.src = require("./bodies.jpg");
        this.image_ratio = image.height/image.width;

        let bodyCanvas = document.getElementById("bodyCanvas");
        this.image_width = bodyCanvas.clientWidth;
        this.image_height = this.image_width*this.image_ratio;

        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = this.image_width;
        this.canvas.height = this.image_height;

        this.canvas.onmousedown = this.onmousedown.bind(this);
        this.canvas.onmousemove = this.onmousemove.bind(this);
        this.canvas.onmouseup = this.onmouseup.bind(this);
        this.canvas.onmouseout = this.onmouseout.bind(this);
    }
    loadSession(session: any) {
    }
    onmousedown (e: any) {
        this.painting = true;
        this.ctx.fillStyle = "#F00";
        this.lastX = e.layerX;
        this.lastY = e.layerY;
    };
    onmousemove (e:any) {
        if (this.painting) {
            this.mouseX = e.layerX;
            this.mouseY = e.layerY;
     
            let x1 = this.mouseX,
                x2 = this.lastX,
                y1 = this.mouseY,
                y2 = this.lastY;

            let steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
            let temp_x: number, temp_y: number;
            if (steep){
                temp_x = x1;
                x1 = y1;
                y1 = temp_x;

                temp_y = y2;
                y2 = x2;
                x2 = temp_y;
            }
            if (x1 > x2) {
                temp_x = x1;
                x1 = x2;
                x2 = temp_x;

                temp_y = y1;
                y1 = y2;
                y2 = temp_y;
            }

            let dx = x2 - x1,
                dy = Math.abs(y2 - y1),
                error = 0,
                de = dy / dx,
                yStep = -1,
                y = y1;
            
            if (y1 < y2) {
                yStep = 1;
            }
           
            this.lineThickness = 3;
            let x: number = x1;
            for (x; x < x2; x++) {
                if (steep) {
                    this.ctx.fillRect(y, x, this.lineThickness , this.lineThickness );
                } else {
                    this.ctx.fillRect(x, y, this.lineThickness , this.lineThickness );
                }
                
                error += de;
                if (error >= 0.5) {
                    y += yStep;
                    error -= 1.0;
                }
            }

            this.lastX = this.mouseX;
            this.lastY = this.mouseY;
        }
    }
    onmouseout (e: any){
        if (this.painting) {
            this.painting = false;
            this.saveImage();
        }
    }
    onmouseup (e: any){
        this.painting = false;
        this.saveImage();
    }
    clearImage() {
        this.ctx.clearRect(0, 0, this.image_width, this.image_height);
        var dataURL:any = "";
        this.save_session.next({injury_body: dataURL, client_id : this.session.client_id})
    }
    saveImage() {
        var dataURL = this.canvas.toDataURL();
        this.save_session.next({injury_body: dataURL, client_id : this.session.client_id})
    }
}