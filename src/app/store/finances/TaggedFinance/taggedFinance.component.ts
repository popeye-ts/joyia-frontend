import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
import { Select2OptionData } from 'ng2-select2';
import { AuthenticationService } from '@services/authentication.service';
import { financeService } from '@services/finance.service';
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";
import { DatePipe } from '@angular/common';
import { FinanceFilterComponent } from "./../Filters/filter.component";
import { StateService } from '@uirouter/angular';
import { saveAs } from 'file-saver';
import * as jwt_decode from "jwt-decode";

class DataTablesResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}
@Component({
  selector : 'tagged-finance',
  templateUrl: './taggedFinance.component.html',
  styleUrls: ['./taggedFinance.component.scss']
})
export class TaggedFinanceComponent implements AfterViewInit , OnInit{
  @ViewChild(DataTableDirective  , {static : false}) dtElement : DataTableDirective;
  @ViewChild(FinanceFilterComponent ,  { static : true }) filterElementRef : FinanceFilterComponent;

  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<any> = new Subject();
  pageData : any;
  FinanceForm : FormGroup ;
  financesList :any[];
  markedList : string [] = [];
  beingMarked : boolean = false;

  //For edit modal
  selectedAccountProduct : any ;
  public addAccountAjax : Select2AjaxOptions ;
  public options : any ;
  public state: Number = 0;
  private statesArr : String[] = ["No operation" , "Being Submitted" , "Submitted" , "Error" ]
  //User has changed number of rows to show
  static dataLengthChanged : boolean = true;
  //Numbe of finance rows html
  static numFinances : any = "Displaying 1-10 of 400 finance rows";
  //For optimization in case a request is already made cancel that
  ajaxCallSubscription : any;

  //Search filters
  filtersHidden : boolean = true;
  filtersJSON : any = {};
  //To show summary
  sumDebit : number = 0;
  sumCredit : number = 0;

