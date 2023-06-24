import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy, HostListener} from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormControl , FormArray , Validators } from '@angular/forms';
import { orderService } from '@services/order.service';
import {  StateService, Transition } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";

import { AuthenticationService } from '@services/authentication.service';
import { Store } from '@ngrx/store';
import { State } from '@/Redux/state';
import { showSpinner } from '@/Redux/actions/spinner.actions';
import { loadProducts } from '@/Redux/actions/product.actions';
import { QRSessionService } from '@store/services/QRSessionService.service';
import { getInventoryForm } from '@/Redux/selectors/inventoryForm.selector';
import { AddInventoryProducts, BarcodeScanned, keyPress, resetInventoryForm } from '@/Redux/actions/inventory.actions';
import { inventoryService } from '@store/services/inventory.service';

@Component({
  selector : 'inventoryForm',
  templateUrl: './inventoryForm.component.html',
  styleUrls: ['./inventoryForm.component.scss']
})

export class InventoryFormComponent implements AfterViewInit , OnInit{
  pageData : any;
  draftProducts : Array<any> = [];
  shownSpinner : Boolean = false;
  currentlySelected : string ;
  select2Options: any ;
  id : string = '';
  inventoryForm$: any;
  selectedCell: any = [0 , 0];

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log(event);
    this.store.dispatch(new keyPress({code :event.keyCode}))

  }
  constructor(private _productService:productService  , private fb:FormBuilder , private _orderService : orderService ,
    private $state: StateService ,  private notifier : NotifierService , private _authService : AuthenticationService , 
    private store: Store<State> ,  private trans: Transition , private _sessionService : QRSessionService , 
    private _inventoryService : inventoryService  ){
    this.pageData = {
      title: 'Add Inventory Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Inventory'
        },
        {
          title: 'Inventory Form'
        },
      ]
    };
    // store.replaceReducer(appReducerWithBlog);
    this.store.dispatch(new loadProducts())

    this.inventoryForm$ = this.store.select(getInventoryForm)
    this.inventoryForm$.subscribe(inForm=>{
      this.draftProducts = inForm.items;
      this.selectedCell = inForm.selected;
      console.log("I am inveentory form component " , inForm);
    })
  }
  ngOnInit(){
    let that = this ;
    this.id = this.trans.params().id || '';

    //Initializing select 2
    this.select2Options =
      {
        width :'100%',
        allowClear: true,
        placeholder: '',
        multiple  : 'multiple' ,
        theme : 'bootstrap'
      };
    
    if(this.id){
      this.fetchFormDetails();
    }
    this.bindScanner();
  }
  async fetchFormDetails(){
    try{
      console.log("Fetch form details of id " , this.id )
      let formDetails = await this._sessionService.getInventoryForm(this.id).toPromise();
      if(formDetails.data && formDetails.data){
        this.store.dispatch(new AddInventoryProducts(formDetails.data.products))

        // this.draftProducts = formDetails.data.products;
      }
      console.log("Form details" , formDetails );
    }catch(error){
      console.log("An error occured " , error )
    }
  }
  ngAfterViewInit() : void {

  }
  bindScanner(){
    let code = "";
    let reading = false;

    window.addEventListener('keypress', e => {
      //usually scanners throw an 'Enter' key at the end of read
      if (e.keyCode === 13) {
          if(code.length > 10) {
              $("#search-inp").val(code);
              console.log("Cash Order : Dispatcing #" , code);
              /// code ready to use SearchByText
              this.store.dispatch(new BarcodeScanned(code));

              code = "";
          }
        } else {
            code += e.key; //while this is not an 'enter' it stores the every key            
        }

        //run a timeout of 200ms at the first read and clear everything
        if(!reading) {
            reading = true;
            setTimeout(() => {
                code = "";
                reading = false;
            }, 200);  //200 works fine for me but you can adjust it
        }
    });
  }
  fetchDetail(id): void {
    let that = this;
     this._productService.viewDetail(id).
          subscribe(
            response =>
              {
              } ,
            error =>
              {
                console.log("response", error);
              }
            );
  }
  ngOnDestroy(): void {

  }
  async submitForm(){
    try{
      this.shownSpinner = true;
      let groupedProductsArr = [];
      this.draftProducts.map(prod=>{
        if(groupedProductsArr[prod.product_id]){
            console.log("Condition met" , groupedProductsArr[prod.product_id].stockItems.concat( prod.stockItems ) )
            
            groupedProductsArr[prod.product_id].items = [...groupedProductsArr[prod.product_id].items , ...prod.stockItems ]; 
            groupedProductsArr[prod.product_id].quantity += prod.quantity;
        }else{
          groupedProductsArr[prod.product_id] = ({...prod,items : prod.stockItems || []});
        }
      });
      let datatosend = Object.keys(groupedProductsArr).map(k=>({...groupedProductsArr[k] , stockItems : groupedProductsArr[k].items}) );
      console.log("Products submitted ",  datatosend );
      let submitInventoryFormResp : any = {};
      if(this.id){
        submitInventoryFormResp = await this._inventoryService.submitInventoryForm(datatosend).toPromise();
      }else{
        submitInventoryFormResp = await this._inventoryService.submitInventoryForm(datatosend).toPromise();
      }
      console.log("Submit inventory form response " , submitInventoryFormResp );
      this.notifier.notify('success'  ,  submitInventoryFormResp.message);
      this.resetForm();
    }catch(error){
      console.log("An error occured while submiting inventory form" , error )
      this.notifier.notify('error'  ,  error ); 

    }finally{
      this.shownSpinner = false;
    }
  }
  resetForm(){
    this.store.dispatch(new resetInventoryForm())

  }
}
