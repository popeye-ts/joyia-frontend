import { Component,OnInit,OnDestroy,AfterViewInit,ViewChild,Input , OnChanges} from "@angular/core";
import { Observable, Subject } from 'rxjs';
import { FormBuilder , FormGroup,FormControl  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { orderService } from '@services/order.service';
import { StateService } from '@uirouter/angular';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { printing } from "@/Redux/actions/print.actions";
import { getPrintStatus, getOrderNumber, getId } from '@selectors/print.selector';
import {  getOrderCompletionStatus } from '@/Redux/selectors/cashOrder.selector';

@Component({
  selector:"previousOrders",
  templateUrl:"./previousOrders.component.html",
  styleUrls:["./previousOrders.component.scss"]
})

export class PreviousOrdersComponent  implements OnInit , AfterViewInit ,OnDestroy  , OnChanges{
  otherOrdersData:any;
  haveData : any;
  printStatus$ : Observable<string >;
  order_id$ : Observable<string >;
  orderSubmissionState$ : Observable<string>;

  constructor(private _orderService : orderService , private $state : StateService , private store: Store<State> ) {
    this.printStatus$ = this.store.select(getPrintStatus);
    this.order_id$ = this.store.select(getId);
    this.orderSubmissionState$ = this.store.select(getOrderCompletionStatus );
  }

  ngOnInit():void
  {
  }

  ngOnChanges(changes ){
    // console.log("I am changes in previous orders" , changes)
  }
  ngAfterViewInit():void
  {
    this.getOrders();
    this.orderSubmissionState$.subscribe((next)=>{
      // console.log("Gonna fetch new orders");
      this.getOrders();
    }); 
  }
  ngOnDestroy():void
  {

  }
  //Fetch orders of same client
  getOrders()
  {
    this._orderService.fetchCashOrders()
      .subscribe(
        response =>
        {
          // console.log("Response orders in previous orders" , response);
          this.otherOrdersData = response;
          if(this.otherOrdersData.length )
            this.haveData = true;
        },
        error => {
        console.log(error)
        })
  }

  viewDetail(id){
    this.$state.go('store.orderdetail' , {id : id})
  }
  print(order){ 
    console.log("gonna print " , order );
    this.store.dispatch(new printing(order._id));
  }
}
