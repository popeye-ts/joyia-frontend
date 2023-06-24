import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy ,  Input ,OnChanges, SimpleChanges , Output , EventEmitter} from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';


@Component({
  selector : 'orderProductsStep',
  templateUrl: './productsStep.component.html',
  styleUrls: ['./productsStep.component.scss']
})
export class OrderProductsStepComponent implements AfterViewInit , OnInit , OnChanges{
  pageData : any;
  productForm : FormGroup ;
  active : Number ;
  @Input() selectedProducts : any;
  @Input() quantity : any ;
  @Input() reset : any;
  @Output('remove') removeProductParent = new EventEmitter();
  products : Array<any> = [];
  serverImagesPath : string = environment.cloudinary.small;

  //making an array for vehicles to track particulars
  selectedVehiclesStock : Array<any> = [];
  constructor(private _productService:productService  , private fb:FormBuilder){
    this.pageData = {
      title: 'All Orders',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Order'
        },
        {
          title: 'Order Details'
        }
      ]
    };
    this.active = 1;

  }
  ngOnInit(){
    let that = this ;
    this.productForm = this.fb.group({email : ['']});
      // this.ProductForm = this.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
  }
  ngAfterViewInit() : void {


  }
  ngOnDestroy(): void {

  }
  ngOnChanges(changes){
    let that = this ;
    if(changes.selectedProducts && changes.selectedProducts.currentValue)
      {
        let newProduct = changes.selectedProducts.currentValue
        let productNotFound =true;
        this.products.forEach( (product , i) => {
          if(product._id == newProduct._id)
          {

                this.products[i].quantity++;
                console.log("Product found")
                productNotFound =false;
                return ;
          }
        })
        if(productNotFound)
        {
          newProduct.quantity = 1;
          this.products.push(newProduct)
        }
        //for vehicles make sure we have exact number of select in dom
        if(newProduct.stock)
          this.syncSelects();
        console.log("In ngonchanges in product step" , this.products);

      }
    if(changes.quantity && changes.quantity.currentValue){
      this.quantity = changes.quantity.currentValue
      this.products.forEach(product => {
          //Comparing each product's quantity with the inventory quantity
            if(product.quantity_available <= this.quantity[product._id])
                  {

                    //It means that the product in cart is more then in ventory
                    this.quantity[product._id] = product.quantity_available;
                    product.class = "red";
                    $('#item_'+product._id).addClass("shake")
                    //Just removing class after a bit
                    setTimeout( function(){
                      $('#item_'+product._id).removeClass("shake");
                    },2000 )
                  }
      });
    }
    if(changes.reset && changes.reset.currentValue)
    {
      this.products = []
      this.productForm.reset();
      this.productForm.enable();
      this.selectedVehiclesStock = []
    }
  }
  remove(product){
    console.log(product)
    let productsTemp = this.products.filter(function(obj){ return obj._id !== product._id  })
    this.products = productsTemp
    delete this.selectedVehiclesStock[product._id]
    this.removeProductParent.emit(product)
  }
  setQuantity(event){
    let quantity = event.target.value;
    let id = event.target.attributes.data.nodeValue;
    this.products.forEach(product => {
        if(product._id == id)
          {
            if(product.quantity_available < quantity)
              {
                alert("Out of order");
                product.quantity = quantity;
              }
          }
    });
    console.log("Lets see the products array " , this.products)
    this.syncSelects();

  }
  setCharges(event){
    let charges = event.target.value;
    let id = event.target.attributes.data.nodeValue;
    this.products.forEach(product => {
        if(product._id == id)
          {
            product.charges = charges
          }
    });
    console.log("Lets see the products array charges" , this.products)
  }
  fakeArray(length: number): Array<any> {
    if (length >= 0) {
      return new Array(length);
    }
  }
  //For each product of vehicle type we have to select particular
  //products from the lot of out that is for each product we have a specific engine and chassis no , color etc
  //Thus on DOM we have to make sure we have the exact no of selects
  syncSelects(){
      this.products.forEach(product => {
        //first check if the product is already in our array
        if(this.selectedVehiclesStock[product._id])
        {
          //the product was already added just making a new index nothing meaningfull
          if(this.selectedVehiclesStock[product._id].length < this.quantity[product._id])
            this.selectedVehiclesStock[product._id].push(product.quantity)
        }else{
          //The control is here means the product was not in the stock array
          this.selectedVehiclesStock[product._id]=new Array(1);
        }
      })
  }
}
