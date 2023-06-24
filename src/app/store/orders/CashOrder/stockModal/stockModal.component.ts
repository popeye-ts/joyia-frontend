import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , OnChanges , SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, ViewRef} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable, Subject, Subscription } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { orderService } from '@services/order.service';
import { NotifierService } from "angular-notifier";
import {  StateService } from '@uirouter/angular';
import { getCurrentProduct, getSelectedClient, getSelectedGuarantors, getSelectedProducts, getSubTotal, getTotal } from '@/Redux/selectors/cashOrder.selector';
import {select , Store} from '@ngrx/store';
import {State } from '@stateInterface';
import { ChangeOrderDiscount, ChangeOrderMarkup, SelectInventoryItems } from '@/Redux/actions/cashOrder.actions';
import { inventoryService } from '@store/services/inventory.service';
import { KeyPressDistributionService } from '@store/services/keypress-distribution.service';
import { StoreEventService } from '@store/services/communication.service';
import { StoreEvent } from '@store/models/event';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector : 'order-stock-modal',
  templateUrl: './stockModal.component.html',
  styleUrls: ['./stockModal.component.scss']
})
export class OrderStockModalComponent implements AfterViewInit , OnInit {
  selectedProduct$ : Observable<any>;
  selectedProduct : any;
  
  stockLst : any = [];
  stockBeingFetched: boolean;
  activeIndex = 0;
  public keyActions: {[key: string]: (evt) => void} = {
    "k--Space": (evt)=>{
      let i = this.activeIndex % this.stockLst.length;
      if(this.stockLst[i].checked){
        this.stockLst[i].checked = false;
      }else{
        this.stockLst[i].checked = true;
      }
    },
    'k--ArrowUp': (evt)=>{
      this.activeIndex--;
      if(this.activeIndex < 0 ){
        this.activeIndex = this.stockLst.length-1;
      }
    } ,
    'k--ArrowDown': (evt)=>{
      this.activeIndex = (this.activeIndex+1) % this.stockLst.length;
    },
    'k--Enter':(evt)=>{
      this.addToCart();
    },
    'k--Escape' : (evt)=>{
      $("order-stock-modal .close").click();
    }
  };
  keyPressSubscription: Subscription;

  constructor(private _productService:productService  , private fb:FormBuilder , private datePipe:DatePipe , private _inventoryService : inventoryService ,
  private _orderService : orderService , private notifier : NotifierService , private $state: StateService ,
  private store: Store<State> , private cd: ChangeDetectorRef ,  private keyService: KeyPressDistributionService , private _eventService : StoreEventService
  ){
    this.keyPressSubscription = this._eventService
    .on('KeyPressed')
    .subscribe( (evt : StoreEvent)=>{
      let isModalShown = $("#order-stock-modal").hasClass("show");
      if (isModalShown && this.keyActions[evt.message.key]) 
        {
          this.keyActions[evt.message.key](evt);
          this.detectChanges();
        }
    })

  }
  detectChanges(){
    if (this.cd && !(this.cd as ViewRef).destroyed) {
      this.cd.detectChanges();
    }
  }

  ngOnInit(){
    let that = this ;
    

    this.selectedProduct$ =  this.store.select(getCurrentProduct);
  }
  ngAfterViewInit() : void {
    // this.getSum();
    let that = this;
    this.selectedProduct$.subscribe(product =>{ 
        that.selectedProduct = product;
        console.log("Selected product stock modal" , that.selectedProduct);
        if(product){
          this.activeIndex = 0;
          this.getStock();
        }
        this.detectChanges();

      }
    )
  }
  ngOnDestroy(): void {
    // super.ngOnDestroy();
    this.keyPressSubscription.unsubscribe()

  }
 
  getStock(){
    let that = this;
    this.stockBeingFetched = true;
    this._inventoryService.viewDetail(that.selectedProduct.inventory_id)
      .subscribe(response => {
        console.log("Fetch Product Inventory Details " , response )
        // that.notifier.notify("success" , "Batch successfuly added.");
        // (<any>$)(".close")[0].click();
        // this.$state.go("store.order");
        this.stockLst = (response.stock || []).map(singleItem=>{
          if(that.selectedProduct.items && that.selectedProduct.items.length){
            let wasChecked = that.selectedProduct.items.some(i=>i._id == singleItem._id);
            if(wasChecked){
              return { ...singleItem , checked : true }
            }
          }
          return singleItem
        });
        this.stockBeingFetched = false;
        this.cd.markForCheck();
    } , rspErr => {
      console.log(rspErr)
      that.notifier.notify("error" , rspErr.error);
      this.stockBeingFetched = false;

    })
  }
  generateMarkup(lst : any[]){
    console.log("List >>>>>" , lst );
    if(!lst){
      lst = [];
    }
    return lst.map( (bc:string)=>`<button class="btn btn-badge">${bc}</button`).join();
  }
  itemChecked(invItem : any , index : number , $evt : any){
    console.log("Item checked " , invItem  , " index " , index , " Event " , $evt );
    this.stockLst [index].checked = $evt.target.checked;
  }
  addToCart(){
    let { _id , inventory_id , name , price , quantity_available } = this.selectedProduct;
    let dataToAdd = {
      product_id : _id , 
      inventory_id ,
      ... this.selectedProduct ,
      items : this.stockLst.filter(item=>item.checked)
    }
    if(!dataToAdd.items || dataToAdd.items.length == 0){
      this.notifier.notify("error" , "Please select items to add to cart.");
      return ;
    }
    console.log("Items selected :" , dataToAdd )
    $("order-stock-modal .close").click()  
    this.store.dispatch(new SelectInventoryItems(dataToAdd) );
  }  
}
