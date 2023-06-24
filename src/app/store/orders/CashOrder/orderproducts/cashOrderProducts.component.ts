import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy, HostListener} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { orderService } from '@services/order.service';
import { StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";
import {Howl, Howler} from 'howler';

import { AuthenticationService } from '@services/authentication.service';

import {select , Store} from '@ngrx/store';
import {State } from '@stateInterface';
import { SearchProducts , AddProduct , RemoveProduct, ChangeCurrentProduct } from '@/Redux/actions/cashOrder.actions';
import { searchFiltersInitialState } from '@/Redux/state/cashOrder.state';
import { Observable } from 'rxjs/internal/Observable';
import { getAllProducts, getCurrentProduct, getSelectedProducts, getSpinner } from '@selectors/cashOrder.selector';
import { KeyPressDistributionService } from '@store/services/keypress-distribution.service';
import { StoreEventService } from '@store/services/communication.service';
import { StoreEvent } from '@store/models/event';

@Component({
  selector : 'cashorderproducts',
  templateUrl: './cashOrderProducts.component.html',
  styleUrls: ['./cashOrderProducts.component.scss']
})
export class CashOrderProductsComponent implements AfterViewInit , OnInit{
  pageData : any;
  products$ : Observable<any []>;
  products : any = []
  selectedProducts$ : Observable<any []>;
  selectedProducts : any[];
  showSpinner$ : Observable<boolean>;
  showSpinner : boolean = true;
  addProductAjax : Select2AjaxOptions;
  serverImagesPath : string = environment.cloudinary.medium;

  //Single item etails during selection
  selectedProduct$ : Observable<any>;
  selectedProduct : any;
  
  activeX = 0;
  activeY = 0;
  public keyActions: {[key: string]: (evt :StoreEvent) => void} = {
    'k--ArrowLeft': (evt)=>this.handleKeyboardEvent(evt),
    'k--ArrowRight': (evt)=>this.handleKeyboardEvent(evt) ,
    'k--ArrowUp': (evt)=>this.handleKeyboardEvent(evt) ,
    'k--ArrowDown': (evt)=>this.handleKeyboardEvent(evt),
    'k--Enter': (evt)=>this.handleKeyboardEvent(evt)
  };
  keyPressSubscription: Subscription;
 
  constructor( private _orderService : orderService , private $state: StateService ,  private keyService: KeyPressDistributionService ,
    private notifier : NotifierService , private _authService : AuthenticationService , private _eventService : StoreEventService , 
    private store: Store<State>){
    this.pageData = {
      title: 'Products Component for Cash Order Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Cash Order'
        }
      ]
    };
    this.products$ = this.store.select(getAllProducts);
    this.selectedProducts$ =  this.store.select(getSelectedProducts);
    this.showSpinner$ = this.store.select(getSpinner);
    this.selectedProduct$ =  this.store.select(getCurrentProduct);
    this.keyPressSubscription = this._eventService
    .on('KeyPressed')
    .subscribe( (evt : StoreEvent)=>{
      console.log("Cash Order component" , evt , "Action 1", this.keyActions  );
      if (this.keyActions[evt.message.key]){
        this.keyActions[evt.message.key](evt);
      }
    })
  }
  ngOnInit(){
    // super.ngOnInit();
    this.store.dispatch(new SearchProducts(searchFiltersInitialState ));
    this.showSpinner$.subscribe(showSpinner =>{
      console.log("Spinner value changed" , showSpinner);
      this.showSpinner = showSpinner;
    })

     // this.getSum();
     let that = this;
     this.selectedProduct$.subscribe(product =>{ 
         that.selectedProduct = product;
       }
     )
     this.products$.subscribe(products=>{
      this.products = products
     })
  }
  ngAfterViewInit() : void {
    let that = this;
    this.selectedProducts$.subscribe(products =>{ 
        that.selectedProducts = products
      }
    ) 
  }
  ngOnDestroy(): void {
    this.keyPressSubscription.unsubscribe()

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
  addProduct(product , obj){
    let that = this;
    console.log("product object " , obj , "Product " , product );
    //Just in case this product is out of stock
    if(product.quantity_available < 1){
      $(obj).addClass("shake");
      //Just removing class after a bit
      setTimeout( function(){
        $(obj).removeClass("shake");
      },2000 );
      this.notifier.notify("error" , "Product is out of stock");
      let warning ='assets/mp3/warning.wav';
     let success = 'assets/mp3/clearly-602.mp3'
    
    
      //Make sure thr product stock is available
      var sound = new Howl({
        src: [warning],
        volume: 0.1,
        html5: true
      });
      sound.play();
      return ;
    } 
    if(product.inventory_type == "Barcoded"){
      
      this.store.dispatch(new ChangeCurrentProduct(product) );      
      (<any>$("#order-stock-modal")).modal('show');
      $('#order-stock-modal').on('hidden.bs.modal', function () {
        // do something…
        setTimeout(() => {          
          console.log("Modal closed");
          that.store.dispatch(new ChangeCurrentProduct(null) );      
        }, 500);
      })
  
    }else{
      this.store.dispatch(new ChangeCurrentProduct(null) );      
      this.store.dispatch(new AddProduct(product));
    }
  }
  removeProduct(id){
    this.store.dispatch(new RemoveProduct(id));
  }

  currentlyAdded(id){
    return this.selectedProducts && this.selectedProducts.length && this.selectedProducts.map(p=>p._id).includes(id);
  } 
  viewProduct(id){
    this.$state.go("store.productdetail" , {id : id });
  }
  handleKeyboardEvent(event: any){
    let rawEvt = event.message.evt;
    //If user is typing something and dont want to interact with products
    let haveToIgnore = ["order-customer-select", ".customer-select-container" , ".guarantor1-select-container" , ".guarantor2-select-container"].map(clas=>{
      let isInputElemEvt = $(rawEvt.target).closest(clas).length;
      return isInputElemEvt;
    }).filter(Boolean);
    if(haveToIgnore.length){
      return ;
    }
    console.log("Not ignoring : " , event);
    if(!this.selectedProduct){      
        if(rawEvt.keyCode == 37){
          this.activeX = (this.activeX-1);
          if(this.activeX < 0){
            this.activeX = this.products.length - 1;
          }
          setTimeout(() => {
            $('html, body').animate({
              scrollTop: $(".product-active").offset().top-300
          }, 100);
        }, 10);
        }
        if(rawEvt.keyCode == 39){
          this.activeX = (this.activeX+1) % this.products.length;
          setTimeout(() => {
            $('html, body').animate({
              scrollTop: $(".product-active").offset().top-300
          }, 100);
          }, 10);
        }
        if(rawEvt.keyCode == 13){
          let i = this.activeX % this.products.length;
          $("#products-lst").children().eq( i ).find('button').click()
        }
      }
  }

}
