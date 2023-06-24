import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , OnChanges , SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, ViewRef} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { orderService } from '@services/order.service';
import { NotifierService } from "angular-notifier";
import {  StateService } from '@uirouter/angular';
import { getSelectedClient, getSelectedGuarantors, getSelectedOrder, getSelectedProducts, getSubTotal, getTotal } from '@/Redux/selectors/cashOrder.selector';
import {select , Store} from '@ngrx/store';
import {State } from '@stateInterface';
import { ChangeOrderDiscount, ChangeOrderMarkup, ClearCart } from '@/Redux/actions/cashOrder.actions';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector : 'order-complete-modal',
  templateUrl: './orderCompleteModal.component.html',
  styleUrls: ['./orderCompleteModal.component.scss']
})
export class OrderCompleteModalComponent implements AfterViewInit , OnInit {
  pageData : any;
  ProductForm : FormGroup ;
  currentDate : Number;

  selectedProducts$ : Observable<any []>;
  selectedProducts : any[];
  
  total$: Observable<number>;
  totalAmount: number = 0;
  subTotal$: Observable<number>;
  subTotalAmount: number = 0;
 
  selectedClient$: Observable<any>;
  selectedClient: any;
  selectedGuarantor$: Observable<any[]>;
  selectedGuarantors : any = [];
  selectedOrder$: Observable<any> ;
  selectedOrder: any = null;

  beingOrderSubmitted: boolean = false;
  constructor(private _productService:productService  , private fb:FormBuilder , private datePipe:DatePipe ,
  private _orderService : orderService , private notifier : NotifierService , private $state: StateService ,
  private store: Store<State> , private cd: ChangeDetectorRef
  ){
    this.pageData = {
      title: 'Confirm Order Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Order'
        }
      ]
    };
    this.selectedOrder$ =  this.store.select(getSelectedOrder );
    this.selectedOrder$.subscribe(order => this.selectedOrder = order);

  }
  ngOnInit(){
    let that = this ;

    this.currentDate = Date.now();
    // this.ProductForm = this.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
    // console.log("Month from now"  , that.monthFromNow());
    (<any>$)("input.datepicker").datepicker({
       autoclose: true,
       rtl: false,
       templates: {
         leftArrow: '<i class="simple-icon-arrow-left"></i>',
         rightArrow: '<i class="simple-icon-arrow-right"></i>'
       } ,
       format : "dd/mm/yyyy" ,
       startDate : "+2d",
     }).datepicker("update" , that.monthFromNow());
     this.selectedProducts$ =  this.store.select(getSelectedProducts);
     this.total$ =  this.store.select(getTotal );
     this.subTotal$ =  this.store.select(getSubTotal );
  }
  monthFromNow(){
    let d= new Date();
    d.setMonth(d.getMonth()+1);
    return this.datePipe.transform(d , 'dd/MM/yyyy');
  }
  detectChanges(){
    if (this.cd && !(this.cd as ViewRef).destroyed) {
      this.cd.detectChanges();
    }
  }
  ngAfterViewInit() : void {
    // this.getSum();
    let that = this;
    this.selectedProducts$.subscribe(products =>{ 
        that.selectedProducts = products;
        console.log("Selected orders complete modal" , that.selectedProducts )
        this.detectChanges();
      }
    )
    this.total$.subscribe(total=>{
      this.totalAmount = total;
      this.detectChanges();
    });
    this.subTotal$.subscribe(st=>{
      this.subTotalAmount = st;
      this.detectChanges();
    });

    this.selectedClient$ = this.store.select(getSelectedClient );
    this.selectedClient$.subscribe(client=>{
      this.selectedClient = client ? client : null;
      console.log("Selected client complete modal", this.selectedClient )
      this.detectChanges();

    })

    this.selectedGuarantor$ = this.store.select(getSelectedGuarantors );
    this.selectedGuarantor$.subscribe(guarantors=>{
      this.selectedGuarantors = guarantors.filter(Boolean);
      console.log("Selected guarantors list modal", this.selectedGuarantors );
      this.detectChanges();
    })

  }
  ngOnDestroy(): void {

  }
  
  markupChanged(product_id  , event){
    let value= event.target.value;
    if(value < 0 )
      return ;
      
    this.store.dispatch(new ChangeOrderMarkup({product_id , markup : value }));

  }
  discountChanged(product_id  , event){
    let value =event.target.value;
    if(value < 1)
      return ;

    this.store.dispatch(new ChangeOrderDiscount({product_id , discount : value }));
    // this.getSum()
  }
  addOrder(){
    let that = this;
    if(that.beingOrderSubmitted){
      that.notifier.notify("error" , "Please wait order is already submitted");
    }
    let dataToSend = {};

    //for each of the vehicle we have a variety of products
    //where each product has an engine no , chassis no etc
    //getting the datils of these
    //check advance amount
    if($("#advanceInput").val()< 1)
    {
      $("#advanceInput").focus()
      //Show on page that the product is already added
      $('#advanceInput').addClass("shake")
        //Just removing class after a bit
      setTimeout( function(){
          $('#advanceInput').removeClass("shake");
        },2000 )
      return ;
    }
    let inp = (<any>$)(".datepicker")[0];
    let advance = (<any>$)("#advanceInput")[0];

    dataToSend['products'] = this.selectedProducts.map(product=>{
      return {
        _id: product._id,
        product_id: product.product_id ,
        inventory_id: product.inventory_id ,
        price: product.price ,
        price_calculated: product.price_calculated ,
        name: product.name ,
        quantity: product.quantity ,
        quantity_available: product.quantity_available ,
        items : product.items ,
        recieved: product.recieved ,
        markup: product.markup ,
        discount: product.discount  
      }
    });
    dataToSend['nextPaymentDate'] = inp.value;
    dataToSend['description'] = "Temporary desc";
    dataToSend['advance'] = advance.value;

    //Two cases possible
    //One we have to add a batch to already created order
    // console.log("Order id we have ::" , this.order_id , that.order_id);
    if(this.selectedOrder){
      dataToSend["orderId"] = this.selectedOrder._id;
      this.addBatch(dataToSend);
      return ;
    }

    //Second we have to add a completely new order
    dataToSend['client_id'] = this.selectedClient._id;
    dataToSend['guarantors'] = that.selectedGuarantors.map(g=>g._id);
    this.createNewOrder(dataToSend);
  }
  addBatch(data){
    let that = this;
    this._orderService.addBatch(data).subscribe(response => {
        that.notifier.notify("success" , "Batch successfuly added.");
        (<any>$)(".close")[0].click();
        this.$state.go("store.order");
    } , rspErr => {
      console.log(rspErr)
        that.notifier.notify("error" , rspErr.error);
    })
  }
  createNewOrder(data){
    let that = this ;
    that.beingOrderSubmitted = true;
    this._orderService.createInstallmentOrder(data).subscribe(response => {
      that.beingOrderSubmitted = false;

        that.notifier.notify("success" , "Order successfuly added.");
        (<any>$)(".close")[0].click();
        this.$state.go("store.order");
        this.store.dispatch(new ClearCart());
    } , rspErr => {
      console.log(rspErr)
      that.beingOrderSubmitted = false;
      that.notifier.notify("error" , rspErr.error);
    })
  }
}
