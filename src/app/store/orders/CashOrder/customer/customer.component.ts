import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormControl , FormArray , Validators } from '@angular/forms';
import { orderService } from '@services/order.service';
import {  StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";
import PerfectScrollbar from 'perfect-scrollbar';
import { AuthenticationService } from '@services/authentication.service';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { getSelectedProducts  , getTotal , getDiscount , getSubTotal , getTax , getOrderCompletionStatus, getSelectedClient } from '@/Redux/selectors/cashOrder.selector';

import { QuantityDecreased , QuantityIncreased, RemoveProduct , ClearCart , SubmitOrder, RecievedAmountChanged, ChangeClient} from '@/Redux/actions/cashOrder.actions';
import { clientService } from '@store/services/client.service';
import { map , debounceTime , distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector : 'order-customer-select',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})

export class OrderCustomerSelectComponent implements AfterViewInit , OnInit{
  pageData : any;
  @ViewChild('myselect' , { static : true }) myselect;

  serverImagesPath : string = environment.cloudinary.medium;
  clientBeingSearched: boolean;
  clientLst: any = [];
  inputField: any;
  dropdown: any;
  dropdownArray: any;
  valueArray: any[];
  selectedClient: any = null;
  ajaxCallSubscription: any;
  customerLoadingAsyncSearch = false;
  customerInputAsyncSearch = new Subject<string>();

  selectedClient$: Observable<any>;
  clients$: Observable<any>[] = [];
  selectedClientId : any;

