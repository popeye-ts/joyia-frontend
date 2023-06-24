import { Component,OnInit,OnDestroy,AfterViewInit,ViewChild,Input , OnChanges} from "@angular/core";

import { Subject } from 'rxjs';
import { FormBuilder , FormGroup,FormControl  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { orderDetailService } from '@services/orderDetails.service';
import { clientService } from '@services/client.service';
import { PermissionService } from "@services/permissions.service";

@Component({
  selector:"clientDetails",
  templateUrl:"./clientDetails.component.html",
  styleUrls:["./clientDetails.component.scss"]
})

export class CLientDetailsComponent  implements OnInit , AfterViewInit ,OnDestroy  , OnChanges{

  @Input() client_id;
  clientData:any;
  rsrcTitle : String = "Clients";
  constructor(private _orderDetailServices : orderDetailService , private _clientService : clientService , public _permService : PermissionService) {


  }

  ngOnInit():void
  {
    if(this.client_id)
      this.getClientData();
  }

  ngOnChanges(changes){
    // console.log("Changes recieved in client details ," , changes)
      if(changes.client_id && changes.client_id.currentValue)
      {
        this.client_id = changes.client_id.currentValue
        this.getClientData();
      }
  }
  ngAfterViewInit():void
  {

  }
  ngOnDestroy():void
  {

  }

  getClientData()
  {
    this._clientService.viewDetail( this.client_id)
      .subscribe(
        response =>
        {

          this.clientData = response;

          console.log("Client details in orders:" , response);


        },
        error => {
        console.log(error)
        })
  }



}
