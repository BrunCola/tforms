import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { ClientListService } from './client_list.service';

@Component({
  templateUrl: './client_list.component.html',
  styleUrls: ['./client_list.component.css'],
  providers: [{ provide: Window, useValue: window }]
  // providers: [  ]
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
        @Inject(Window) private window: any,
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
        // this.generate();
    }
    newAssessment(id:any){
        this.router.navigate(['/ongoing_assessment', { id: id }]);
    }
    viewClient(id:any){
        this.router.navigate(['/initial_assessment', { id: id }]);
    }










    urlsToAbsolute(nodeList: any) {
        if (!nodeList.length) {
            return [];
        }
        var attrName = 'href';
        if (nodeList[0].__proto__ === HTMLImageElement.prototype 
        || nodeList[0].__proto__ === HTMLScriptElement.prototype) {
            attrName = 'src';
        }
        nodeList = [].map.call(nodeList, function (el:any, i:any) {
            var attr = el.getAttribute(attrName);
            if (!attr) {
                return;
            }
            var absURL = /^(https?|data):/i.test(attr);
            if (absURL) {
                return el;
            } else {
                return el;
            }
        });
        return nodeList;
    }
    screenshotPage() {
        this.urlsToAbsolute(document.images);
        this.urlsToAbsolute(document.querySelectorAll("link[rel='stylesheet']"));
        var screenshot: any = document.documentElement.cloneNode(true);
        var b = document.createElement('base');
        b.href = document.location.protocol + '//' + location.host;
        var head = screenshot.querySelector('head');
        head.insertBefore(b, head.firstChild);
        screenshot.style.pointerEvents = 'none';
        screenshot.style.overflow = 'hidden';
        screenshot.style.webkitUserSelect = 'none';
        screenshot.style.mozUserSelect = 'none';
        screenshot.style.msUserSelect = 'none';
        screenshot.style.oUserSelect = 'none';
        screenshot.style.userSelect = 'none';
        screenshot.dataset.scrollX = this.window.scrollX;
        screenshot.dataset.scrollY = this.window.scrollY;
        var script = document.createElement('script');
        script.textContent = '(' + this.addOnPageLoad_.toString() + ')();';
        screenshot.querySelector('body').appendChild(script);
        console.log(screenshot)
        var blob = new Blob([screenshot.outerHTML], {
            type: 'text/html'
        });
        return blob;
    }
    addOnPageLoad_() {
        this.window.addEventListener('DOMContentLoaded', function (e:any) {
            let ds : any = document.documentElement.dataset;
            var scrollX = ds.scrollX || 0;
            var scrollY = ds.scrollY || 0;
            this.window.scrollTo(scrollX, scrollY);
        });
    }
    generate() {
        this.window.URL = this.window.URL || this.window.webkitURL;
        console.log(this.screenshotPage())
        console.log(this.window.URL)
        console.log(this.window.URL.createObjectURL(this.screenshotPage()))
        // this.window.open(this.window.URL.createObjectURL(this.screenshotPage()));
    }

}

    
    // exports.screenshotPage = screenshotPage;
    // exports.generate = generate;