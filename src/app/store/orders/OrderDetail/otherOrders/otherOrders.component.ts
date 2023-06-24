import { Component,OnInit,OnDestroy,AfterViewInit,ViewChild,Input , OnChanges} from "@angular/core";

import { Subject } from 'rxjs';
import { FormBuilder , FormGroup,FormControl  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { orderDetailService } from '@services/orderDetails.service';
import { StateService } from '@uirouter/angular';

@Component({
  selector:"otherOrders",
  templateUrl:"./otherOrders.component.html",
  styleUrls:["./otherOrders.component.scss"]
})

export class OtherOrdersComponent  implements OnInit , AfterViewInit ,OnDestroy  , OnChanges{

  @Input() order_id;
  otherOrdersData:any;
  haveData : any;

  constructor(private _orderDetailServices : orderDetailService , private $state : StateService ,) {
  }

  ngOnInit():void
  {
  }

  ngOnChanges(){
  }
  ngAfterViewInit():void
  {

  }
  ngOnDestroy():void
  {

  }
  //Fetch orders of same client
  getOrders(id)
  {
    this._orderDetailServices.fetchClientOrders(id)
      .subscribe(
        response =>
        {
          this.otherOrdersData = response.order.filter(o=>o._id+"" != id );
          if(this.otherOrdersData.length )
            this.haveData = true;

          console.log("Same Client other orders:" , response);
        },
        error => {
        console.log(error)
        })
  }

  viewDetail(id){
    this.$state.go('store.orderdetail' , {id : id})
  }

}
