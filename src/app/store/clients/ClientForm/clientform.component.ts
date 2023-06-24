import {Component , OnInit , OnDestroy , Input , AfterViewInit} from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormControl ,FormArray  , Validators } from '@angular/forms';
import { clientService } from '@services/client.service';
declare var $: any;
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";
import { StateService } from '@uirouter/angular';
import { Transition } from "@uirouter/core";

@Component({
  selector : 'clientform',
  templateUrl: './clientform.component.html',
  styleUrls: ['./clientform.component.scss']
})
export class ClientFormComponent implements OnInit , AfterViewInit{
  pageData : any;
  ClientForm : FormGroup ;
  id : any  ;
  opInProgress : Boolean = false;
  updatedValues : any;

  constructor(private http:HttpClient , private fb:FormBuilder ,
            private _clientService : clientService , private notifier : NotifierService ,
            public _permService : PermissionService , private $state : StateService , private trans:Transition ){
    this.pageData = {
      title: 'Client Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Clients'
        },
        {
          title: 'Client Form'
        }
      ]
    };

  }
  ngOnInit(){
    this.id = this.trans.params().id;
    this.pageData.title = (this.id ? "Update": "Add")+" Client Form";


    let that = this ;
    this.ClientForm = this.fb.group({
      name: ['' , Validators.required ],
      phone: ['' , Validators.required ], 
      address: [''],
      cnic :['', Validators.required ],
      father_name :[''],
      father_cnic:['']
    })

  }
  ngAfterViewInit(){
    if(this.id)
    {
      this.fetchClientInfo();
    }
  }
  fetchClientInfo(){
    this._clientService
      .viewDetail(this.id)
        .subscribe(
            resp=>{
              //Since the data is in the form of array thats why first index is our value
              resp = resp[0];

              //Setting the form values
              this.ClientForm.patchValue(resp.personal_info);
              this.ClientForm.disable();
            } ,
            error=>{
              this.notifier.notify("error", error.error.message );
              console.log("Error occured" , error)
            })
  }
  addClient(){
      let that = this;
      this.opInProgress = true;

      //In case the form is suppose to update
      if(this.id)
        {
          this.updateClient();
          return ;
        }
      //hide both failed and success idons
      $(".icon").fadeOut();

      this._clientService.create(this.ClientForm.value).subscribe(response => {

        this.opInProgress = false;

        //Success icon show
        $(".icon.success").fadeIn();
        this.notifier.notify("success", "Client Added" );
        that.$state.go('store.client' );
      } , error =>{

        this.opInProgress = false;
        //Show failed icon
        $(".icon.fail").fadeIn();
        console.log("Errro in client form" , error)
        this.notifier.notify("error", error.error.message );
      } );
  }
  //Method to update client
  updateClient(){
    //Using component variable to keep track of only the updated values
    this.updatedValues = {};

    //Identifying keys to update
    this.getUpdates(this.ClientForm , this.updatedValues);

    //Check if there is something to update
    if( jQuery.isEmptyObject(this.updatedValues)  )
    {
      this.notifier.notify("warning" , "Nothing to change.");
      this.opInProgress = false;
      //Show failed icon
      $(".icon.fail").fadeIn();
      this.$state.go('store.client');
      return;
    }

    //Its time to update
    //get the categories selected by the user
    this._clientService.update(this.id ,  this.updatedValues ).subscribe(resp=>{
      this.notifier.notify("success", "Client Successfuly updated." );
      this.$state.go('store.client');

    }
    , error =>
    {
       console.log("error" , error);
       this.opInProgress = false;
       this.notifier.notify("error", error.error.message ? error.error.message : error.error.error );
    } );
  }
  inpPhone(event)
    {
      let keyCode  = event.which;
      let str = event.target.value;

      if(str.length > 11 && keyCode !=8)
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
    inputCNIC(event){
      let keyCode  = event.which;
      let str = event.target.value;

      if(str.length > 14 && keyCode !=8)
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
      deleteClient(){
        this._clientService
          .remove(this.id)
            .subscribe(
                resp=>{
                  //Client deleted
                  this.notifier.notify("success", resp.message );
                } ,
                error=>{
                  this.notifier.notify("error", error.error.message );
                  console.log("Error occured" , error)
                })
      }

      enableFormFields(){
        this.ClientForm.enable();
      }
}
