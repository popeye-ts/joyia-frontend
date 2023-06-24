import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StateService } from '@uirouter/angular';
import { PermissionService } from "@services/permissions.service";
import * as jwt_decode from "jwt-decode";
import { AuthenticationService } from '@services/authentication.service';
import { WaiverService } from '@services/waiver.service';
declare var $: any;


class DataTablesResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}
@Component({
  selector : 'waiverList',
  templateUrl: './waivers.component.html',
  styleUrls: ['./waivers.component.scss']
})
export class LstWaiversComponent implements AfterViewInit , OnInit {
  @ViewChild(DataTableDirective  , {static : false})
  dtElement : DataTableDirective;
  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<any> = new Subject();
  pageData : any;
  WaiverForm : FormGroup ;
  waiverList :any[];
  btnWaiverList : any[];
  noWaivers : boolean = false;
  rsrcTitle : String = "Waivers List";
  selectedWaiverData  : any = {};

  constructor(private http:HttpClient , private fb:FormBuilder , private datePipe : DatePipe ,
    private $state : StateService , public _permService : PermissionService , private _authService : AuthenticationService,
    private _waiverService : WaiverService ){
    this.pageData = {
      title: 'Orders',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Waivers'
        },
        {
          title: 'Waivers List'
        }
      ]
    };
    this.btnWaiverList = [];
  }
  ngOnInit(){
    let that = this ;
    this.WaiverForm = this.fb.group({
      name: ['check'],
      strengths: ['ok']
      , type: ['']
      , description:['']
    });
    let decodedToken = jwt_decode(this._authService.token);
    let user_id = decodedToken.user_id;

    that.dtOptions = {
        serverSide : true ,
        processing: true ,
        pageLength: 10 ,
        searching : true,
        lengthChange: true,
        destroy: true, 
        order : [[ 1 , "desc"]] ,
        info: false,
        dom: '<"row view-filter"<"col-sm-12"<"float-left"l><"float-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>',
        ajax : (dataTablesParameters: any, callback) =>{
				that.http.post<DataTablesResponse>(environment.apiUrl+'waivers/my/'+user_id , dataTablesParameters , {})
                      .subscribe(resp=>{
                        console.log("Response from orders data table ::" , resp);
                        //in cse we have no orders
                        if(resp.recordsTotal == 0)
                            this.noWaivers = true;
                        let data = [];
                        for(let i=0 ; i<resp.data.length ; i++)
                          {
                              let dataObj = resp.data[i];
                              //just in case the client is deleted
                              if(dataObj.client == null || Object.keys(dataObj.client).length == 0 ){
                                //creating a template for deleted clients
                                dataObj.client = {
                                    name : '<span class="deleted">Client deleted</span>',
                                    phone : 'N/A' ,
                                    cnic : Math.random() //for uniquieness
                                };
                              }
                              //Creating a new array from waivers
                              let waivers = dataObj.waivers.map(w=>{
                                let template = `<a href="javascript:void(0)" style="cursor:pointer;" data='${(w._id ? w._id : '')}'
                                    class="badge badge-light mb-1 waiver-detail">
                                    View&nbsp;
                                    <span class="badge badge-light btn_waiver_loader spinner_${w._id}" style="display:none;">
                                      <img src="assets/img/spinner.gif" class="btnWaiverLoader" style="width:10px;"/>
                                    </span>
                                    </a><br>`;
                                let statusHtml = (status)=>{
                                  let classToTag = '';
                                  switch(status){
                                    case 'accepted' : classToTag = 'badge-outline-success' ;break;
                                    case 'rejected' : classToTag = 'badge-outline-warning' ;break;
                                    default : classToTag = 'badge-light';
                                  } 
                                  return `<span class="badge badge-pill ${classToTag} mb-1">${status.toUpperCase()}</span>`;
                                }
                                return {
                                  client : dataObj.client ,
                                  //formatting the date
                                  created_at : that.datePipe.transform(w.created_at , 'dd.MM.yy hh:mm a'),
                                  approval_pending_at : ( w.approval_pending_at ? w.approval_pending_at.firstname+ " "+w.approval_pending_at.lastname : " - ") ,
                                  approval_status : statusHtml(w.approval_status) ,
                                  total_amount : dataObj.total_amount ,
                                  waiver_amount : w.calculated_value ,
                                  actions : template ,
                                  _id : w._id
                                }
                              });
                              // //Adjusting products
                              // dataObj.allProducts = '';
                              // for(let j=0 ; j< dataObj.products.length ; j++)
                              //   {
                              //     let tempProd = dataObj.products[j];
                              //     console.log("Checking tempProd ::" , tempProd)
                              //     let template = `<a style="cursor:pointer;" data ='${(tempProd.product_id ? tempProd.product_id._id ? tempProd.product_id._id : '' : '')}' class="badge badge-light mb-1 waiver-detail">
                              //         ${tempProd.product_id ? tempProd.product_id.product_display_name : ''}&nbsp;
                              //         <span class="badge badge-light">${tempProd.quantity}</span>
                              //         </a><br>`;
                              //     dataObj.allProducts+=template;
                              //   }
                              data = data.concat(waivers);
                            }
                            //Registering waivers button preloaders
                            data.map(w=>{
                              that.btnWaiverList[w._id] = true
                            });

              					    this.waiverList = data;
                            console.log("Data passed to callback " , data );
                            callback({
                              recordsFiltered:resp.recordsFiltered,
                              recordsTotal : resp.recordsTotal,
                              data : data
                            });
  					$('#overlay').hide();
  				});
			   } ,
        columns : [
          {data:'client.name'} ,  { data : 'created_at'} , { data : 'approval_pending_at'},
          {data : 'approval_status' }, {data : 'total_amount' } , {data : 'waiver_amount'} ,
          { data : 'actions'},
          {data:'client.cnic'}
        ] ,
        columnDefs : [
          {
            targets : [-1],
            visible : false
          }
        ],
        language: {
          paginate: {
            first : "<<",
            last: ">>" ,
            previous: "<i class='simple-icon-arrow-left'></i>",
            next: "<i class='simple-icon-arrow-right'></i>"
          }
        },
        // rowGroup: {
        //     dataSrc: [
        //         'client.name'
        //     ]
        // },
        // dom: 'Bfrtip',
        // buttons: [
        //      'copy', 'csv', 'excel', 'pdf', 'print'
        // ],
        drawCallback: function () {
          (<any>$)(".waiver-detail").click(function(event) {
            let _id = event.target.attributes.data.nodeValue;
            that.fetchWaiverDetails(_id);
            // that.$state.go('store.productdetail' , {id : _id})
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
          $("#pageCountDatatable span").html("Displaying " +(api.page.info().start + 1) + "-" + api.page.info().end + " of " + api.page.info().recordsTotal + " items");

          $("#searchDatatable").on("change", function (event) {
            api.search($("#searchDatatable").val().toString()).draw();
          });
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

        // that.$state.go("store.orderdetail" , {id : (<any>row)._id});

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
    async fetchWaiverDetails(_id){
      console.log("Fetching waiver details");
      try{
        $(".spinner_"+_id).css('display' , 'unset');
        let detailsFetched  = await (this._waiverService.viewWaiverDetail(_id) ).toPromise();
        this.selectedWaiverData = detailsFetched.data;
        $("#waiversDetailModal").modal('show')
        console.log("Details Fetched " , detailsFetched , $("#waiversDetailModal").length );
      }catch(err){
        console.log("Waiver details error occured " , err );
      }finally{
        $(".spinner_"+_id).css('display' , 'none');
      }
    }
}
