import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , OnChanges , SimpleChanges} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { orderService } from '@services/order.service';
import { NotifierService } from "angular-notifier";
import {  StateService } from '@uirouter/angular';

@Component({
  selector : 'confirmorder',
  templateUrl: './confirmModal.component.html',
  styleUrls: ['./confirmModal.component.scss']
})
export class ConfirmOrderComponent implements AfterViewInit , OnInit , OnChanges{
  pageData : any;
  ProductForm : FormGroup ;
  currentDate : Number;
  totalCharges : Number = 0;


  @Input() products : any;
  @Input() quantity : any;
  @Input() client : any ;
  @Input() guarantors :any;
  @Input() order_id : string; //After revolution of batches in orders order id will be passed
  @Input() description : string;
  productsArray : Array<any> = [] ;
  productsTemp : any;
  @Input() resetClient : number;
  @Input() resetGuarantors : number;
  @Input() resetProducts : number;
  markup : number = 45;
  charges : Array<any> = [];
  constructor(private _productService:productService  , private fb:FormBuilder , private datePipe:DatePipe ,
  private _orderService : orderService , private notifier : NotifierService , private $state: StateService ){
    this.pageData = {
      title: 'Confirm Order Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Order'
        }
      ]
    };

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
  }
  monthFromNow(){
    let d= new Date();
    d.setMonth(d.getMonth()+1);
    return this.datePipe.transform(d , 'dd/MM/yyyy');
  }
  ngAfterViewInit() : void {
    this.getSum()

  }
  ngOnDestroy(): void {

  }
  getSum(){
    let that = this;
    this.totalCharges =0;

    // console.log("In get sum method" , this.charges ,"In modall component the length of selects right now" , $('.custom-select').length)
    for(let i in this.charges){
      that.totalCharges+= isNaN(this.charges[i].charges) ? 0 : this.charges[i].charges;
    };
  }
  makeUnique(){
    // this.products = Array.from(new Set(this.products));
    let temp = [];
    let that=this;
    let productsTemp = [];
    //Also getting the charges array initialized
    this.charges = [];
    this.products.forEach(element => {
      // console.log("okok"  , element)
      if(temp.indexOf(element._id) == -1)
        {
          temp.push(element._id)
          productsTemp.push(element)
        }
    });
    productsTemp.forEach(product => {
      that.charges[product._id] = new Array();
      that.charges[product._id].each = (product.price ? product.price.sale_price : 0)
      that.charges[product._id].charges= that.quantity[product._id] * ( (product.price ? product.price.sale_price : 0) || 0)
      that.charges[product._id].discount = 0;
      that.charges[product._id].quantity = that.quantity[product._id];
      that.charges[product._id].markup = that.markup;
      //Claculating the markup and replacing the charges
      that.charges[product._id].charges += ( that.markup / 100 * that.charges[product._id].charges)
    });
    console.log(this.products,"After making products unique" , productsTemp  , this.charges);
    this.productsTemp = productsTemp;
  }
  ngOnChanges(changes){
    console.log("In modal component changes " , changes)
    if(changes.client && changes.client.currentValue)
    {
      //check if its a form filled value
      if( changes.client.currentValue._id)
        this.client = changes.client.currentValue;
      else
        this.client = {
          personal_info : changes.client.currentValue
        }
    }
    if(changes.products && changes.products.currentValue)
    {
      this.products  = changes.products.currentValue;
      this.getSum();
      this.makeUnique()
    }
    if(changes.guarantors && changes.guarantors.currentValue)
    {
      console.log("In modal now guaranrs values :" , changes.guarantors.currentValue )
      this.guarantors  = changes.guarantors.currentValue;
    }
    if(changes.quantity)
      {
        this.quantity;
        this.makeUnique();
        this.getSum();
      }
    if(changes.resetClient && changes.resetClient.currentValue )
    {
      this.client =  null;
    }
    if(changes.resetProducts && changes.resetProducts.currentValue)
    {
      this.productsTemp = null;
    }
    if(changes.resetGuarantors && changes.resetGuarantors.currentValue)
    {
      // console.log("In modal component i am gonna reset guarantors" , this.guarantors)
      this.guarantors = null;
    }
    if(changes.description && changes.description.currentValue )
    {
      this.description = changes.description.currentValue;
    }
    if(changes.order_id && changes.order_id.currentValue )
    {
      this.order_id = changes.order_id.currentValue;
    }


  }
  markupChanged(event){
    let id= event.target.attributes.data.value;
    let value= event.target.value;
    if(value < 0 )
      return ;
    this.charges[id].charges =this.quantity[id] * (this.charges[id].each +(this.charges[id].each * value / 100) )
    this.charges[id].markup = value;
    this.getSum()
  }
  discountChanged(event){
    let id= event.target.attributes.data.value;
    let value =event.target.value;
    if(value < 1)
      return ;
    this.charges[id].charges = this.charges[id].charges - value;
    this.charges[id].discount = value;
    this.getSum()
  }
  addOrder(){
    let that = this;
    let dataToSend = {};

    //for each of the vehicle we have a variety of products
    //where each product has an engine no , chassis no etc
    //getting the datils of these
    let selectedVehilesFromVarieties =  $('.custom-select').toArray();
    dataToSend['tempParticularIds'] = []
    selectedVehilesFromVarieties.forEach( veh => {
      dataToSend['tempParticularIds'].push( (<any>veh).value)
    });
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
    console.log("Client Info" ,
    this.client , "Guarantor Info" ,
    this.guarantors , " Products Info" ,
    this.products , "All Charges" ,
    this.charges , "Next payment date" , (<any>$)(".datepicker")[0] , "advance" , (<any>$)("#advanceInput"));
    let inp = (<any>$)(".datepicker")[0];
    let advance = (<any>$)("#advanceInput")[0];
    let chargesTemp = Object.entries(this.charges );
    let charges = [];
    chargesTemp.forEach(c => {
      console.log("Each charge" , c);
       let obj = {
         id : c[0],
         each : c[1].each ,
         charges : c[1].charges,
         discount  : c[1].discount,
         markup : c[1].markup ,
         quantity : c[1].quantity
       };

      return charges.push(obj)
    })
    dataToSend['charges'] = charges;
    dataToSend['nextPaymentDate'] = inp.value;
    dataToSend['description'] = this.description;
    dataToSend['advance'] = advance.value;

    //Two cases possible
    //One we have to add a batch to already created order
    console.log("Order id we have ::" , this.order_id , that.order_id);
    if(this.order_id){
      dataToSend["orderId"] = this.order_id;
      this.addBatch(dataToSend);
      return ;
    }

    //Second we have to add a completely new order
    dataToSend['client'] = this.client._id ? this.client._id : this.client;
    dataToSend['guarantors'] = that.guarantors
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
    this._orderService.create(data).subscribe(response => {
        that.notifier.notify("success" , "Order successfuly added.");
        (<any>$)(".close")[0].click();
        this.$state.go("store.order");
    } , rspErr => {
      console.log(rspErr)
        that.notifier.notify("error" , rspErr.error);
    })
  }
}
