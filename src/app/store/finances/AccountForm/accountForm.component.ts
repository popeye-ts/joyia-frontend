import {Component , OnInit , AfterViewInit , ViewEncapsulation , EventEmitter, Output} from '@angular/core';
import { AccountService } from '@services/account.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
import { PermissionService } from "@services/permissions.service";
import { NotifierService } from "angular-notifier";
import { StateService } from '@uirouter/angular';
import { AccountTypeService } from '@services/accountType.service';
import { Select2OptionData } from 'ng2-select2';
import { AuthenticationService } from '@services/authentication.service';
import { HttpClient , HttpResponse } from '@angular/common/http';

@Component({
  selector : 'accountForm',
  templateUrl: './accountForm.component.html',
  styleUrls: ['./accountForm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountFormComponent implements AfterViewInit , OnInit{
  showSpinner : boolean = true;
  beingAdded : boolean = false;
  AccountForm : FormGroup ;
  accountTypeList : any ;
  rsrcTitle : String = "Accounts";
  parentSelectedValue : any;
  @Output('datachanged') dataAddedFlag : EventEmitter<any> = new EventEmitter();
  public searchParentAjax : Select2AjaxOptions;
  public options: any;

  constructor(private http:HttpClient , private _accountService:AccountService , private _accountTypeService:AccountTypeService , private fb:FormBuilder ,
              public _permService : PermissionService , private _notify : NotifierService , private _authService: AuthenticationService ,
            private $state : StateService){
  }
  ngOnInit(){
    let that = this ;
    this.parentSelectedValue = '';

    this.AccountForm = this.fb.group({
      title : ['' ,[ Validators.required , Validators.minLength(4) ] ],
      account_type : ['' , Validators.required] ,
      parent : ['' ]
    });

    //Taking care of authorization
    let access_token = this._authService.token;

    let session = sessionStorage.getItem('session') || '';

    //Add search client ajax options
    this.searchParentAjax = {
      url : function (params ) {
          console.log("Parameters :" , params)
          return environment.apiUrl+'account/select2/'+(params.term || ' ' );
      } ,
      cache : false ,
      headers : {
        "Authorization" : "Bearer "+access_token,
        session
      }, 
      processResults : (data : any) => {
        return {
          results : [{id:' ' , text : 'None'}].concat(
              $.map(data , function(obj){
                return {id:obj._id , text: obj.title  , type_id : obj.account_type_id._id ,type : obj.account_type_id.type , type_title : obj.account_type_id.title}
              })
            )
        }
      }
    };
    console.log("Account form is being initialized" , this.searchParentAjax , access_token);

    this.options = {
            width:'100%' , height:'100%',
            allowClear: true , placeholder: '---Select Parent---',
            minimumInputLength: 3 , ajax: this.searchParentAjax
    }
  }
  ngAfterViewInit() : void {
    let that = this;
    this._accountTypeService.getAll().subscribe(resp =>
      {
        that.showSpinner = false;
        // if (resp.length ==0) {
        //   that.noAccountTypes = true
        // }else
        //   that.noAccountTypes = false
        this.accountTypeList =  resp;
      });


  }
  ngOnDestroy(): void {

  }
  addAccount(){
    //In case a request is already in queue
    if(this.beingAdded)
    {
      return false;
    }

    if(this.AccountForm.invalid)
    {
      this.AccountForm.markAllAsTouched();
      return false;
    }

    //Showing preloader
    this.beingAdded = true;

    this._accountService.create(this.AccountForm.getRawValue() )
      .subscribe(resp => {
        this._notify.notify("success" , resp.message )
        //removing Spinner
        this.beingAdded = false;

        //Reseting form
        this.AccountForm.reset()
        this.parentSelectedValue = '';

        //Informing parent component about data change
        this.dataAddedFlag.emit();
        //close modal box
        $(".close").first().click();
      } , err=>{
        console.log("Error occured while adding" , err)
        //removing Spinner
        this.beingAdded = false;

        this._notify.notify("error" , err.error ? err.error : "Something went wrong while adding account !" )
      })
  }
  changedParent(evt){

    this.AccountForm.controls.parent.setValue(evt.value);
    if(evt.value == " "){
      //User has selected none as parent then remove read only property
      this.AccountForm.get('account_type').enable({ onlySelf: false })
      return ;
    }

    this.AccountForm.controls.account_type.setValue(evt.data[0].type_id);
    this.AccountForm.get('account_type').disable({ onlySelf: true })
    console.log("Parent changed" , evt , "Form "  , this.AccountForm.value);
  }

}
