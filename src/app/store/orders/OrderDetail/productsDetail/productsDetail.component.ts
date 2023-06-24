import { Component,OnInit,OnDestroy,AfterViewInit,ViewChild,Input , OnChanges , EventEmitter , Output } from "@angular/core";

import { Subject } from 'rxjs';
import { FormBuilder , FormGroup,FormControl  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { productService } from '@services/product.service';
// import { productInterface } from '@interfaces/orderDetailProduct.interface';

@Component({
  selector:"productsDetail",
  templateUrl:"./productsDetail.component.html",
  styleUrls:["./productsDetail.component.scss"]
})

export class ProductsDetailComponent  implements OnInit , AfterViewInit ,OnDestroy , OnChanges{

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
      console.log("In order detail component the information which is being passed is " , this.productsData );

      this.getProductstData();
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

              //Since we have the information we can now adjust the row detail functionality of table rows
              setTimeout(() => {
                  $('.accordion-toggle').click(function(){
                  	$('.hiddenRow').hide();
                  	$(this).next('tr').find('.hiddenRow').show();
                  });
                }, 10);

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
