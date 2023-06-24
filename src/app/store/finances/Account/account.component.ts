import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { AccountService } from '@services/account.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { PermissionService } from "@services/permissions.service";
import { StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";
@Component({
  selector : 'account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements AfterViewInit , OnInit{
  @ViewChild('empty_item' , {static : true}) empty_item ;
  pageData : any;
  accountList :any[] = [];
  filters : any ;
  totalAccounts : Number ;
  active : Number ;
  pagination : Number[];
  selectedAccount : any ;
  rsrcTitle : String = "Accounts";
  noAccounts : Boolean = false;

  //For tree like structure templating

  public options = { fixedDepth: true };// as NestableSettings;
    public list = [
        { 'id': 1 },
        {
          'expanded': true,
          'id': 2, 'children': [
            { 'id': 3 },
            { 'id': 4 },
            {
              'expanded': false,
              'id': 5, 'children': [
                { 'id': 6 },
                { 'id': 7 },
                { 'id': 8 }
              ]
            },
            { 'id': 9 },
            { 'id': 10 }
          ]
        },
        { 'id': 11 }
      ];
  //preloader
  preloader : boolean = true;
  constructor(public _accountService:AccountService  , private fb:FormBuilder , public _permService : PermissionService ,
    private $state : StateService , private notifier: NotifierService){
    this.totalAccounts = 0;
    this.pageData = {
      title: 'All Accounts',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Account List'
        }
      ]
    };
    this.filters = {
      parent : null ,
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
    this.inflateData(null);
  }
  inflateData(identifier){
    let that = this;
    //In case we have o fetch whole list show spinner
    if(identifier == null){
      this.preloader = true;
    }
    this._accountService.getByParent(this.filters).subscribe(resp =>
      {
        //Just renaming column _id to id
        resp = resp.accounts.map( ({ _id: stroke, ...rest })=>{
          let obj: any ={id:stroke,expanded :false, ...rest };
          if(obj.childrenCount> 0)
            obj.children = [{id : 7, title : 'Fetching ...'}]
          return obj;
        });

        //Normalizing array
        //In case there are no accounts in database for this store
        if(resp.count == 0)
          that.noAccounts = true;
        else
          that.noAccounts = false;


        //Setting the loading spinner off
        //in case id is set that means a particular child is requesting children
        var lstTemp;
        let obj = this.findAccount(this.accountList, identifier);

        if(identifier){
          obj.childrenBeingFetched = false;
          obj.$$expanded = true;
          obj.children = resp;
          lstTemp = this.accountList;
          this.accountList = [];
          setTimeout(() => {
            this.accountList = lstTemp ;
          }, 0);

        }else{
          //in case index is null that means whole account list is being fetched
          this.preloader = false;
          this.accountList = resp;
        }

        this.totalAccounts =  resp.count;

        //Finding currently active page
        that.active = Math.ceil(that.filters.skip / that.filters.limit) +1 ;

        //Finding total pages
        let totalPages  = Math.ceil(
          resp.count /
          that.filters.limit) ;

        let pStr= "";
        for(let i=1 ; i <= totalPages ; i++ )
          pStr+=i+" ";
        that.pagination = pStr.trim().split(" ").map(Number);
      });


  }
  ngAfterViewInit() : void {
    let that = this;
    $(".dropdown-menu-right a").on("click", function (event) {
      $(".dropdown-menu-right .dropdown-item").removeClass("active");
      $(this).addClass("active");
      $("#records").text($(this).text() );
        that.filters.limit = parseInt($(this).text());
        that.inflateData(null);
    });
    $(".filter").on("click", function (event) {
      $("#sortBy").text("Order By "+$(this).text() );
      that.filters.sortdirection = that.filters.sortdirection*-1;
        that.inflateData(null);
    });

  }
  ngOnDestroy(): void {

  }
  //This method will be called by child component when an account is added or operated on
  accountAdded(evt){
    this.accountList = [];
    //Mean new data added
    //Setting parent param
    this.filters.parent = null;
    this.inflateData(null);
  }
  searchAccounts(event:any):void {
    let inp = event.target;
    if(inp.value.length < 3)
      {
        $('#searchText').text('Minimum 3 letters');
                $('#searchText').show();
        return ;
      }
    $('#searchText').hide();

  }
  change(pNum) : void {
    if(this.active == pNum)
      return ;
    console.log("Page Number" ,pNum);

    //check if its the first number
    if(pNum == 1)
      {
        this.filters.skip = 0;
        this.inflateData(null);
        return ;
      }
    //check if its the last number

    this.filters.skip = (pNum-1)*this.filters.limit;
    this.inflateData(null);
    console.log("Its last");
    console.log("Skip : " + this.filters.limit*(pNum-1 ) );
  }
  showAll(evt){
    this.selectedAccount = null;
    console.log("Showing all");
  }
  singleSelected()
  {
    return ( $('.accountInp.custom-control-input:checked').length ==1);
  }
  editAccount(){
    let id = $('.custom-control-input:checked').attr("id")
    this.$state.go("store.accountForm" , {id : id});
  }
  deleteAccounts(){
    let accountsLst = $('.accountInp.custom-control-input:checked');
    console.log("Accounts selected to delete" , accountsLst , accountsLst.length)
    if(accountsLst.length >0 )
    {
      //Making an array of ids to remove
      let ids =  (accountsLst.map((index , elem)=>{
        return   $(elem).attr("id")
      } )).toArray();


      //Sendinga delete request
      this._accountService
        .remove({ids : ids})
        .subscribe(
          resp=>{
            //Rfresh the accounts list
            this.inflateData(null);
            this.notifier.notify("success", resp.message );
          },
          err=>{
            this.notifier.notify("error", err.error );
          })
    }else{
      this.notifier.notify("error", "Please select a account to delete." );
    }
  }

    collapseAll() {
    }

    expandAll() {
    }
    onRowDelete(event){
      console.log("On row delete event called " , event);
      const data = event.data;
      setTimeout(() => {
        event.resolve();
      }, 1000);
      //Send request to server to remove the account
      this._accountService
        .deleteAccount(data.id)
        .subscribe(resp => {
          console.log("Response from accounts" , resp)
        } , err =>{
            console.log("Error in accounts " , err);

        })
    }
    onRowEdit(event){
      console.log("On row edit event called " , event.target);
      const data = event.data;
      setTimeout(() => {
        event.resolve();
      }, 1000);
    }
    onRowAdd(event){
      console.log("On row add event called " , event.target);
      const data = event.data;
      setTimeout(() => {
        event.resolve();
      }, 1000);
    }
    openAddAccountModal(){
      console.log("add account modal");
       (<any>$('.accountFormModal')).modal('show');
    }
    onAdd(evt){

    }
    onRowSave(evt){

    }
    onDrag(evt){
      console.log("Drag event" , evt)
    }
    onDrop(evt){
      console.log("Drop event" , evt)
    }
    onDisclosure(e) {
      console.log("Disclosure event", e , "Before" , this.accountList ,"::::" , e.item.$$id );
      if(e.expanded == false){
        //In case the item is expanded simply colapse
        return ;
      }
      let id = e.item.id;
      // let index = this.getIndexById(id);
      //Setting the expand arrow to false untill data fetched
      // this.accountList[index].$$expanded = false;
      //Setting the spinner
      let obj = this.findAccount(this.accountList, id);

      //In case a request is already in progress
      if(obj.childrenBeingFetched)
      {
        return ;
      }
      obj.childrenBeingFetched = true;
      //Setting the parent in filter
      this.filters.parent = obj.id;
      //Fetching the childrens
      this.inflateData(id);
      console.log("After" , this.accountList );

    }
    getIndexById(id ){
      for (let index = 0; index < this.accountList.length; index++) {
        if(this.accountList[index].id == id){
            return index;
        }
      }

    }
    // findNested(obj, key, value) {
    //   // Base case
    //   if (obj[key] === value) {
    //     return obj;
    //   } else {
    //     for (var i = 0, len = Object.keys(obj).length; i < len; i++) {
    //       if (typeof obj[i] == 'object') {
    //         var found = this.findNested(obj[i], key, value);
    //         if (found) {
    //           // If the object was found in the recursive call, bubble it up.
    //           return found;
    //         }
    //       }
    //     }
    //   }
    // }
    findAccount(lst , id){
      if(lst)
      for (let index = 0; index < lst.length; index++) {
        const element = lst[index];
        if(element.id == id)
          return lst[index];

        let found = this.findAccount(lst[index].children , id);
        if(found){
          return found;
        }
      }
      return null;
    }

}
