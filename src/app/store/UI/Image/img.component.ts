import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'my-img',
    templateUrl: 'img.component.html',
})
export class ImgComponent implements OnChanges {
    @Input() src: string;
    @Input() alt: string;
    public cached = false;
    public loaded = false;
    public error = false;

    private lastSrc: string;

    //image dimensions
    @Input() width : string ;
    @Input() height : string ;
    @Input() maxHeight : string ;
    @Input() maxWidth : string = '';
    @Input() borderRadius : string;
    

    //image class
    @Input() class : string;

    //preloader props
    theme : any;
    constructor() { }

    public ngOnChanges(changes) {
        if (this.src !== this.lastSrc) {
            this.lastSrc = this.src;
            this.loaded = false;
            this.error = false;
            this.cached = this.isCached(this.src);
        }

        if (!this.src) {
            this.error = true;
        }
        //initializing the preloader

          // 'width': 'width}}%' ,
          // 'height':'{{height}}px',
          // 'max-height': '{{maxHeight}}px',
          // 'border-radius': '{{borderRadius}}px'

        if(this.width && this.height && this.maxHeight && this.borderRadius)
          {

            this.theme = {
              'width' : this.width,
              'height' : this.height,
              'max-height' : this.maxHeight,
              'border-radius' : this.borderRadius
          };
        }
    }

    public onLoad() {
        this.loaded = true;
        if(this.maxWidth){
            this.width =  this.maxWidth; 
        }
    }

    public onError() {
        this.error = true;
    }

    private isCached(url: string): boolean {
        if (!url) {
            return false;
        }

        let image = new Image();
        image.src = url;
        let complete = image.complete;

        // console.log('isCached', complete, url);

        return complete;
    }
}