  constructor( private fb:FormBuilder , private notifier : NotifierService , private _authService : AuthenticationService ,  private _clientService:clientService  ,
    private store: Store<State> ){
    this.pageData = {
      title: 'Products Component for Cash Order Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Cash Order'
        }
      ]
    };
    
  }
  bindSearchEvntListener(){
    // fromEvent(  this.inputField ,"keyup").pipe(
    //   //get value
    //   map((event : any) => {
    //     return event.target.value;
    //   })

    //   //If character length is greater then two
    //   // , filter(res => res.length > -1  )

    //   //Time in milliseconds between key events
    //   , debounceTime(100)

    //   //If previous query is different from current
    //   , distinctUntilChanged()

    //   //subscription for response
    // ).subscribe((text : string )=>{
    //   this.dropdown.classList.add('open');
    //   let inputValue = this.inputField.value.toLowerCase();
    //   this.searchClient(inputValue);
    //   console.log("Inpput event called " , inputValue  );
    //   let valueSubstring;
    //   // if (inputValue.length > 0) {
    //   //   for (let j = 0; j < this.valueArray.length; j++) {
    //   //     if (!(inputValue.substring(0, inputValue.length) === this.valueArray[j].substring(0, inputValue.length).toLowerCase())) {
    //   //       this.dropdownArray[j].classList.add('closed');
    //   //     } else {
    //   //       this.dropdownArray[j].classList.remove('closed');
    //   //     }
    //   //   }
    //   // } else {
    //   //   for (let i = 0; i < this.dropdownArray.length; i++) {
    //   //     this.dropdownArray[i].classList.remove('closed');
    //   //   }
    //   // }
    // });
  
      
    this.customerInputAsyncSearch.pipe(
      //get value

      //If character length is greater then two
      // , filter(res => res.length > -1  )

      //Time in milliseconds between key events
      debounceTime(200)

      //If previous query is different from current
      , distinctUntilChanged()

      //subscription for response
    ).subscribe(async(text : string )=>{
      let data :any = [];
      try{
        console.log("Must search " , text );
        this.customerLoadingAsyncSearch = true;
        await this.searchClient(text);
      }catch(err){
        console.log("An error occured " , err );
      }finally{
        this.customerLoadingAsyncSearch = false;
      }
    });
  }
  initSearchBar(){
    this.inputField = document.querySelector('.chosen-customer');
    this.dropdown = document.querySelector('.value-list');
    this.dropdownArray  = [...(<any> document.querySelectorAll('.customer-select-container li') )];
    console.log(typeof this.dropdownArray)
    // this.dropdown.classList.add('open');
    this.valueArray = [];
    this.dropdownArray.forEach(item => {
      this.valueArray.push(item.textContent);
    });
    
    const closeDropdown = () => {
      this.dropdown.classList.remove('open');
    }
    
    
    
    this.dropdownArray.forEach(item => {
      item.addEventListener('click', (evt) => {
        console.log("Gponna set text ", item.textContent  );
        this.inputField.value = item.textContent;
        this.dropdownArray.forEach(dropdown => {
          dropdown.classList.add('closed');
        });
      });
    })
    
    this.inputField.addEventListener('focus', () => {
      console.log("Gponna set placeholder ", 'Type to filter'  );

       this.inputField.placeholder = 'Type to filter';
       this.dropdown.classList.add('open');
       this.inputField.focus();
       this.inputField.select();
       this.dropdownArray.forEach(dropdown => {
         dropdown.classList.remove('closed');
       });
    });
    
    this.inputField.addEventListener('blur', () => {
      this.inputField.placeholder = 'Select state';
      console.log("Gponna set placeholder ",'Select state'  );
      this.dropdown.classList.remove('open');
    });
    
    document.addEventListener('click', (evt) => {
      const isDropdown = this.dropdown.contains(evt.target);
      const isInput = this.inputField.contains(evt.target);
      if (!isDropdown && !isInput) {
        this.dropdown.classList.remove('open');
      }
    });
  }
  ngOnInit(){
    // this.initSearchBar();
    let _self = this;
    this.bindSearchEvntListener();

    this.selectedClient$ = this.store.select(getSelectedClient );
    this.selectedClient$.subscribe(client=>{
      console.log("New client" , client );
      if(!client){
        _self.selectedClient = null;
        return ;
      }
      let clientsLstTemp = [];
      if(_self.clientLst && _self.clientLst.length){
        clientsLstTemp = _self.clientLst;
      }
      let selectedFound = clientsLstTemp.some(cl=>cl._id == client._id);
      if(selectedFound){
        
      }else{
        _self.clients$.push(client);
      }
      console.log("New client lst" , _self.clients$ );

      _self.selectedClient = client._id;
      // _self.myselect.select(client)
    })

  } 
  async searchClient(search : string ){
    try{
      this.clientBeingSearched = true;
      if ( this.ajaxCallSubscription ) {
        this.ajaxCallSubscription.unsubscribe();
      }
      this.ajaxCallSubscription = this._clientService.get({search}).subscribe(resp=>{
        console.log("we have the response of search" , resp)
        this.clientLst = resp.map(function(obj)
        {
          return { name : obj.personal_info.name , phone : obj.personal_info.phone , all : obj }
        })
        this.clients$ = resp.map(function(obj)
        {
          return { label : obj.personal_info.name+' ('+obj.personal_info.phone+')' , phone : obj.personal_info.phone , ...obj }
        });
        
      } , error=>{
        console.log("we have an eror" , error)
      })
  
    }catch(error){
      console.log("An error occured in customer select " , error )
    }
    finally{
      this.clientBeingSearched = false;

    }
  }
  selectClient(clientInfo){
    console.log("Client info ", clientInfo );
    if(clientInfo){
      this.store.dispatch(new ChangeClient(clientInfo));
    }else{
      this.store.dispatch(new ChangeClient(null));
    }
   
  }
  ngAfterViewInit() : void {
    
  }
  ngOnDestroy(): void {

  }
  showAddCustomerModal(){
    (<any>$("#clientFormModal")).modal('show');
    if($(".modal-backdrop").length){
      let html =  $(".modal-backdrop")[0].outerHTML ;
      console.log("Showw add customer modal " , html );
      $(".modal-backdrop").remove();
      $('#clientFormModal').on('hidden.bs.modal', function () {
        // do something…
        console.log("Modal closed");
        $(".modal-backdrop").remove();
      })
      //Append to customer component
      $("order-customer-select").append(html)
    }
  }
}
