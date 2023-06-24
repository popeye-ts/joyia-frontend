import { Component,OnInit,OnDestroy,AfterViewInit,ViewChild,Input , OnChanges , EventEmitter , Output } from "@angular/core";

import { Subject } from 'rxjs';
import { FormBuilder , FormGroup,FormControl  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { orderDetailService } from '@services/orderDetails.service';
// import { productInterface } from '@interfaces/orderDetailProduct.interface';

@Component({
  selector:"batches",
  templateUrl:"./batches.component.html",
  styleUrls:["./batches.component.scss"]
})

export class BatchesComponent  implements OnInit , AfterViewInit ,OnDestroy , OnChanges{

  @Input() batches;
  @Output() imagesRecieved = new EventEmitter();
  batchesData:   any;

  constructor(private _orderDetailServices : orderDetailService) {


  }

  ngOnInit():void
  {
    if(this.batches){
          this.getBatchesData();
    }

  }

  ngOnChanges(changes){
    if(changes.batches && changes.batches.currentValue)
    {
      this.batchesData = JSON.parse(changes.batches.currentValue)
      console.log("In batches component " , this.batchesData );

      this.getBatchesData();
    }
  }
  ngAfterViewInit():void
  {
    setTimeout(() => {
      (<any>$("#row_0")).collapse(true);
    }, 3000);
  }
  ngOnDestroy():void
  {

  }

  getBatchesData()
  {
    //Just making a refernce
    let that = this

    let tempBatches = [];
    this.batchesData.forEach(function(batch , index) {
      tempBatches.push(batch._id);
    })

    
  }
  infoRecieved(productImages){
    this.imagesRecieved.emit(productImages)
  }




}
