import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input, ChangeDetectionStrategy, ChangeDetectorRef  } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { productService } from './../../services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import { getLogs } from '@/Redux/selectors/dashboard.selector';
import { Store } from '@ngrx/store';
import { State } from '@/Redux/state';

@Component({
  selector : 'logs',
  templateUrl: './logs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./logs.component.scss']
})
export class logsComponent implements AfterViewInit{
  serverImagesPath : string = environment.apiUrl+"uploads/";
  logs$ : Observable<any>;
  logs : Array <any> = [];
  beingLoaded : Boolean = true;

  constructor(private store: Store<State>  , private ref: ChangeDetectorRef,){
    this.logs$ = this.store.select(getLogs );
 
  }
  ngAfterViewInit() : void {
    let that = this ;
    this.logs$.subscribe(logsData=>{
      that.beingLoaded = logsData.beingLoaded && !logsData.data;
      that.logs = logsData.data || [];
      this.ref.markForCheck();
    })
  }
  ngOnDestroy(): void {

  }

}
