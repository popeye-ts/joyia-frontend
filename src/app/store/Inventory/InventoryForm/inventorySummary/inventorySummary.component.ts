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
import { getSelectedProducts  , getTotal , getDiscount , getSubTotal , getTax , getOrderCompletionStatus } from '@/Redux/selectors/cashOrder.selector';

import { QuantityDecreased , QuantityIncreased, RemoveProduct , ClearCart , SubmitOrder, RecievedAmountChanged} from '@/Redux/actions/cashOrder.actions';

@Component({
  selector : 'inventorySummary',
  templateUrl: './inventorySummary.component.html',
  styleUrls: ['./inventorySummary.component.scss']
})

export class InventorySummaryComponent implements AfterViewInit , OnInit{
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

  }
  ngAfterViewInit() : void {
    if (typeof PerfectScrollbar !== "undefined") {
      var chatAppScroll;
      $(".scroll").each(function () {
        console.log("Gonna add perfection to scroll bar " , $(this)[0] )
        var ps = new PerfectScrollbar($(this)[0]);
      });
    }
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
    let productsSelected = this.selectedProducts.map(p=>({id: p._id , quantity : p.quantity , price_each : p.price , recieved : (p.recieved || (~~p.quantity * ~~p.price) )}));
    let data = { products : productsSelected };
    this.store.dispatch(new SubmitOrder(data));
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
}
