import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy, Input, OnChanges, SimpleChanges} from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { orderService } from '@services/order.service';
import { StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";

import { AuthenticationService } from '@services/authentication.service';

import {select , Store} from '@ngrx/store';
import {State } from '@stateInterface';
import { Observable } from 'rxjs/internal/Observable';
import { getProducts } from '@/Redux/selectors/product.selector';
import { addBarcode, changeBarcode, changeEAN, changeProduct, changeSelected, deleteBarcode, RemoveInventoryItem } from '@/Redux/actions/inventory.actions';

@Component({
  selector : 'inventoryProducts',
  templateUrl: './inventoryProducts.component.html',
  styleUrls: ['./inventoryProducts.component.scss']
})
export class InventoryProductsComponent implements AfterViewInit , OnInit , OnChanges{
  pageData : any;
  @Input() draftProducts : any;
  @Input() selectedCell : any;
  
  serverImagesPath : string = environment.cloudinary.medium;
  products$: Observable<any>;
  products : any = [];
  constructor( private _orderService : orderService , private $state: StateService ,  
    private notifier : NotifierService , private _authService : AuthenticationService ,
    private store: Store<State>){
    this.pageData = {
      title: 'Inventory Form Products',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Products List'
        }
      ]
    };
    this.products$ = this.store.select(getProducts);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.draftProducts ){
      this.draftProducts = changes.draftProducts.currentValue;
      console.log("New draft products", this.draftProducts );
    }
    if(changes && changes.selectedCell ){
      this.selectedCell = changes.selectedCell.currentValue;
      setTimeout(() => {
        $(".selected-cell input").focus();
      }, 500);
    }

  }
  ngOnInit(){
    this.products$.subscribe(productsFromRedux=>{
      this.products = productsFromRedux;
      console.log("Inventory products component " , productsFromRedux );
    })
  }
  ngAfterViewInit() : void {
   
  }
  ngOnDestroy(): void {

  }
  deleteRow(rowIndex : number, itemIndex : number){
    // console.log("Delete row at index"  , index )
    // this.draftProducts.splice(index , 1);    
    this.store.dispatch(new RemoveInventoryItem({rowIndex , itemIndex }))

  }
  deleteImei(rowIndex : number, itemIndex : number , imeiIndex : number){
    // this.draftProducts[rowIndex].barcode.splice(imeiIndex , 1)
    this.store.dispatch(new deleteBarcode({rowIndex , itemIndex , imeiIndex}))
  }
  changeBarCode(rowIndex : number, itemIndex : number , imeiIndex : number , event$ : any ){
    console.log("What do you mean by event" , event$.target.value );
    this.store.dispatch(new changeBarcode({rowIndex , itemIndex , imeiIndex , code : event$.target.value }) )
  }
  eanChanged(index : number , evt$ : any ){
    setTimeout(() => {
      console.log("Settimeout " ,$(evt$.target) )
      $(evt$.target).focus();
    }, 100);
    this.store.dispatch(new changeEAN({ index  , ean : evt$.target.value }) )
  }
  addImei(rowIndex : number, itemIndex : number){
    // console.log("Delete row at index"  , index )
    // this.draftProducts.splice(index , 1);    
    this.store.dispatch(new addBarcode({rowIndex , itemIndex }))
  }
  isCellSelected(rowIndex , colIndex){
    if(!this.selectedCell || this.selectedCell.length < 2)
      return false;
    
      if(rowIndex == this.selectedCell[0] && colIndex == (this.selectedCell[1]) ){
        // console.log("Selected " , this.selectedCell , " Row Index " , rowIndex , " Col Index", colIndex );
        return true;
      }
      return false;
  }
  changeFocussed(rowIndex : number, itemIndex : number , imeiIndex : number ){
    console.log("Change Focus" , rowIndex , " Item index " , itemIndex , " IMEI index " , imeiIndex  );
    this.store.dispatch(new changeSelected({rowIndex , itemIndex , imeiIndex }) )
  }
  selectProduct(evt$ : any , index : number ){
    console.log("Product select ", evt$.target.value )
    this.store.dispatch(new changeProduct({ product_id : evt$.target.value, index }) )

  }
}
