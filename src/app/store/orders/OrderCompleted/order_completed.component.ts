import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , ElementRef , ViewEncapsulation } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DatePipe } from '@angular/common';
import { StateService } from '@uirouter/angular';
import { PermissionService } from "@services/permissions.service";

import { Observable , of , fromEvent } from 'rxjs';
import { AuthenticationService } from '@services/authentication.service';
import { FilterComponent } from "../filters/filter.component";
import {
  debounceTime ,
  map ,
  distinctUntilChanged ,
  filter
} from 'rxjs/operators';
// import {map , debounceTime , distinctUntilChanged , switchMap , do , pluck} from 'rxjs/operators';
declare var $ : any;

class DataTablesResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}
@Component({
  selector : 'CompletedOrderList',
  templateUrl: './order_completed.component.html',
  styleUrls: ['./order_completed.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CompleteOrderLstComponent implements AfterViewInit , OnInit{
  @ViewChild(DataTableDirective  , {static : false}) dtElement : DataTableDirective;
  @ViewChild('ordersSearch', { static: true }) ordersSearchInput: ElementRef;
  @ViewChild(FilterComponent ,  { static : true }) filterElementRef : FilterComponent;

  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<any> = new Subject();
  pageData : any;
  noOrders : boolean = false;
  rsrcTitle : String = "Completed Orders";
  static beingSearched : boolean = false;
  ajaxFirstCall : boolean = true ;
  //For optimization in case a request is already made cancel that
  ajaxCallSubscription : any;
  static dataLengthChanged : boolean = true;
  //Pagination data
  static numOrders : any = "Displaying 1-10 of 40 orders";
  //Search filters
  filtersHidden : boolean = true;
  filtersJSON : any = {};

    constructor(private http:HttpClient , private datePipe : DatePipe , private $state : StateService ,
      public _permService : PermissionService , private _authService: AuthenticationService){
      this.pageData = {
        title: 'All Completed Orders',
        loaded: true,
        breadcrumbs: [
          {
            title: 'Dashboard'
          },
          {
            title: 'Complete Orders List'
          }
        ]
      };

    }
    ngOnInit(){
      let that = this ;

      //making an array to group data based on clients
      let groupedData = [];

      that.dtOptions = {
          serverSide : true ,
          processing: true ,
          pageLength: 10 ,
          searching : true,
          lengthChange: true,
          destroy: true,
          order : [[ 5 , "desc"]] ,
          info: false,
          dom: '<"row view-filter"<"col-sm-12"<"float-left"l><"float-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>',
          ajax : (dataTablesParameters: any, callback) =>{
          if ( this.ajaxCallSubscription ) {
             this.ajaxCallSubscription.unsubscribe();
          }
          setInterval(()=>{
            var $td = $('td[colspan="6"]'); // find the td element or elements to change. 
            $td.attr('colspan', 1); // set the attribute to 4 for all the selected elements.
          } , 20)
          //Passing filters as well
          dataTablesParameters.filters = that.filtersHidden ? null : that.filtersJSON;
          
  				this.ajaxCallSubscription =
            that.http.post<DataTablesResponse>(environment.apiUrl+'order/completed-datatable' , dataTablesParameters , {})
                        .subscribe(resp=>{
                          // return callback({
                          //   recordsFiltered:resp.recordsFiltered,
                          //   recordsTotal : resp.recordsTotal,
                          //   data : resp.data
                          // });
                          console.log("Whats in response " , resp )
                          //Removing all previous data
                          groupedData = [];

                          //Settng search spinner
                          CompleteOrderLstComponent.beingSearched = false;
                          //Order count spinner
                          CompleteOrderLstComponent.dataLengthChanged = false;

                          //in cse we have no orders
                          // console.log(resp , "response")
                          if(resp.recordsTotal == 0 && that.ajaxFirstCall )
                              this.noOrders = true;

                          //Ajax will make second and onward calls from this point on
                          that.ajaxFirstCall = false;

                          for(let i=0 ; i<resp.data.length ; i++)
                            {
                              //this iteration object
                              let objAtI = resp.data[i];

                              //Making an id attribute
                              // if client exists then client id else order id
                              let idForRow = objAtI.client && objAtI.client._id ? objAtI.client._id: objAtI._id;

                                //Check if any order from same client already exists in array or not
                                if(groupedData[idForRow] )
                                {
                                  //Order already exists
                                  //Handle products
                                  //Now up until now we had an order and against each order
                                  //We used to have products
                                  //But now we have to make changes such that for each order we justhave to append a batch
                                  //A batch is an order of a client taken during a session or an instant
                                  let products = [];
                                  if(objAtI.batches){
                                     objAtI.batches.map(batch=>{
                                       products = products.concat(batch.products);
                                     })
                                  }else{
                                      products = objAtI.products;
                                  }


                                  for(let j=0 ; j < products.length ; j++)
                                    {
                                      let tempProd = products[j];
                                      let template = `<a style="cursor:pointer;" data ='${(tempProd.product_id ? tempProd.product_id._id ? tempProd.product_id._id : '' : '')}' class="badge badge-light mb-1 product_detail">
                                          ${tempProd.product_id ? tempProd.product_id.product_display_name : ''}&nbsp;
                                          <span class="badge badge-light">${tempProd.quantity}</span>
                                          </a><br>`;
                                      groupedData[idForRow].allProducts+=template;
                                    }

                                  //Handle Total Payment
                                  groupedData[idForRow].total_amount += "<br>"+this.formatMoney(objAtI.total_amount) ;

                                  //Handle Total Paid
                                  groupedData[idForRow].total_paid += "<br>"+this.formatMoney(objAtI.total_paid);

                                  //Handle last payment time
                                  groupedData[idForRow].last_payment_time += "<br>"+this.datePipe.transform(objAtI.last_payment_time , 'dd.MM.yy hh:mm a') ;

                                }else{
                                  //No order exists for this client
                                  groupedData[idForRow] = objAtI;

                                  //formatting the date
                                  groupedData[idForRow].last_payment_time = this.datePipe.transform(objAtI.last_payment_time , 'dd.MM.yy hh:mm a') ;
                                  groupedData[idForRow].allProducts = '';
                                  //Now up until now we had an order and against each order
                                  //We used to have products
                                  //But now we have to make changes such that for each order we justhave to append a batch
                                  //A batch is an order of a client taken during a session or an instant
                                  let products = [];
                                  // console.log("Order info submitted with following info" , objAtI.batches , objAtI.products);
                                  if(objAtI.batches && !(objAtI.products && objAtI.products.length > 0) ){
                                     objAtI.batches.map(batch=>{
                                       products = products.concat(batch.products);
                                     })
                                  }else{
                                      products = objAtI.products;
                                  }

                                  for(let j=0 ; j< products.length ; j++)
                                    {
                                      let tempProd = products[j];
                                      let template = `<a style="cursor:pointer;" data ='${(tempProd.product_id ? tempProd.product_id._id ? tempProd.product_id._id : '' : '')}' class="badge badge-light mb-1 product_detail">
                                          ${tempProd.product_id ? tempProd.product_id.product_display_name : ''}&nbsp;
                                          <span class="badge badge-light">${tempProd.quantity}</span>
                                          </a><br>`;
                                      groupedData[idForRow].allProducts+=template;
                                    }
                                  //Handle Total Payment
                                  groupedData[idForRow].total_amount = this.formatMoney(objAtI.total_amount);

                                  //Handle Total Paid
                                  groupedData[idForRow].total_paid = this.formatMoney(objAtI.total_paid);


                                    //Checking if the client is provided and not deleted etc
                                    if(objAtI.client == null)
                                    {
                                      groupedData[idForRow].client = {}
                                      //There are two possibilities
                                      //* The order is on full payment
                                      let isOrderOnFullPayment =
                                              groupedData[idForRow].batches.length == 1 &&
                                              groupedData[idForRow].batches[0].on_full_payment == true;
                                      if(isOrderOnFullPayment)
                                       {
                                         groupedData[idForRow].client.personal_info={
                                            name : 'Cash Order Id:'+groupedData[idForRow].order_id ,
                                            phone : 'N/A'
                                          }
                                       }else{
                                         groupedData[idForRow].client.personal_info={
                                            name : '<span class="text-red">Client Deleted</span>',
                                            phone : 'N/A'
                                          }
                                        }
                                      //* The client is deleted
                                    }
                                }
                                groupedData[idForRow].last_payment_time = groupedData[idForRow].last_payment_time + '';
                                //Rating system
                                // "simple-icon-refresh" ,
                                //Since in old system one order had one rating
                                //but now each batch have a rating so we have to handle that as well
                                let iconClass;
                                if(groupedData[idForRow].rating){
                                  //This is old order
                                  //We have a criterian that
                                  //if rating is one then exclaimation icon
                                  //if rating is five then tick icon
                                  iconClass = groupedData[idForRow].rating == 1 ? "simple-icon-exclamation" :
                                          (groupedData[idForRow].rating == 5 ? "simple-icon-check"  : false) ;
                                }else{
                                  //This is new architecture order with each batch having rating
                                  let sum = groupedData[idForRow].batches.reduce((b1 , b2)=>b1.rating+b2.rating , 0 );
                                  let batchCount = groupedData[idForRow].batches.length;
                                  let average = sum / batchCount;
                                  //We have a criterian that
                                  //if rating is one then exclaimation icon
                                  //if rating is five then tick icon
                                  iconClass = average == 1 ? "simple-icon-exclamation" : (average == 5 ? "simple-icon-check"  : false);
                                }
                                if(groupedData[idForRow].client &&  iconClass)
                                    {

                                      groupedData[idForRow].client.personal_info.name =
                                            `<i class="${iconClass} heading-icon"></i>${groupedData[idForRow].client.personal_info.name}`;
                                    }


                              }
                              //Making normalized array
                              groupedData = Object.keys(groupedData).map(k=>groupedData[k]);
                              console.log("Data after manipulation", JSON.parse(JSON.stringify(groupedData) ));
                              if(that.filterElementRef && that.filterElementRef.filtersBeingApplied)
                                that.filterElementRef.filtersBeingApplied=false;
                          callback({
                            recordsFiltered:resp.recordsFiltered,
                            recordsTotal : resp.recordsTotal,
                            data : groupedData
                          });
    					$('#overlay').hide();
    				});
  			   } ,
           columns : [ {data:'client.personal_info.name'} , {data : 'client.personal_info.phone'} ,
            {data : 'allProducts'} , {data : 'total_amount'}, {data : 'total_paid'}, 
            {data : 'last_payment_time' , className : ''}] ,
          language: {
            paginate: {
              first : "<<",
              last: ">>" ,
              previous: "<i class='simple-icon-arrow-left'></i>",
              next: "<i class='simple-icon-arrow-right'></i>"
            }
          },
          drawCallback: that.dtDrawCallBack
      //data table options
      }
    }

    dtDrawCallBack(){
        let that = this;
        //Product click functionality
        (<any>$)(".product_detail").click(function(event) {
          let _id = event.target.attributes.data.nodeValue;
          that.$state.go('store.productdetail' , {id : _id})
        })
        //Checkbox functionality
        // that.unCheckAllRows();
        $("#checkAllDataTables").prop("checked", false);
        $("#checkAllDataTables").prop("indeterminate", false).trigger("change");

        //Pagination previoius and next functionality
        $($(".dataTables_wrapper .pagination li:first-of-type"))
          .find("a")
          .addClass("prev");
        $($(".dataTables_wrapper .pagination li:last-of-type"))
          .find("a")
          .addClass("next");
        $(".dataTables_wrapper .pagination").addClass("pagination-sm");

        //Showing counts
        let api = $(this).dataTable().api();

        //Shosing drop down for selections
        $("#pageCountDatatable .dropdown-menu a").on("click", function (event) {
          //Showing spinner
          CompleteOrderLstComponent.dataLengthChanged = true;

          $(".dropdown-item").removeClass("active");
          $(this).addClass("active");
          $("#records").text($(this).text() );
            api.page.len(parseInt($(this).text())).draw();
        });
        //Page records count
        console.log($("#pageCountDatatable span").length , $("#pageCountDatatable span"));
        $("#pageCountDatatable span").html("Displaying " +(api.page.info().start + 1) + "-" + api.page.info().end + " of " + api.page.info().recordsTotal + " orders");
        CompleteOrderLstComponent.numOrders = "Displaying " +(api.page.info().start + 1) + "-" + api.page.info().end + " of " + api.page.info().recordsTotal + " orders";

        //Search datatable
        //search datatable functionality init
        fromEvent( $("#searchDatatable") ,"keyup").pipe(
          //get value
          map((event : any) => {
            return event.target.value;
          })

          //If character length is greater then two
          // , filter(res => res.length > -1  )

          //Time in milliseconds between key events
          , debounceTime(1000)

          //If previous query is different from current
          , distinctUntilChanged()

          //subscription for response
        ).subscribe((text : string )=>{
          CompleteOrderLstComponent.beingSearched = true;
          api.search(text).draw();
        });

    }
    get beingSearched(){
      return CompleteOrderLstComponent.beingSearched;
    }
    get dataLengthChanged(){
      return CompleteOrderLstComponent.dataLengthChanged;
    }
    get numOrders(){
      return CompleteOrderLstComponent.numOrders;
    }
    ngAfterViewInit() : void {

      let that = this ;
      this.dtTrigger.next();

      this.dtElement.dtInstance.then(dtInstance =>{
        (<any>dtInstance).on('click', 'tbody tr', function(){
          let row_dom = (<any>$)(this).closest('tr');
          let row = dtInstance.row(row_dom).data();

          that.$state.go("store.orderdetail" , {id : (<any>row) ? (<any>row)._id : -1 });

        })
      });
    }
    ngOnDestroy(): void {
      // Do not forget to unsubscribe the event
      this.dtTrigger.unsubscribe();
    }

    rerender(): void {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // alert("here");

        dtInstance.clear().draw();        
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger.next();
      });
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
    showProductDetail(event , obj){
      let _id =event.target.attributes.data.nodeValue;
      console.log("State is ::" , obj.$state , "Id is" , _id)
      this.$state.go('store.productdetail'  , {id : _id});
      console.log("on show detail" , _id)
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
      // console.log("Filters object" , this.filtersJSON);

      // this.rerender();4
      this.dtTrigger.next();
    }
 
    printData()
    {
       var divToPrint=document.getElementById("printTable");
       let newWin= window.open("");
       newWin.document.write(divToPrint.outerHTML);
       newWin.print();
       newWin.close();
    }   
}
