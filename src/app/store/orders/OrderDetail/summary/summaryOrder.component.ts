import { Component,OnInit,OnDestroy,AfterViewInit,ViewChild,Input , OnChanges , EventEmitter , Output } from "@angular/core";

import { Subject } from 'rxjs';
import { FormBuilder , FormGroup,FormControl  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { productService } from '@services/product.service';

@Component({
  selector:"sumaryOrder",
  templateUrl:"./summaryOrder.component.html",
  styleUrls:["./summaryOrder.component.scss"]
})

export class SummaryOrderDetailComponent  implements OnInit , AfterViewInit ,OnDestroy , OnChanges{

  @Input() products;
  @Output() imagesRecieved = new EventEmitter();
  productsData:   any;

  constructor(private _productServices : productService) {


  }

  ngOnInit():void
  {
    if(this.products){
          this.getProductstData();
    }

  }

  ngOnChanges(changes){
    if(changes.products && changes.products.currentValue)
    {
      this.productsData = JSON.parse(changes.products.currentValue)
      this.getProductstData();
    }
  }
  ngAfterViewInit():void
  {

  }
  ngOnDestroy():void
  {

  }

  getProductstData()
  {
    //Just making a refernce
    let that = this

    let tempProducts = [];
    this.productsData.forEach(function(product , index) {
      tempProducts.push(product.product_id)
    })

    this._productServices.viewDetailMultiple({ids:tempProducts})
      .subscribe(
        response =>
        {
          response.forEach(pInfoServer => {
              that.productsData.forEach(function (product , index){
                if(pInfoServer._id == product.product_id )
                {
                  that.productsData[index].productInfo = pInfoServer
                }
              });

          });
          //for images
          let temp = [];
          response.forEach(pInfoServer=>{
              let prod = [];
              prod['title'] = pInfoServer.product_display_name;
              prod['image'] = pInfoServer.image;
              temp.push(prod);
          });

          that.infoRecieved(temp);


        },
        error => {
        console.log(error)
        })
  }
  infoRecieved(productImages){
    this.imagesRecieved.emit(productImages)
  }




}
