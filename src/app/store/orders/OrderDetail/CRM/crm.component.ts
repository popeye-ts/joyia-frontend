import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , Output , EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
declare var $: any;

import { Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormArray  , FormControl , Validators  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { financeService } from './../../../services/finance.service';
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";
import { orderService } from '@services/order.service';
import { UserService } from '@services/user.service';
import { WaiverService } from '@services/waiver.service';
import { clientService } from '@store/services/client.service';

declare var contextMenu: any;

@Component({
  'selector':'orderCRM',
  'templateUrl':'./crm.component.html',
  'styleUrls':['./crm.component.scss']
})

export class CRMComponent implements AfterViewInit, OnInit , OnChanges {
  pageData : any;
  EditClientId : any ;
  ClientForm : FormGroup ;

  @Input() order_id : any;
  @Input() client_id : any;
  rsrcTitle : String = "Clients";
  clientData : any ;

  //To track updates in a form
  updatedValues : any;
  btnStatusClass : string = 'active';
  constructor (private http:HttpClient , private fb:FormBuilder ,
    private _clientService : clientService , private notifier : NotifierService , 
    public _permService : PermissionService , private _orderService : orderService  ){
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.client_id && changes.client_id.currentValue){
      this.fetchInfo(changes.client_id.currentValue );
    }
  }
  ngOnInit(){
    let that = this ;
    this.ClientForm = this.fb.group({
      name: ['' , Validators.required ],
      phone: ['' , [Validators.required , Validators.minLength(12)] ], 
      address: [''],
      cnic :['' , [ Validators.required , Validators.minLength(13) ] ],
      father_name :[''],
      father_cnic:['']
    })
  }
  submitForm()
  {
    this.btnStatusClass = 'show-spinner' ;
    let formData = this.ClientForm.value;
    formData.order = this.order_id;
    console.log("Form of crm which is gonna submit is" , formData)

    let that = this;
    this.btnStatusClass = 'show-spinner' ;

    this._clientService.create(formData)
      .subscribe(response => {
        //we have client info 
        let client = response.client._id;
        that.fetchInfo(client);

        //informing parent that data has changed
        this.btnStatusClass = 'show-success' ;
        that.notifier.notify("success" , "CRM saved.");
        that.resetButton(5000)
        setTimeout(() => {
          this.ClientForm.reset();
        }, 5000);
    } , error=>{
      this.btnStatusClass = 'show-fail' ;
      that.resetButton(10000)
      that.notifier.notify("error" , error.error.error ? error.error.error : error.error.message);
    })
  }
  resetButton(delay){
    setTimeout(()=>{
      this.btnStatusClass = '' ;
    },delay)
  }
  ngAfterViewInit() : void {
    let that = this;
    if(this.client_id){
      this.fetchInfo();
    }
  }
  fetchInfo(client_id = null): void{
    let that = this
    //dataTable
    this._clientService.viewDetail(client_id || this.client_id)
      .subscribe(result=>{
        console.log("Response from the crm module" , result)
        that.clientData = result;
       
    } , error=>{
      console.log("error from the crm module" , error)
    })
  }
  ngOnDestroy(): void {

}



   
    //Get the updated form control values only
    getUpdates(formItem: FormGroup | FormArray | FormControl,updatedValues, name?: string) {

      if (formItem instanceof FormControl) {
        if (name && formItem.dirty) {
          if(updatedValues == undefined )
            updatedValues = [];
          updatedValues[name] = formItem.value;
        }
      } else {
        for (const formControlName in formItem.controls) {

          if (formItem.controls.hasOwnProperty(formControlName)) {
            const formControl = formItem.controls[formControlName];

            if (formControl instanceof FormControl) {
              this.getUpdates(formControl, updatedValues , formControlName);

            } else if (
              formControl instanceof FormArray &&
              formControl.dirty &&
              formControl.controls.length > 0
            ) {
              updatedValues[formControlName] = [];
              this.getUpdates(formControl, updatedValues[formControlName]);
            } else if (formControl instanceof FormGroup && formControl.dirty) {
              updatedValues[formControlName] = {};
              this.getUpdates(formControl, updatedValues[formControlName]);
            }
          }
        }
      }
    }
    inputCNIC(event){
      let keyCode  = event.which;
      let str = event.target.value;

      if( keyCode ==8){
        return ;
      }

      if(str.length > 14)
        {
          event.preventDefault();
          return ;
        }

      //If its not a number prevent from writing
      if( keyCode < 48 || keyCode > 57)
        event.preventDefault();

      if(str.length == 5 || str.length == 13 )
        event.target.value = str+="-";
      // console.log(event ,  , "Key code phone")

    }
    inpPhone(event)
    {
      let keyCode  = event.which;
      let str = event.target.value;

      if( keyCode ==8){
        return ;
      }

      if(str.length > 11 )
        {
          event.preventDefault();
          return ;
        }

      //If its not a number prvenet from writing
      if( keyCode < 48 || keyCode > 57)
        event.preventDefault();

      if(str.length == 4)
        event.target.value = str+="-";
      // console.log(event ,  , "Key code phone")
    }
}
