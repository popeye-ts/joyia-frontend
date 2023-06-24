import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { orderService } from '@services/order.service';
import {  StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";

import { AuthenticationService } from '@services/authentication.service';
import { categoryService } from '@store/services/category.service';
import { CategoryChanged, SearchByText } from '@/Redux/actions/cashOrder.actions';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { getSearch } from '@/Redux/selectors/cashOrder.selector';
import { getProducts } from '@/Redux/selectors/product.selector';
import { AddInventoyItem } from '@/Redux/actions/inventory.actions';


@Component({
  selector : 'inventorySearch',
  templateUrl: './productSearch.component.html',
  styleUrls: ['./productSearch.component.scss']
})
export class InventorySearchComponent implements AfterViewInit , OnInit{
  pageData : any;
  beingLoaded : boolean = false;
  searchCriteria$ : Observable<any>; 
  products$ : Observable<any>;
  products : any []; 
  searchLabel : string = '';
  selectedProduct : any  = {};
  select2Options : any ;
  constructor(private store: Store<State> , private _catService : categoryService){
      this.pageData = {
      title: 'Products Component for Cash Order Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Cash Order'
        }
      ]
    };
    this.searchCriteria$ = this.store.select(getSearch);
    this.products$ = this.store.select(getProducts);
  }
  ngOnInit(){
    this.searchCriteria$.subscribe(searchCriteria=>{
      this.searchLabel = searchCriteria.label;
    });
    this.fetchProducts();
    
  }
  ngAfterViewInit() : void {
    fromEvent( $("#search-inp") ,"keyup").pipe(
      //get value
      map((event : any) => {
        return event.target.value;
      })

      //If character length is greater then two
      // , filter(res => res.length > -1  )

      //Time in milliseconds between key events
      , debounceTime(1000)

      //If previous query is different from current
      , distinctUntilChanged()

      //subscription for response
    ).subscribe((text : string )=>{
      this.store.dispatch(new SearchByText(text));
    });
  }
  ngOnDestroy(): void {

  }
  async fetchProducts(){
    this.products$.subscribe(products=>{
      console.log("This is inventory form " , products);
      let uniqueCategories = [];
      let allCategories = products.map(t=>[...t.categories]).flat(1);
      //Extact unique categories
      allCategories.forEach(category =>uniqueCategories[category.name] = category.icon);

      //for each category bring in the products
      Object.keys(uniqueCategories).forEach(categoryName=>{
        products.filter(prod=>{ return ( prod.other_info ? prod.other_info.inventory_type == "Barcoded" : false);}).forEach(product=>{
          let productLiesInCategory = product.categories.find(e=>e.name==categoryName);
          if(productLiesInCategory){
            if(!uniqueCategories[categoryName].products){
              uniqueCategories[categoryName] = { name : categoryName , icon : uniqueCategories[categoryName] , products : []};
            }
            uniqueCategories[categoryName].products.push(product);
          }
        })        
      })

      //finally
      this.products = Object.values( uniqueCategories);
    })
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
  updateSelectedProduct($evt)
  {
    console.log("Whats in event " , $evt.data  , this.products  );
    if($evt.data && $evt.data[0])
      {
        let tempProdSelected =  $evt.data[0];
        let itemSearched = (<any>this.products.map(t=>t.products)).flat(1).find(i=>i._id==tempProdSelected.id);
        this.selectedProduct = itemSearched;
      }
    // this.ProductForm.controls.categories.setValue( $evt.data.map((category)=> {return {name : category.text, icon : category.id } } ) );
  }
  addItem(){
    let val = $("#search-inp").val();
    this.store.dispatch(new AddInventoyItem({code : val , product : this.selectedProduct }));
  }
}
