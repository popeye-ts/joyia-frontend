import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  } from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup ,FormControl , FormArray } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import { Select2OptionData } from 'ng2-select2';
import { AuthenticationService } from '@store/services/authentication.service';

@Component({
  selector : 'orderForm',
  templateUrl: './orderForm.component.html',
  styleUrls: ['./orderForm.component.scss']
})
export class orderFormComponent implements AfterViewInit , OnInit{
  pageData : any;
  data : any ;
  orderForm : FormGroup ;
  active : Number ;
  serverImagesPath : string = environment.apiUrl+"uploads/";
  public addProductAjax : Select2AjaxOptions;

  constructor(private _productService:productService  , private fb:FormBuilder , private notifier : NotifierService, private _authService: AuthenticationService ){
  }
  ngOnInit(){
    let that = this ;
      // this.ProductForm =his.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
    // Details Images
    this.orderForm =     new FormGroup({
            product : new FormControl(''),
            quantity : new FormControl([]),
            price : new FormControl('')
        });
    //Taking care of authorization
    let access_token = this._authService.token;

    let session = sessionStorage.getItem('session') || '';

    //Add product quantity options
    this.addProductAjax = {
      url : environment.apiUrl+'product/getlist' ,
      dataType : 'json' ,
      delay : 250 ,
      cache : false ,
      headers : {
        "Authorization" : "Bearer "+access_token,
        session
      },
      data : (params : any) => {
        console.log("Ajax Select 2" , params);
        return {
          search : params.term
        }
      },
      processResults : (data : any) => {
        console.log("Ajax Select 2 results " , data);
        return {
          results : $.map(data , function(obj){
              return {id:obj._id , text: obj.product_display_name}
          })
        }
      }
    };
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
                      }else{
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
  selectProductChanged(event){
    console.log("Event triggered")
  }

}
