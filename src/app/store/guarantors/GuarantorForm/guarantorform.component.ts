import {Component , OnInit , ViewChild  , OnDestroy , AfterViewInit} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder ,FormArray,FormControl, FormGroup , Validators } from '@angular/forms';
import { guarantorsService } from '@services/guarantor.service';
declare var $: any;
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";
import { StateService } from '@uirouter/angular';
import { Transition } from "@uirouter/core";
@Component({
  selector : 'guarantorform',
  templateUrl: './guarantorform.component.html',
  styleUrls: ['./guarantorform.component.scss']
})
export class GuarantorFormComponent implements OnInit , AfterViewInit{
  pageData : any;
  GuarantorForm : FormGroup ;

  id : any;
  opInProgress : Boolean = false;
  updatedValues : any;
  constructor(private http:HttpClient , private fb:FormBuilder ,
            private _guarantorService : guarantorsService , private notifier : NotifierService ,
            public _permService : PermissionService , private $state : StateService, private trans:Transition ){
    this.pageData = {
      title: 'Add Guarantor Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Guarantor'
        },
        {
          title: 'Form'
        }
      ]
    };

  }
  ngOnInit(){
    this.id = this.trans.params().id;
    this.pageData.title = (this.id ? "Update": "Add")+" Guarantor Form";

    let that = this ;
    this.GuarantorForm = this.fb.group({
      name: ['' , [Validators.required ,  Validators.minLength(3)] ],
      phone : [''  , [Validators.required , Validators.minLength(12),Validators.maxLength(12) ]]
      , address: ['']
      , cnic :['' , [Validators.minLength(15),Validators.maxLength(15)]],
      father_name :[''],
      father_cnic:['' , [Validators.minLength(15),Validators.maxLength(15)]]
    });

  }
  ngAfterViewInit(){
    if(this.id)
    {
      this.fetchGuarantorInfo();
    }
  }
  fetchGuarantorInfo(){
    this._guarantorService
      .viewDetail(this.id)
        .subscribe(
            resp=>{
              console.log("Guarantor info fetched" , resp)
              //Since the data is in the form of array thats why first index is our value
              resp = resp[0];

              //Setting the form values
              this.GuarantorForm.patchValue(resp);
              this.GuarantorForm.disable();
            } ,
            error=>{
              console.log("Error occured" , error)
              this.notifier.notify("error", error.error.message );
            })
  }
  addGuarantor(){
      let that = this;
      this.opInProgress = true;
      //In case the form is suppose to update
      if(this.id)
        {
          this.updateGuarantor();
          return ;
        }
      //hide both failed and success idons
      $(".icon").fadeOut();

      this._guarantorService.create(this.GuarantorForm.value).subscribe(response => {

        this.opInProgress = false;

        //Success icon show
        $(".icon.success").fadeIn();
        this.notifier.notify("success", "Guarantor Added" );
        that.$state.go('store.guarantor' );
      } , error =>{

        this.opInProgress = false;
        //Show failed icon
        $(".icon.fail").fadeIn();
        console.log("Errro in guarantor form" , error)
        this.notifier.notify("error", error.error.message );
      } );
    }
    //Method to update guarantor
    updateGuarantor(){
      //Using component variable to keep track of only the updated values
      this.updatedValues = {};

      //Identifying keys to update
      this.getUpdates(this.GuarantorForm , this.updatedValues);

      //Check if there is something to update
      if( jQuery.isEmptyObject(this.updatedValues)  )
      {
        this.notifier.notify("warning" , "Nothing to change.");
        this.opInProgress = false;
        //Show failed icon
        $(".icon.fail").fadeIn();
        this.$state.go('store.guarantor');
        return;
      }

      //Its time to update
      this._guarantorService.update(this.id ,  this.updatedValues ).subscribe(resp=>{
        this.notifier.notify("success", "Guarantor Successfuly updated." );
        this.$state.go('store.guarantor');
      }
      , error =>
      {
         // console.log("error" , error);
         this.opInProgress = false;
         this.notifier.notify("error", error.error.message );
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

    deleteGuarantor(){
      this._guarantorService
        .remove(this.id)
          .subscribe(
              resp=>{
                //Guarantor deleted
                this.notifier.notify("success", resp.message );
              } ,
              error=>{
                this.notifier.notify("error", error.error.message );
                console.log("Error occured" , error)
              })
    }

    enableFormFields(){
      this.GuarantorForm.enable();
    }
}