  //In case we have no data
  noFinances : Boolean = false;
  constructor( private http:HttpClient , private fb:FormBuilder , private $state : StateService ,
               private _authService: AuthenticationService , private _financeService : financeService,
               private notifier : NotifierService , public _permService : PermissionService ,  private datePipe : DatePipe ){
    this.pageData = {
      title: 'All Finances',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Finances'
        },
        {
          title: 'Tagged Finances List'
        }
      ]
    };

  }
  ngOnInit(){
    let that = this ;
    //data table options

    //Taking care of authorization
    let access_token = this._authService.token || '';

    let decodedToken = jwt_decode(access_token);
    let user_id = decodedToken.user_id;

    this.FinanceForm = this.fb.group({
      account: ['', Validators.required],
      amount: ['0' , [Validators.required , Validators.min(1)] ]
      , type: ['Debit']
      , description:['No description.' , [Validators.required ]]
    });

    that.dtOptions = {
        serverSide : true ,
        processing: true ,
        pageLength: 10 ,
        searching : true,
        lengthChange: true,
        destroy: true,
        info: false,
        order : [[ 5 , "desc"]],
        dom: '<"row view-filter"<"col-sm-12"<"float-left"l><"float-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>',
        ajax : (dataTablesParameters: any, callback) =>{
          if ( that.ajaxCallSubscription ) {
             that.ajaxCallSubscription.unsubscribe();
          }
          //Since new request is initiating so clearing totals
          that.sumCredit = that.sumDebit = 0;

          //Passing filters as well
          dataTablesParameters.filters = that.filtersHidden ? {} : that.filtersJSON;
          dataTablesParameters.filters.taggedOnly = true;
          
  				that.ajaxCallSubscription =
				  that.http.post<DataTablesResponse>(environment.apiUrl+'finance/AccountsDatatable' , dataTablesParameters , {})
                      .subscribe(resp=>{
              					let finances = [];
                        if(resp.recordsTotal == 0)
                          that.noFinances = true;
                        else
                          that.noFinances = false;
                        this.financesList = [...resp.data];
                        resp.data.forEach(finance => {

                          //For summary
                          if(finance.entry_type == "Debit"){
                            that.sumDebit += parseInt(finance.amount);
                          }else if(finance.entry_type == "Credit"){
                            that.sumCredit += parseInt(finance.amount) ;
                          }
                          finance.other = '';

                          //Beautifying amounts
                          finance.amount = that.formatMoney(finance.amount , 0 );
                          //Transforming date
                          finance.created_at = this.datePipe.transform(finance.created_at , 'dd.MM.yy hh:mm a')

                          finance.created_by = finance.creator.username;

                          let markedByAgents = finance.marked_by || [];
                          
                          if(markedByAgents.includes(user_id)){
                            let color = 'green';
                            if(finance.creator.preferences)
                              color = finance.creator.preferences.color;
                            finance.marked_color = color;
                          }
                          //In case we have client ionfo
                          if(finance.client){
                            finance.other=`Name : <a class='client_detail' href='javascript:void(0)' data='${finance.client._id}'>${finance.client.personal_info.name}</a><br>Cnic :${finance.client.personal_info.cnic}`;
                          }
                          // console.log("Finance row" , finance);

                          //For finance rows having orders
                          if(finance.order){
                            finance.title = `<a class='order_detail' href='javascript:void(0)' data='${finance.order._id}'> Order_${finance.order.order_id}</a>`;
                            finances.push(finance);
                            return ;
                          }

                          //For finance rows having accounts
                          if(finance.account){
                            finance.title = finance.account.title;
                            finances.push(finance);
                          }

                        })
                        // console.log("Data after manipulation", groupedData)
                        if(that.filterElementRef && that.filterElementRef.filtersBeingApplied)
                          that.filterElementRef.filtersBeingApplied=false;

                        callback({
                          recordsFiltered:resp.recordsFiltered,
                          recordsTotal : resp.recordsTotal,
                          data : finances
                        });
  					$('#overlay').hide();
  				});
			   } ,
         columns : [ {data:'title'} , {data:'other'} , 
         {data : 'amount'} , {data: 'entry_type'} , 
         {data : 'created_by'} , 
         { data :'created_at'} , {data : 'comment'} , 
          ] ,
        language: {
          paginate: {
            first : "<<",
            last: ">>" ,
            previous: "<i class='simple-icon-arrow-left'></i>",
            next: "<i class='simple-icon-arrow-right'></i>"
          }
        },
        drawCallback: function () {
          that.unCheckAllRows();
          
          //Order click functionality
          (<any>$)(".order_detail").click(function(event) {
            let _id = event.target.attributes.data.nodeValue;
            that.$state.go('store.orderdetail' , {id : _id})
          })
          //Client click functionality
          setTimeout(() => {
            (<any>$)(".client_detail").click(function(event) {
              let _id = event.target.attributes.data.nodeValue;
              console.log("client id" , _id);

              that.$state.go('store.clientform' , {id : _id})
            })
          }, 500);

          //Account click functionality
          // (<any>$)(".account_detail").click(function(event) {
          //   let _id = event.target.attributes.data.nodeValue;
          //   that.$state.go('store.accountdetail' , {id : _id})
          // })

          $("#checkAllDataTables").prop("checked", false);
          $("#checkAllDataTables").prop("indeterminate", false).trigger("change");

          $($(".dataTables_wrapper .pagination li:first-of-type"))
            .find("a")
            .addClass("prev");
          $($(".dataTables_wrapper .pagination li:last-of-type"))
            .find("a")
            .addClass("next");
          $(".dataTables_wrapper .pagination").addClass("pagination-sm");
          var api = $(this).dataTable().api();

          $("#searchDatatable").on("change", function (event) {
            api.search($("#searchDatatable").val().toString()).draw();
          });
          //Shosing drop down for selections
          $("#financeCountDatatable .dropdown-menu a").on("click", function (event) {
            //Showing spinner
            TaggedFinanceComponent.dataLengthChanged = true;

            $(".dropdown-item").removeClass("active");
            $(this).addClass("active");
            $("#records").text($(this).text() );
              api.page.len(parseInt($(this).text())).draw();
          });
          $("tbody").append(`<tr role="row" class="odd totals">
                                              <td tabindex="0"></td>
                                              <td></td>
                                              <td></td>
                                              <td class=""></td>
                                              <td class="sorting_1"></td>
                                              <td><span class="underline">Total Debit: </span> ${that.formatMoney(that.sumDebit , 0)}/_</td>
                                              <td><span class="underline">Total Credit: </span> ${that.formatMoney(that.sumCredit , 0)}/_</td>
                            </tr>`);

          //Getting the datatable api info for future use
          let dtInfo = api.page.info();
          //Page records count
          TaggedFinanceComponent.numFinances = "Displaying " +(dtInfo.start + 1) + "-" + dtInfo.end + " of " + dtInfo.recordsDisplay + " finance rows ";
          //In case filtering is applied
          if(dtInfo.recordsTotal != dtInfo.recordsDisplay)
            TaggedFinanceComponent.numFinances += `(filtered from ${dtInfo.recordsTotal})  `;
          TaggedFinanceComponent.dataLengthChanged = false;

          $("#pageCountDatatable .dropdown-menu a").on("click", function (event) {
            $(".dropdown-item").removeClass("active");
            $(this).addClass("active");
            $("#records").text($(this).text() );
              api.page.len(parseInt($(this).text())).draw();
          });
          $(".finance-checkbox").on('click' , function(event : any) {
            let _id = event.target.attributes.data.nodeValue;
            let row = $(this).closest("tr");
            if(event.target.checked){
              $(row).css("box-shadow" , "0 3px 30px rgb(0 0 0 / 10%), 0 3px 20px rgb(0 0 0 / 10%)");
              that.markedList.push(_id); 
            }else{
              $(row).css("box-shadow" , "");
              that.markedList = that.markedList.filter(id=>id!=_id); 
            }
          })
        },
        createdRow :  function (row, data : any, dataIndex) {
          console.log("Datya" , data)
          if(data.marked_color){
            $(row).find("td").first().css("border-left", "3px solid "+data.marked_color)
          }
        }
      };

      $('#datatableRows tbody').on('click', 'tr', function () {
        $(this).toggleClass('selected');
        var $checkBox = $(this).find(".custom-checkbox input");
        $checkBox.prop("checked", !$checkBox.prop("checked")).trigger("change");
        that.controlCheckAll();
      });




      $("#checkAllDataTables").on("click", function (event) {
        var isCheckedAll = $("#checkAllDataTables").prop("checked");
        if (isCheckedAll) {
          that.checkAllRows();
        } else {
          that.unCheckAllRows();
        }
      });

  
    let session = sessionStorage.getItem('session') || '';

    //Add search account ajax options
    this.addAccountAjax = {
      url : function (params ) {
          return environment.apiUrl+'account/select2Finance/'+(params.term || ' ' );
      } ,
      cache : false ,
      headers : {
        "Authorization" : "Bearer "+access_token,
        session
      },
      processResults : (data : any) => {
        return {
          results : $.map(data , function(obj){
                return {id:obj._id , text: obj.title , type_id : obj.account_type_id._id ,type : obj.account_type_id.type , type_title : obj.account_type_id.title }
              })
        }
      }
    };
    this.options = {
            width:'100%' , height:'100%',
            allowClear: true , placeholder: '---Select Account---',
            minimumInputLength: 3 , ajax: this.addAccountAjax
    }


  }
  ngAfterViewInit() : void {


    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
  formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;

      return negativeSign +
            (j ? i.substr(0, j) + thousands : '') +
            i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
            (decimalCount ? decimal + Math.abs(amount - <any>i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
      console.log(e)
    }
  };

  //Filters Work
  toggleFilters(toSet){
    this.filtersHidden  = toSet;
    if(toSet)
      $( ".responsive-background" ).hide( "slow" );
    else
      $( ".responsive-background" ).show( "slow" );
  }
  applyFilters(val){
    this.filtersJSON = {};
    //Getting all keys first
    Object.keys(val)
    //Getting all values as array
    .map ( k =>{
                if(val[k].trim() != "")
                  this.filtersJSON[k] = val[k];
              });
    //Filtering non-null values
    console.log("Filters object" , this.filtersJSON);

    // this.rerender();4
    this.dtTrigger.next();
  }

  //helper
  unCheckAllRows() {
    $('#datatableRows tbody tr').removeClass('selected');
    $('#datatableRows tbody tr .custom-checkbox input').prop("checked", false).trigger("change");
  }
  checkAllRows() {
    $('#datatableRows tbody tr').addClass('selected');
    $('#datatableRows tbody tr .custom-checkbox input').prop("checked", true).trigger("change");
  }
  getSelectedRows() {
          //Getting Selected Ones
      //    console.log(this.$dataTableRows.rows('.selected').data());
        }
  controlCheckAll() {
      var anyChecked = false;
      var allChecked = true;
      $('#datatableRows tbody tr .custom-checkbox input').each(function () {
        if ($(this).prop("checked")) {
          anyChecked = true;
        } else {
          allChecked = false;
        }
      });
      if (anyChecked) {
        $("#checkAllDataTables").prop("indeterminate", anyChecked);
      } else {
        $("#checkAllDataTables").prop("indeterminate", anyChecked);
        $("#checkAllDataTables").prop("checked", anyChecked);
      }
      if (allChecked) {
        $("#checkAllDataTables").prop("indeterminate", false);
        $("#checkAllDataTables").prop("checked", allChecked);
      }
    }
  selectAccountChanged(evt){

    this.FinanceForm.controls.type.setValue(evt.data[0].type);
    this.FinanceForm.controls.account.setValue(evt.value);
  }
  addFinance(){
    let that = this;
    //In case a request is already in queue
    if(this.state == 1 || this.state == 2)
    {
      return false;
    }
    //In case the form is invalid
    if(this.FinanceForm.invalid)
    {
      this.FinanceForm.markAllAsTouched();
      return false;
    }

    let formData = this.FinanceForm.value;
    this.state = 1 ;

    this._financeService.createAccount(formData).subscribe(response => {
      that.rerender()
      // that.rerender();
      that.state = 2;
      this.FinanceForm.reset();

      //informing parent that data has changed
      that.notifier.notify("success" , "Installment successfuly added.");

      //Closing modal
      $(".close").first().click();

      //Seetting state back to original
      setTimeout(() => {
        that.state = 0 ;
      }, 3000);
    } , error=>{
      that.state = 3 ;
      console.log(error)
      that.notifier.notify("error" , error.error.error ? error.error.message : error.error.message);
      //Seetting state back to original
      setTimeout(() => {
        that.state = 0 ;
      }, 3000);
    })

  }
  get numFinances(){
    return TaggedFinanceComponent.numFinances;
  }
  get dataLengthChanged(){
    return TaggedFinanceComponent.dataLengthChanged;
  }


  get currentState(){
    return this.state;
  }
  downloadFile() {
    const getNestedObject = (nestedObj, pathArr) => {
      return pathArr.reduce((obj, key) =>
          (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
    }
    console.log("What i have in finances " , this.financesList )
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    let count= 0;

    const header = ['Sr' ,'title', 'name' , 'cnic' , 'other','amount','entry_type','created_at','comment' ];
    let csv = this.financesList.map(finance=>{
      let objToReturn = [ `${++count}`];
      
      //taking care of title
      let title = '';
      
      //For finance rows having orders
      if(finance.order){
        title = `Order_${finance.order.order_id}`;
      }

      //For finance rows having accounts
      if(finance.account){
        title = finance.account.title;
      }
      objToReturn.push(title);


      let name = '', cnic = '';
      if(finance.client){
        name = getNestedObject(finance , ["client","personal_info", "name"]);
        cnic = getNestedObject(finance , ["client","personal_info", "cnic"]);
      }
      objToReturn.push(name);
      objToReturn.push(cnic);
      
      //Taking care of other
      let other = '';
      objToReturn.push(other);

      let amount : any = (finance.amount+'');
      objToReturn.push(amount.replaceAll(',',''));

      //Take care of entry type
      let entry_type = finance.entry_type;
      objToReturn.push(entry_type);

      //Take care of creation date
      let created_at = finance.created_at;
      objToReturn.push(created_at);

      //Take care of comment
      let comment = finance.comment || '';
      objToReturn.push(comment);

      return objToReturn.join(" , ")
    });
    csv.unshift(header.join(','))
    let csvArray = csv.join('\r\n');
    var blob = new Blob([csvArray], {type: 'text/csv' })
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!

    saveAs(blob, dd+'_'+mm+"_finances.csv");
  }
  unSelectAll(){
    $(".finance-checkbox:checked").click()
    setTimeout(() => {
      console.log("List i have :" , this.markedList);
    }, 2000);
  }
  selectAll(){
    $(".finance-checkbox:not(:checked)").click();
    setTimeout(() => {
      console.log("List i have :" , this.markedList);
    }, 2000);
  }
  async updateMarked(){
    try{
      this.beingMarked = true;
      let resp = await this._financeService.updateMarked(this.markedList).toPromise()
      this.rerender()
      console.log("Response i have ", resp )
    }catch(error){
      console.log("An error occured while marking " , error);
    }finally{
      this.beingMarked = false;
    }
  }
}
