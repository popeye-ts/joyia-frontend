import {Component , OnInit , ViewChild , ViewChildren , QueryList , AfterViewInit , OnDestroy , Input } from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';

@Component({
  selector : 'batchForm',
  templateUrl: './batchForm.component.html',
  styleUrls: ['./batchForm.component.scss']
})
export class BatchFormComponent implements AfterViewInit , OnInit{
  @Input('id') _id; //order id
  pageData : any;
  BatchForm : FormGroup ;
  active : Number ;
  currentlySelectedStep : number = 1;
  selectedOrder  : any;
  products : Array<any> = [];
  selectedProductTemp : any;
  productsQuantity : any;
  desc: string = '';
  resetProducts : number = 0;

  constructor(private _productService:productService  , private fb:FormBuilder){
    this.pageData = {
      title: 'Add Batch Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Order'
        }
      ]
    };
    this.active = 1;
  }
  ngOnInit(){
    // console.log("Initializing batch form " , this._id );
    let that = this ;
      // this.BatchForm = this.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
  }
  ngAfterViewInit() : void {
    let that = this;
  }

  ngOnDestroy(): void {
  }
  calculateQuantity(){
    this.productsQuantity = {};
    this.products.forEach(product => {
      this.productsQuantity[product._id] =  (this.productsQuantity[product._id] || 0) +1;
        if(product.quantity_available < this.productsQuantity[product._id] )
          this.productsQuantity[product._id] = product.quantity_available;
    })

  }
  removeProduct(prod)
  {
    console.log("In batch form component  the products array" , this.products  )
    let productsTemp = this.products.filter(function(obj){ return obj._id !== prod._id  })
    console.log("Temp array in batch form " , productsTemp)
    this.products = productsTemp
    console.log("In batch form Component the products array after" , this.products)
    this.selectedProductTemp = undefined
  }
  reset(){
    ++this.resetProducts;
  }
  validate(){
    let that = this

    //check atleast one product selected
    if(this.products == undefined || this.products.length == 0)
      return true
    return false;
  }
  descChanged(event)
  {
    this.desc = event.target.value
  }
  entitySelected(selectedObj){
      console.log("A product selected to be added to batch :" , selectedObj )
      this.products.push(selectedObj)
      this.selectedProductTemp = "";
      this.selectedProductTemp=selectedObj
      this.calculateQuantity();
  }
}
