import { Component,OnInit,OnDestroy,AfterViewInit,ViewChild,Input , OnChanges , SimpleChanges  } from "@angular/core";

import { Subject } from 'rxjs';
import { FormBuilder , FormGroup,FormControl  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { orderDetailService } from '@services/orderDetails.service';
import { guarantorsService } from '@services/guarantor.service';
import { PermissionService } from "@services/permissions.service.ts";


@Component({
  selector:"guarantorsDetail",
  templateUrl:"./guarantorsDetail.component.html",
  styleUrls:["./guarantorsDetail.component.scss"]
})

export class GuarantorsDetailComponent  implements OnInit , AfterViewInit ,OnDestroy  , OnChanges{

  @Input() ids;
  guarantorsData:any;
  rsrcTitle : String = "Guarantors";
  constructor(private _orderDetailServices : orderDetailService , private _guarantorService : guarantorsService  , public _permService : PermissionService) {


  }

  ngOnInit():void
  {

  }
  ngOnChanges(changes){
    console.log("Changes in ngonchanges" , changes)
    if(changes.ids && changes.ids.currentValue)
    {
      console.log("Ids recieved" , changes.ids)
      this.getGuarantorsData({ids : JSON.parse(changes.ids.currentValue)})
    }
  }

  ngAfterViewInit():void
  {

  }
  ngOnDestroy():void
  {

  }

  getGuarantorsData(ids)
  {

    this._guarantorService.viewDetailMultiple(ids)
      .subscribe(
        response =>
        {

          this.guarantorsData = response;

          console.log("In guarantors response" ,response);


        },
        error => {
        console.log(error)
        })
  }



}
