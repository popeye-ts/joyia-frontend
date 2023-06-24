import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { Subject } from 'rxjs';
import { AccountTypeService } from '@services/accountType.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
import { PermissionService } from "@services/permissions.service";
import { asIconPicker }   from "jquery-asIconPicker";
import { NotifierService } from "angular-notifier";
import { StateService } from '@uirouter/angular';

@Component({
  selector : 'accountType',
  templateUrl: './accountType.component.html',
  styleUrls: ['./accountType.component.scss']
})
export class AccountTypeComponent implements AfterViewInit , OnInit{
  pageData : any;
  showSpinner : boolean = true;
  beingAdded : boolean = false;
  AccountTypeForm : FormGroup ;
  accountTypeList :any[];
  filters : any ;
  totalAccountTypes : Number ;
  active : Number ;
  pagination : Number[];

  rsrcTitle : String = "AccountType";
  itemSelected : boolean =  false;
  noAccountTypes : Boolean = false;
  public searchBlock : any;
  public dataBlock  :any;
  constructor(private _accountTypeService:AccountTypeService  , private fb:FormBuilder ,
              public _permService : PermissionService , private _notify : NotifierService ,
            private $state : StateService){
    this.totalAccountTypes = 0;
    this.pageData = {
      title: 'All Account Types',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Account Type List'
        }
      ]
    };
    this.filters = {
      limit : 10 ,
      skip : 0 ,
      sorttype : 'created_at',
      sortdirection : -1
    };
    this.pagination = [1];
    this.active = 1;
  }
  ngOnInit(){
    let that = this ;
    this.inflateData();
    this.AccountTypeForm = this.fb.group({
      title : ['' , Validators.required],
      type : ['Credit' , Validators.required]
    });

  }
  inflateData(){
    let that = this;
    this._accountTypeService.getAll().subscribe(resp =>
      {
        that.showSpinner = false;
        if (resp.length ==0) {
          that.noAccountTypes = true
        }else
          that.noAccountTypes = false
        this.accountTypeList =  resp;
      });

  }
  ngAfterViewInit() : void {
    let that = this;
    $(".dropdown-menu-right a").on("click", function (event) {
      $(".dropdown-menu-right .dropdown-item").removeClass("active");
      $(this).addClass("active");
      $("#records").text($(this).text() );
        that.filters.limit = parseInt($(this).text());
        that.inflateData();
    });
    $(".filter").on("click", function (event) {
      $("#sortBy").text("Order By "+$(this).text() );
      that.filters.sortdirection = that.filters.sortdirection*-1;
        that.inflateData();
    });

    //taking care of check boxes
    setTimeout(() => {
      console.log("Checkbox length " , $('.item:checkbox').length)
      $('.item:checkbox').on('change' , ()=>{
        that.itemSelected = $('.item:checkbox:checked').length > 0;
      } );
    }, 200);

  }
  ngOnDestroy(): void {

  }
  checkAll(evt):void {
     $('.custom-control-input').not(evt.target).prop('checked', evt.target.checked);
  }

  showAll(evt){

  }

  addAccountType(){
    console.log("New Account Type added" , this.AccountTypeForm.value)
    if(this.AccountTypeForm.invalid)
    {
      return false;
    }
    //Showing preloader
    this.beingAdded = true;

    this._accountTypeService.create(this.AccountTypeForm.value )
      .subscribe(resp => {
        this.inflateData();
        this._notify.notify("success" , resp.message )
        //removing Spinner
        this.beingAdded = false;

        //Reseting form
        this.AccountTypeForm.reset()
        //
        $(".selectedIcon").removeClass("selectedIcon");
        //close modal box
        $(".close").first().click();
      } , err=>{
        this._notify.notify("error" , err.message )
      })
  }
  anItemSelected()
  {
    return $('.item:checkbox:checked').length > 0;
  }
  checkBoxStateChange(){
    this.itemSelected = this.anItemSelected()
  }
  deleteAccountType(){
    let allTobeDeleted = $('.item:checkbox:checked');
    //getting all the ids from the data attribute of the input check boxes
    let arrIds = allTobeDeleted.map((inpObj)=>{
      return $ (allTobeDeleted.get(inpObj) ).attr('data')
    })
    let Ids = arrIds.get()
    console.log("Ids which will be deleted" , Ids );
    //ask the server to delete these
    this._accountTypeService.deleteAccountType(Ids)
      .subscribe(
        resp=>{
          this._notify.notify("success" , resp.message );
          this.inflateData();
        } ,
        err=>{
          this._notify.notify("success" , err.error )
        })
  }
  searchAccountType(event)
  {
    let inpVal =  event.target.value.toLowerCase();
    let allIconDivs = $(".class-name");
    allIconDivs.each((i ,div )=>{
       let divText = $(div).text();

       //validate against the search criteria
       if(divText.toLowerCase().indexOf(inpVal) != -1)
        {
          $(div).closest(".glyph").show();
        }else
        {
          $(div).closest(".glyph").hide();
        }
    })
  }
  search(event){
    let that = this;
    this.showSpinner = true;
    //Getting the search value
    let queryString =  event.target.value;

    this._accountTypeService
      .search(queryString)
      .subscribe(
          resp=>{
            console.log("accountType search response " , resp);

            this.accountTypeList =  resp;
            this.showSpinner = false;
          } ,
          error=>{
              console.log("An error occured" , error)
              this.showSpinner=false;
          })
  }

  singleSelected()
  {
    return ( $('.catInp.custom-control-input:checked').length ==1);
  }
  editAccountType(){
    let id = $('.custom-control-input:checked').attr("id")
    console.log("Accont typeto edit" , id );
    // this.$state.go("store.productForm" , {id : id});
  }

}
