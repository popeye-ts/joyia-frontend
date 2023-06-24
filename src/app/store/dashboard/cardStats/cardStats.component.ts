import {ChangeDetectorRef  ,  Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  , OnChanges, ChangeDetectionStrategy  } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";

import Glide from '@glidejs/glide';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { getCardStats } from '@/Redux/selectors/dashboard.selector';
@Component({
  selector : 'cardStats',
  templateUrl: './cardStats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./cardStats.component.scss']
})
export class cardStatsComponent implements AfterViewInit , OnInit {
  pageData : any;
  cards : string[];
  cardLabels : string[];
  active : Number ;
  cardStats$ : Observable<any>;
  beingLoaded : Boolean = false;
  gliderInstance : any = null ;
  constructor(private ref: ChangeDetectorRef,
    private store: Store<State> ){
    this.active = 1;
    this.cardStats$ = this.store.select(getCardStats );

  }  
  initalizingGlides(){
    if ($(".glide.dashboard-numbers").length > 0) {
      if(this.gliderInstance){
        this.gliderInstance.destroy();
      }
      this.gliderInstance = new Glide(".glide.dashboard-numbers", {
        bound: true,
        rewind: false,
        perView: 4,
        perTouch: 1,
        focusAt: 0,
        startAt: 0,
        animationDuration :2000 ,
        autoplay : 3000 ,
        direction: "rtl",
        gap: 7,
        breakpoints: {
          1800: {
            perView: 3
          },
          576: {
            perView: 2
          },
          320: {
            perView: 1
          }
        }
      }).mount();
    }


  }
  ngOnInit(){
    let that = this ;

    // Details Images
    this.cardStats$.subscribe(stats=>{
      console.log("Stats changed" , stats )
      that.beingLoaded = stats.beingLoaded && !stats.data;
      that.cards = stats.data || [];
      this.ref.markForCheck();
      setTimeout(() => {
        this.initalizingGlides();

      }, 500);

    })
}

  ngAfterViewInit() : void {
  }
  ngOnDestroy(): void {
    if(this.gliderInstance){
      this.gliderInstance.destroy();
    }
  }
  //for formating numbers
  shortenLargeNumber(num, digits) {
    var units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        decimal;

    for(var i=units.length-1; i>=0; i--) {
        decimal = Math.pow(1000, i+1);

        if(num <= -decimal || num >= decimal) {
            return +(num / decimal).toFixed(digits) + units[i];
        }
    }
    return num;
  }
}
