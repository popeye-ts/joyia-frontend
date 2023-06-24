import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormControl , FormArray , Validators } from '@angular/forms';
import { orderService } from '@services/order.service';
import {  StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";
import PerfectScrollbar from 'perfect-scrollbar';
import { AuthenticationService } from '@services/authentication.service';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { getSelectedProducts  , getTotal , getDiscount , getSubTotal , getTax , getOrderCompletionStatus, getOrderType, getSelectedClient, getSelectedGuarantors, getSelectedOrder } from '@/Redux/selectors/cashOrder.selector';

import { QuantityDecreased , QuantityIncreased, RemoveProduct , ClearCart , SubmitOrder, RecievedAmountChanged, ChangeOrderType, ChangeCurrentProduct} from '@/Redux/actions/cashOrder.actions';
declare var $: any;

@Component({
  selector : 'cashordersummary',
  templateUrl: './cashOrderSummary.component.html',
  styleUrls: ['./cashOrderSummary.component.scss']
})

export class CashOrderSummaryComponent implements AfterViewInit , OnInit{
  pageData : any;
  total$ : Observable<number>;
  subTotal$ : Observable<number>;
  discount$ : Observable<number>;
  tax$ : Observable<number>;
  isComplete$ : Observable<boolean>;
  errorOccured$ : Observable<boolean>;

  products$ : Observable<any []>;
  orderSubmissionState$ : Observable<string>;

  addProductAjax : Select2AjaxOptions;
  serverImagesPath : string = environment.cloudinary.medium;
  selectedProducts : any[];
  someProductsSelected : boolean = false;
  totalAmount  : number = 0;
  orderType$: Observable<string>;
  orderType: string;
  selectedClient$: Observable<any>;
  selectedClient: any;
  selectedGuarantor$: Observable<any[]>;
  selectedGuarantors : any = [];
  selectedOrder$: Observable<any> ;
  selectedOrder: any = null;

  constructor(private _productService:productService  , private fb:FormBuilder , private _orderService : orderService ,
    private $state: StateService ,  private notifier : NotifierService , private _authService : AuthenticationService ,
    private store: Store<State> ){
    this.pageData = {
      title: 'Products Component for Cash Order Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Cash Order'
        }
      ]
    };
    this.products$ = this.store.select(getSelectedProducts);
    //Binding observable to local variables 
    this.products$.subscribe(product => this.selectedProducts = product);

    this.selectedOrder$ =  this.store.select(getSelectedOrder );
    this.selectedOrder$.subscribe(order => this.selectedOrder = order);

    //Getting summary Info
    this.total$ =  this.store.select(getTotal );
    this.subTotal$ = this.store.select(getSubTotal );
    this.tax$ = this.store.select( getTax);
    this.discount$ = this.store.select(getDiscount );
    this.orderSubmissionState$ = this.store.select(getOrderCompletionStatus );
  }
  ngOnInit(){
    this.products$.subscribe(products=>{
      this.someProductsSelected = !!(products && products.length ) || false;
    })
    this.total$.subscribe(total=>this.totalAmount = total);
    this.orderType$ = this.store.select(getOrderType );
    this.orderType$.subscribe(type=>{
      this.orderType = type;
    })
  }
  ngAfterViewInit() : void {
    if (typeof PerfectScrollbar !== "undefined") {
      var chatAppScroll;
      $(".scroll").each(function () {
        console.log("Gonna add perfection to scroll bar " , $(this)[0] )
        var ps = new PerfectScrollbar($(this)[0]);
      });
    }
    this.total$.subscribe(total=>this.totalAmount = total);
    this.selectedClient$ = this.store.select(getSelectedClient );
    this.selectedClient$.subscribe(client=>{
      this.selectedClient = client ? client : {};
    })

    this.selectedGuarantor$ = this.store.select(getSelectedGuarantors );
    this.selectedGuarantor$.subscribe(guarantors=>{
      this.selectedGuarantors = guarantors;
      console.log("Selected guarantors list modal", this.selectedGuarantors );
    })


  }
  ngOnDestroy(): void {

  }
  //Show on page that the product is already added
  showAlreadyAdded(index){
    $($('#selectedProducts').children()[index] ).addClass("shake")
    //Just removing class after a bit
    setTimeout( function(){
      $($('#selectedProducts').children()[index] ).removeClass("shake");
    },2000 )
  }
  //tracking the quantity change
  quantityChanged(id , typeOfAction){
    if(typeOfAction == 'add'){
      this.store.dispatch(new QuantityIncreased(id));
    }else{
      this.store.dispatch(new QuantityDecreased(id));
    }
  }
  completeOrder(){
    console.log("selected products" , this.selectedProducts );
    //Decide the type of order
    let productsSelected = this.selectedProducts.map(p=>({id: p._id , quantity : p.quantity , price_each : p.price , recieved : (p.recieved || (~~p.quantity * ~~p.price) )}));
    if(!productsSelected || (productsSelected && productsSelected.length ==0)){
      this.notifier.notify("error" , "Please select products to create an order");
      return ;
    }

    if(this.orderType == "Installment Order"){
      console.log("Installment order it is ")
  
      this.completeInstallmentOrder()
    }else{
      let data = { 
        products : productsSelected 
      };
      this.store.dispatch(new SubmitOrder(data));
    }
  }
  completeInstallmentOrder(){
    try{
      let isBatchForm = this.selectedOrder && this.selectedOrder.order_id;
      if(isBatchForm){
        // If user is willing to add batch
        // It means that we haev client / guarantors already part of order
        $("#order-complete-modal").modal('show');
        return ;
      }
      if(!this.selectedClient || !this.selectedClient._id){
        throw "Please select a client";
      }
      let isGuarantorSelected = !!(this.selectedGuarantors && this.selectedGuarantors.length ) || false;;
      if(!isGuarantorSelected){
        throw "Please select a guarantor";
      }  
      let productsSelected = this.selectedProducts.map(p=>({id: p._id , quantity : p.quantity , price_each : p.price , recieved : (p.recieved || (~~p.quantity * ~~p.price) )}));
      if(!this.someProductsSelected){
        throw "Please select a product";
      }

      let data = { 
        products : productsSelected ,
        client : this.selectedClient ,
        guarantors : this.selectedGuarantors
      };
      console.log("Before modal show object" , data );
      $("#order-complete-modal").modal('show');
    }catch(error){
      if(typeof error == 'string'){
        this.notifier.notify("error" , error);
      }else{
        console.log("Error occured while adding installment order " , error )
      }

    }
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
  removeProduct(id){
    this.store.dispatch(new RemoveProduct(id));
  }
  resetCart(){
    this.store.dispatch(new ClearCart());
  }
  discountChanged(event , id){
    let keyCode  = event.which;
    let str = event.target.innerText;
    if(keyCode == 13){
      $(event.target).blur();
    }
    if([8 , 37 , 38 ,39 , 40].includes(keyCode )){
      return ;
    }
    if(str.length > 11 && keyCode !=8)
      {
        event.preventDefault();
        return ;
      }

    //If its not a number prvenet from writing
    if( keyCode < 48 || keyCode > 57)
      event.preventDefault();
    setTimeout(() => {
      this.checkDiscountVal(event.target , id );    
    }, 100); 
  }
  
  checkDiscountVal(target , id ){
    console.log("Check discount :" , target , id );
    let str = target.innerText;
    let number = ~~str;

    let productInfo : any = this.selectedProducts.filter(p=>p._id == id);
    if(!productInfo || productInfo.length == 0){
      console.log("Product not found in selected products" , id );
      return ;
    }
    productInfo = productInfo.pop();

    if(number > productInfo.price_calculated ){
      target.innerText = productInfo.price_calculated;
    }
    //Dispatch action that recieved amount is changed
    this.store.dispatch(new RecievedAmountChanged({product_id : id , amount : target.innerText }));

    
  }
  changeOrderType(type , evt ){
    if(this.selectedOrder && this.selectedOrder.order_id){
      this.notifier.notify("error" , "You cant change order type while adding batch.");
    }else{
      this.store.dispatch(new ChangeOrderType(evt.target.innerText ));
    }
  }
  changeInventoryItemsModal(productInfo : any){
    console.log("Produtc info to change" , productInfo );
    this.store.dispatch(new ChangeCurrentProduct(productInfo) );      
    (<any>$("#order-stock-modal")).modal('show');
  }
}
