import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input , OnChanges, ChangeDetectorRef  } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { productService } from './../../services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { getSummaryStats } from '@/Redux/selectors/dashboard.selector';
@Component({
  selector : 'summaryStats',
  templateUrl: './summaryStats.component.html',
  styleUrls: ['./summaryStats.component.scss']
})
export class summaryStatsComponent implements AfterViewInit {
  statistics : any [] ;
  serverImagesPath : string = environment.apiUrl+"uploads/";
  color : string ;
  trailColor : string ;

  stats$ : Observable<any>;
  beingLoaded : Boolean = true;

  constructor(private store: Store<State>  ,  private ref: ChangeDetectorRef){
    this.stats$ = this.store.select(getSummaryStats );
  }
  ngOnChanges(changes)
  {
    if(changes && changes.data && changes.data.currentValue)
    {
      //initializing theme
      let rootStyle = getComputedStyle(document.body);
      let themeColor1 = rootStyle.getPropertyValue("--theme-color-1").trim();
      this.color = $(this).data("color") || themeColor1;
      this.trailColor = $(this).data("trailColor") || "#d7d7d7";

    }

  }

  ngAfterViewInit() : void {
    this.stats$.subscribe(stats=>{
      this.beingLoaded = stats.beingLoaded && !stats.data;
      this.statistics = stats.data;
    }) 
  }
  ngOnDestroy(): void {

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
