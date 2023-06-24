import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormControl , FormArray , Validators } from '@angular/forms';
import { orderService } from '@services/order.service';
import {  StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";

import { AuthenticationService } from '@services/authentication.service';
import { Store } from '@ngrx/store';
import { State } from '@/Redux/state';
import { showSpinner } from '@/Redux/actions/spinner.actions';
import { SearchByText, SelectOrder } from '@/Redux/actions/cashOrder.actions';
import { BarcodeScanned } from '@/Redux/actions/inventory.actions';
import { getSelectedOrder } from '@/Redux/selectors/cashOrder.selector';

@Component({
  selector : 'cashorderform',
  templateUrl: './cashOrderForm.component.html',
  styleUrls: ['./cashOrderForm.component.scss']
})
export class CashOrderFormComponent implements AfterViewInit , OnInit{
  pageData : any;
  products : Array<any> = [];
  orderForm : FormGroup ;
  searchForm : FormGroup ;
  shownSpinner : Boolean;
  addProductAjax : Select2AjaxOptions;
  currentlySelected : string ;
  total : Number = 0;
  totalRecieved : Number = 0;
  clientForm : FormGroup ;
  selectedOrder$: any = null ;
  constructor(private _productService:productService  , private fb:FormBuilder , private _orderService : orderService ,
    private $state: StateService ,  private notifier : NotifierService , private _authService : AuthenticationService , 
    private store: Store<State>){
    this.pageData = {
      title: 'Add Cash Order Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Order'
        }
      ]
    };
    // store.replaceReducer(appReducerWithBlog);
    this.selectedOrder$ =  this.store.select(getSelectedOrder );

  }
  ngOnInit(){
    let that = this ;
      // this.ProductForm = this.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
    this.orderForm = new FormGroup({
            products : new FormArray([
              new FormControl('')
            ]),
            quantities : new FormArray ([
              new FormControl()
            ]),
            prices : new FormArray([
               new FormControl('')
             ])
        });
    //client form
    this.clientForm = this.fb.group({
      name: ['' , Validators.required] ,
      phone :['' ] ,
      address : ['' , ],
      cnic :  ['' ],
      fName : ['' , ],
      fCnic : ['' , ]
    });
    //Product options AJAX
    let access_token = this._authService.token;
    let session = sessionStorage.getItem('session') || '';

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
      } ,

    };
    this.bindScanner();
  }
  ngAfterViewInit() : void {

  }
  bindScanner(){
    let code = "";
    let reading = false;

    window.addEventListener('keypress', e => {
      //usually scanners throw an 'Enter' key at the end of read
      if (e.keyCode === 13) {
          if(code.length > 10) {
              $("#search-inp").val(code);
              console.log("Cash Order : Dispatcing #" , code);
              /// code ready to use SearchByText
              this.store.dispatch(new BarcodeScanned(code));

              code = "";
          }
        } else {
            code += e.key; //while this is not an 'enter' it stores the every key            
        }

        //run a timeout of 200ms at the first read and clear everything
        if(!reading) {
            reading = true;
            setTimeout(() => {
                code = "";
                reading = false;
            }, 200);  //200 works fine for me but you can adjust it
        }
    });
  }
  fetchDetail(id): void {
    let that = this;
     this._productService.viewDetail(id).
          subscribe(
            response =>
              {
                if(response.length != 0)
                  {
                    console.log("The cash order " , response);
                    //if the product is already added then we might have an index otherwise -1
                    let index = that.isAlreadyAdded(id);
                    if( index != -1)
                      that.showAlreadyAdded(index)
                    else
                      {
                        response.quantity = 1
                        response.recieved = (response.product?response.product : response).price.sale_price
                        that.products.push(response)
                        that.calculateTotalRecieved()
                      }
                  }
              } ,
            error =>
              {
                console.log("response", error);
              }
            );
  }
  ngOnDestroy(): void {

  }
  //Helper methods
  addProduct(){
    //Show loading icon
    // this.store.dispatch(new showSpinner());
    this.fetchDetail(this.currentlySelected)
  }
  //Show on page that the product is already added
  showAlreadyAdded(index){
    $($('#selectedProducts').children()[index] ).addClass("shake")
    //Just removing class after a bit
    setTimeout( function(){
      $($('#selectedProducts').children()[index] ).removeClass("shake");
    },2000 )
  }
  //The method is called when a user selects a product
  productSelected(event){
    console.log(event)
    this.currentlySelected = event.value ;
    // alert(event.value)
  }
  //Checks if the user has already selected a product
  isAlreadyAdded(id)
  {
    let indexToReturn = -1;
    this.products.forEach((p ,index) => {
      if(id == p.product._id)
        {
          indexToReturn = index;
        }
    });
    return indexToReturn;
  }
  //tracking the quantity change
  quantityChanged(event , index){
    //setting the quantity accordingly
    this.products[index].quantity = event.target.textContent

    //updating info
    this.calculateTotalRecieved()

  }
  //validating the quantity
  validateNumber(event , index)
  {
    //check if the user enterred a number
    if(event.which <48 || event.which > 57)
    {
      event.preventDefault()
      return
    }

  }
  //on changing recieved amount
  amountRecieved(event , index){
    //setting the amount recieved accordingly
    this.products[index].recieved = event.target.textContent
    this.calculateTotalRecieved()
  }
  calculateTotalRecieved(){
    this.totalRecieved = this.products.reduce(function(sum , currVal){
      return parseInt(currVal.recieved) + sum
    } , 0)

    this.total = this.products.reduce(function(sum , currVal ) {
      return parseInt( (currVal.product? currVal.product : currVal).price.sale_price)*(currVal.quantity) + sum
    } , 0)
    console.log("total"  , this.total)
  }
  completeOrder(){
    let that = this
    //Making an array for data to be sent
    let data = {}

    //Selected products are being added
    data['products'] = []
    this.products.forEach((p)=>{
      data['products'].push({
        id : p.product._id,
        quantity : p.quantity,
        recieved : p.recieved,
        price_each : (p.product? p.product : p).price.sale_price
      })
    })
    data['description'] = $("#description").val()
    data['client'] = this.clientForm.value
    //The array will now be submitted
    this._orderService.createCash(data).subscribe(response => {
        that.notifier.notify("success" , "Order successfuly added.");
        (<any>$)(".close")[0].click();
        this.$state.go("order");
    } , err => {
        that.notifier.notify("error" , "Something went wrong while adding order");
    })
  }
  removeSelectedOrder(){
    this.store.dispatch(new SelectOrder(null));
  }

}
