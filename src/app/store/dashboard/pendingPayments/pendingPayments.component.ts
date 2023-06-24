import {ChangeDetectorRef ,  Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input , OnChanges  } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { getPendingPayments } from '@/Redux/selectors/dashboard.selector';


@Component({
  selector : 'pendingPayments',
  templateUrl: './pendingPayments.component.html',
  styleUrls: ['./pendingPayments.component.scss']
})
export class pendingPaymentsComponent implements AfterViewInit {
  pendingData : any  ;
  pendingData$ : Observable<any>;
  beingLoaded : boolean = true;

  serverImagesPath : string = environment.cloudinary.medium;

  constructor(private store: Store<State>  ,  private ref: ChangeDetectorRef){
    this.pendingData$ = this.store.select(getPendingPayments );
  }

  ngAfterViewInit() : void {
    let that = this;
    this.pendingData$.subscribe(pendingPaymentsData=>{
      that.beingLoaded = pendingPaymentsData.beingLoaded && !pendingPaymentsData.pendingData;
      that.pendingData = pendingPaymentsData.data || [];
      this.ref.markForCheck();
    })
  }
  ngOnDestroy(): void {

  }

}
