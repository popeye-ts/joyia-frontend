import { ChangeDetectionStrategy , Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input ,OnChanges, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import PerfectScrollbar from 'perfect-scrollbar';
import { clientService } from './../../services/client.service';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { getRecentOrders } from '@/Redux/selectors/dashboard.selector';

@Component({
  selector : 'recentOrders',
  templateUrl: './recentOrders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./recentOrders.component.scss']
})
export class recentOrdersComponent implements AfterViewInit , OnInit {
  recentOrders : any  ;
  data : any ;
  clients : any [] ;
  serverImagesPath : any = environment.cloudinary;

  recentOrders$ : Observable<any>;
  beingLoaded : Boolean = true;

  constructor(private store: Store<State>  , private ref: ChangeDetectorRef ){
    this.recentOrders$ = this.store.select(getRecentOrders );
  }
  ngOnInit(){
    let that = this ;
    this.recentOrders$.subscribe(orders=>{
      that.beingLoaded = orders.beingLoaded && !orders.data;
      that.recentOrders = orders.data || [];
      this.ref.markForCheck();

      setTimeout(()=>that.initScrollBar() , 400);
    })

  }
  ngAfterViewInit() : void {

  }
  initScrollBar(){
    if (typeof PerfectScrollbar !== "undefined") {
      var chatAppScroll;
      $(".scroll").each(function () {
        var ps = new PerfectScrollbar($(this)[0]);
      });
    }
    
  }
  ngOnDestroy(): void {

  }
  viewOrderDetail(rcent : any){
    console.log("Fetch recent " , rcent);
  }
}
