import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy, ElementRef} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { fromEvent, Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StateService } from '@uirouter/angular';
import { PermissionService } from "@services/permissions.service";
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

class DataTablesResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}
@Component({
  selector : 'pendingPayment',
  templateUrl: './pendingPayment.component.html',
  styleUrls: ['./pendingPayment.component.scss']
})
export class PendingPaymentComponent implements AfterViewInit , OnInit{
  @ViewChild(DataTableDirective  , {static : false})
  @ViewChild('paymentsSearch', { static: true }) paymentsSearchInput: ElementRef;

  dtElement : DataTableDirective;
  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<any> = new Subject();
  pageData : any;
  OrderForm : FormGroup ;
  orderList :any[];
  noOrders : boolean = false;
  rsrcTitle : String = "Pending Payments";
  //preloader
  static beingSearched : boolean = true;
  dtApi : any ;

  constructor(private http:HttpClient , private fb:FormBuilder , private datePipe : DatePipe ,
    private $state : StateService , public _permService : PermissionService){
    this.pageData = {
      title: 'All Orders',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Orders'
        },
        {
          title: 'Pending Payments List'
        }
      ]
    };

  }
  ngOnInit(){
    let that = this ;
    this.OrderForm = this.fb.group({
      name: ['check'],
      strengths: ['ok']
      , type: ['']
      , description:['']
    });

    that.dtOptions = {
        serverSide : true ,
        processing: true ,
        pageLength: 10 ,
        searching : true,
        lengthChange: true,
        destroy: true,
        info: false,
        dom: '<"row view-filter"<"col-sm-12"<"float-left"l><"float-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>',
        ajax : (dataTablesParameters: any, callback) =>{
				that.http.post<DataTablesResponse>(environment.apiUrl+'order/pendingPayments' , dataTablesParameters , {})
                      .subscribe(resp=>{
                        console.log("Response from orders data table ::" , resp);
                        //in cse we have no orders
                        if(resp.recordsTotal == 0)
                            this.noOrders = true;
                        for(let i=0 ; i<resp.data.length ; i++)
                          {

                            //just in case the client is deleted
                            if(resp.data[i].client == null){
                              //creating a template for deleted clients
                              resp.data[i].client = {
                                personal_info :{
                                  name : '<span class="deleted">Client deleted</span>',
                                  phone : 'N/A'
                                },
                              };
                            }
                            //formatting the date
                            resp.data[i].last_payment_time = this.datePipe.transform(resp.data[i].last_payment_time , 'dd.MM.yy hh:mm a') ;
                            resp.data[i].next_payment_date = this.datePipe.transform(resp.data[i].next_payment_date , 'fullDate') ;

                            //Adjusting products
                            resp.data[i].allProducts = '';
                            for(let j=0 ; j< resp.data[i].products.length ; j++)
                              {
                                let tempProd = resp.data[i].products[j];
                                console.log("Checking tempProd ::" , tempProd)
                                let template = `<a style="cursor:pointer;" data ='${(tempProd.product_id ? tempProd.product_id._id ? tempProd.product_id._id : '' : '')}' class="badge badge-light mb-1 product_detail">
                                    ${tempProd.product_id ? tempProd.product_id.product_display_name : ''}&nbsp;
                                    <span class="badge badge-light">${tempProd.quantity}</span>
                                    </a><br>`;
                                resp.data[i].allProducts+=template;
                              }
                            }

                        console.log(resp.data);
              					this.orderList = resp.data[0];

                        callback({
                          recordsFiltered:resp.recordsFiltered,
                          recordsTotal : resp.recordsTotal,
                          data : resp.data

                        });
  					$('#overlay').hide();
  				});
			   } ,
         columns : [ {data:'client.personal_info.name'} , {data : 'client.personal_info.phone'} ,
          {data : 'allProducts'} , {data : 'total_amount'}, {data : 'total_paid'}, {data : 'next_payment_date' } , {data : 'last_payment_time'}] ,
        language: {
          paginate: {
            first : "<<",
            last: ">>" ,
            previous: "<i class='simple-icon-arrow-left'></i>",
            next: "<i class='simple-icon-arrow-right'></i>"
          }
        },
        // dom: 'Bfrtip',
        // buttons: [
        //      'copy', 'csv', 'excel', 'pdf', 'print'
        // ],
        drawCallback: function () {

          (<any>$)(".product_detail").click(function(event) {
            let _id = event.target.attributes.data.nodeValue;
            that.$state.go('store.productdetail' , {id : _id})
          })
          that.unCheckAllRows();
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
          that.dtApi = api;
          $("#pageCountDatatable span").html("Displaying " +(api.page.info().start + 1) + "-" + api.page.info().end + " of " + api.page.info().recordsTotal + " items");

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
            PendingPaymentComponent.beingSearched = true;
            api.search(text).draw();
          });
          PendingPaymentComponent.beingSearched = false;

          // $("#searchDatatable").on("change", function (event) {
          //   api.search($("#searchDatatable").val().toString()).draw();
          // });
          //
          $("#pageCountDatatable .dropdown-menu a").on("click", function (event) {
            $(".dropdown-item").removeClass("active");
            $(this).addClass("active");
            $("#records").text($(this).text() );
              api.page.len(parseInt($(this).text())).draw();
          });
        }
      };


    //data table options
  }
  ngAfterViewInit() : void {

    let that = this ;
    this.dtTrigger.next();
    this.dtElement.dtInstance.then(dtInstance =>{
      (<any>dtInstance).on('click', 'tr', function(){
        let row_dom = (<any>$)(this).closest('tr');
        let row = dtInstance.row(row_dom).data();

        that.$state.go("store.orderdetail" , {id : (<any>row)._id});

      })
    });
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
    printData()
    {
       var divToPrint=document.getElementById("printTables");
       let newWin= window.open("");
       newWin.document.write(divToPrint.outerHTML);
       newWin.print();
       newWin.close();
    }
    get beingSearched(){
      return PendingPaymentComponent.beingSearched;
    }

}
