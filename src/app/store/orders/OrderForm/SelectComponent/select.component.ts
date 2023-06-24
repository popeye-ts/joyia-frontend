import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , Output , EventEmitter  , OnChanges , SimpleChanges} from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { clientService } from '@services/client.service';
import { guarantorsService } from '@services/guarantor.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { HttpClient , HttpResponse } from '@angular/common/http';

@Component({
  selector : 'selectForOrderForm',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponentForOrder implements AfterViewInit , OnInit , OnChanges{
  pageData : any;
  productForm : FormGroup ;
  active : Number ;
  @Input() title : String;

  @Output() itemSelectEmitter = new EventEmitter();
  spinner : boolean = true;
  currentModule : String = "Guarantors";
  entityList : any[];

  //to track inventory to enforce stock rules
   stock : any[];
  serverImagesPath : string = environment.cloudinary.small;

  constructor(private _productService:productService , private _guarantorService:guarantorsService ,
    private _clientService:clientService  , private fb:FormBuilder){
    this.pageData = {
      title: 'Select ',
      loaded: true,
      breadcrumbs: []

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
    //view is initialized
    this.toggleLoading();
    this.fetchData({search:''})

  }
  ngOnChanges(changes ){
    console.log("something is changed" , changes)
    this.currentModule = changes.title.currentValue
    this.fetchData({search:''})
  }
  ngOnDestroy(): void {

  }
  toggleLoading(){
    this.spinner=!this.spinner;
  }
  search(event)
  {
    let inp= {search  : event.target.value};
    this.fetchData(inp);
  }
  fetchData(search)
  {
    //show loading spinner
    this.toggleLoading();
    if(this.currentModule == "Clients")
    {
      this._clientService.get(search).subscribe(resp=>{
        console.log("we have the response of search" , resp)
        this.entityList = resp.map(function(obj)
        {
          return { key0 : obj.personal_info.name , key1 : obj.personal_info.phone ,all : obj }
        } )

      } , error=>{
        console.log("we have an eror" , error)
      })
    }else if(this.currentModule == "Products")
    {

      this._productService.searchStock(search).subscribe(response=>{
        //pusshing the stock info into the local array
        this.stock = response.inventory;

        //now we dont need the inventory key
        response = response.products;

        console.log("Response from search of product service" , response , response.map)
        this.entityList = response.map(function(obj){
          let categories = obj.categories.map(category=>{return category.name})
          return {key0 : obj.product_display_name , key1 : categories.join(","), all: obj}
        })
      } , error=>{
        console.log("eRror from search of product search" , error)
      })
    }else if(this.currentModule == "Guarantors")
    {
      this._guarantorService.search(search).subscribe(response=>{
        console.log("response after searching" ,response)
        this.entityList = response.map(function(obj){
          return {key0 : obj.name , key1 : obj.phone , all: obj}
        })
      } , error=>{
        console.log("error after searchind" , error)
      })
    }
  }
  selectEntity(obj , isProductsModule , stock){

    if(isProductsModule && stock.available == 0)
      return ;
    if(isProductsModule)
      {
         obj.quantity_available = stock.available;
         obj.stock = stock.stock;
      }
    this.itemSelectEmitter.emit(obj);
  }

  fetchStockInfo(id)
  {

    let stock = {
      available : 0 ,
      stock : undefined
    };
    stock.available = 0;

    if(this.stock)
    this.stock.some(prod => {
      // console.log("Gonna return in fetch stock info" , id , prod);
      if(id == prod.product)
        {
          stock.available = prod.quantity_available;
          stock.stock = prod.stock || null;
          return true ;
        }
      return false;
    })

    return stock;
  }
}
