import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  } from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from './../../services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";

@Component({
  selector : 'otherStatsRight',
  templateUrl: './otherStatsRight.component.html',
  styleUrls: ['./otherStatsRight.component.scss']
})
export class otherStatsRightComponent implements AfterViewInit , OnInit{
  pageData : any;
  @Input('id') _id : any  ;
  data : any ;
  ProductForm : FormGroup ;
  active : Number ;
  inventoryInfoExists : boolean = true;
  serverImagesPath : string = environment.apiUrl+"uploads/";

  constructor(private _productService:productService  , private fb:FormBuilder , private notifier : NotifierService){
    this.pageData = {
      title: 'All Products',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Product'
        },
        {
          title: 'Product Detail'
        }
      ]
    };
    this.active = 1;
  }
  ngOnInit(){
    let that = this ;
    if(this._id)
    {
      this.fetchDetail(this._id);
    }
      // this.ProductForm =his.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
    // Details Images

}

  fetchDetail(id): void {
    let that = this;
    that.data = {};
    this._productService.viewDetail(id).
          subscribe(
            response =>
              {
                console.log("response from inventory detail of product" , response) ;
                if(response.length === 0)
                  {
                    this.data.quantityAvailable= 0;
                    // Sorry invalid details required
                  }
                else
                    {
                      //check if there is some info in inventory

                      //if there is no info then fetch product info

                      //we have info in inventory
                      if(response[0].product)
                      {
                        that.data = response[0].product;
                        that.data.quantityAvailable = response[0].quantity_available;
                        that.data.endDate = response[0].end_date;
                        that.data.lastSupply = response[0].last_supply_date;
                        that.pageData.breadcrumbs.push({title : ''+response[0].product.product_display_name});
                        console.log("Product details",response[0].product , "other response", response[0].product);
                      }else{
                        that.inventoryInfoExists = false;
                        that.data = response[0];
                      }
                    }

              } ,
            error =>
              {
                console.log("response", error);
              }
            );
      console.log("Data after initialized" , this.data);
  }
  ngAfterViewInit() : void {

  }
  ngOnDestroy(): void {

  }

}
