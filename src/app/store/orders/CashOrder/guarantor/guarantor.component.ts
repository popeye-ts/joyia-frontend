import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy, ElementRef, HostListener, Input} from '@angular/core';
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
import { getSelectedGuarantors } from '@/Redux/selectors/cashOrder.selector';

import { ChangeClient, ChangeGuarantor2, ChangeGuarantor1, ChangeGuarantor} from '@/Redux/actions/cashOrder.actions';
import { clientService } from '@store/services/client.service';
import { map , debounceTime , distinctUntilChanged } from 'rxjs/operators';
import { guarantorsService } from '@store/services/guarantor.service';

@Component({
  selector : 'order-guarantors-select',
  templateUrl: './guarantor.component.html',
  styleUrls: ['./guarantor.component.scss']
})

export class OrderGuarantorsSelectComponent implements AfterViewInit , OnInit{
  pageData : any;
  @Input('placeholder') placeholder = '';
  @Input('id') id = '';

  serverImagesPath : string = environment.cloudinary.medium;
  guarantorsBeingFetched: boolean;
  guarantorLst: any = [];
  inputField: any;
  dropdown: any;
  dropdownArray: any;
  selectedGuarantors: any = [];
  ajaxCallSubscription: any;

  selectedGuarantors$: Observable<any>;

  selectedGuarantor$: Observable<any>;
  guarantors$: Observable<any>[] = [];
  selectedGuarantorId : any;
  guarantorLoadingAsyncSearch = false;
  guarantorInputAsyncSearch = new Subject<string>();
  guarantor$: Observable<any>[] = [];

  constructor( private fb:FormBuilder , private notifier : NotifierService , private _authService : AuthenticationService ,  private _clientService:clientService  , private _guarantorService:guarantorsService ,
    private store: Store<State> , private eRef: ElementRef ){
    this.pageData = {
      title: 'Order Creation',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Guarantor selection'
        }
      ]
    };
    
  }
  bindSearchEvntListener(){
    this.guarantorInputAsyncSearch.pipe(
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
        this.guarantorLoadingAsyncSearch = true;
        await this.searchGuarantor(text);
      }catch(err){
        console.log("An error occured " , err );
      }finally{
        this.guarantorLoadingAsyncSearch = false;
      }
    });
  }
  initSearchBar(){
    this.inputField = document.querySelector('.chosen-customer');
    this.dropdown = document.querySelector('.guarantor-ul');
    this.dropdownArray  = [...(<any> document.querySelectorAll('.customer-select-container li') )];
    console.log(typeof this.dropdownArray)
    
    this.bindSearchEvntListener();
  }
  ngOnInit(){
    this.initSearchBar();
    this.selectedGuarantors$ = this.store.select(getSelectedGuarantors );
    this.selectedGuarantors$.subscribe(guarantors=>{
      this.selectedGuarantors = guarantors;
    })

  }
  async searchGuarantor(search : string ){
    try{
      this.guarantorsBeingFetched = true;
      if ( this.ajaxCallSubscription ) {
        this.ajaxCallSubscription.unsubscribe();
      }

      this.ajaxCallSubscription = this._guarantorService.search({search}).subscribe(resp=>{
        console.log("we have the response of guarantors search" , resp)
        this.guarantorLst = (resp || []).map(obj=>{
            // return { name : obj.name , phone : obj.phone , all : obj };
            return { label : obj.name+' ('+obj.phone+')' , phone : obj.phone , ...obj }

        });
      }, error=>{
        console.log("we have an eror" , error)
      })
    }catch(error){
      console.log("An error occured in customer select " , error )
    }
    finally{
      this.guarantorsBeingFetched = false;

    }
  }
  selectClient(clientInfo){
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
  showAddGuarantorModal(){
    (<any>$("#guarantorFormModal")).modal('show');
    if($(".modal-backdrop").length){
      let html =  $(".modal-backdrop")[0].outerHTML ;
      console.log("Showw add customer modal " , html );
      $(".modal-backdrop").remove();
      $('#guarantorFormModal').on('hidden.bs.modal', function () {
        // do something…
        console.log("Modal closed");
        $(".modal-backdrop").remove();
      })
      //Append to customer component
      $("order-customer-select").append(html)
    }
  }
  selectGuarantor2(guarantor){
    this.store.dispatch(new ChangeGuarantor2(guarantor));
    $('.guarantor2-select-container .value-list').removeClass("open");
  }
  selectGuarantor1(guarantor){
    this.store.dispatch(new ChangeGuarantor1(guarantor));
    $('.guarantor1-select-container .value-list').removeClass("open");
  }
  unSelectGuarantor1(guarantor){
    this.store.dispatch(new ChangeGuarantor1(null));
    $('.guarantor1-select-container .value-list').removeClass("open");
  }
  unSelectGuarantor2(guarantor){
    this.store.dispatch(new ChangeGuarantor2(null));
    $('.guarantor1-select-container .value-list').removeClass("open");
  }
  selectGuarantor( guarantorInfo){
    console.log("Guarantor info ", guarantorInfo  );
    if(guarantorInfo){
      this.store.dispatch(new ChangeGuarantor(this.id , guarantorInfo));
    }else{
      this.store.dispatch(new ChangeGuarantor(0 , null));
    }
   
  }
}
