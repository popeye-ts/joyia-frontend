import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormControl , FormArray , Validators} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Select2OptionData } from 'ng2-select2';
import { inventoryService } from './../../services/inventory.service';
declare var $: any;
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";
import { productService } from '@services/product.service';
import { AuthenticationService } from '@services/authentication.service';
import { saveAs } from 'file-saver';

class DataTablesResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}
@Component({
  selector : 'inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements AfterViewInit , OnInit{
  @ViewChild(DataTableDirective  , {static : false})
  dtElement : DataTableDirective;
  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<any> = new Subject();
  noInventoryData : boolean = false;
  pageData : any;

  InventoryForm : FormGroup ;
  inventoryDetailsForm : FormGroup ;
  vehicles : FormArray;
  colorsAvailable : any[];
  vehileIndicators : string = "car bike vehicle motorcycle jeep van bus ";

  //For edit modal
  selectedInventoryProduct : any;
  public addProductAjax : Select2AjaxOptions;
  selectedInventoryItem: any;
  stockInfoBeingFetched: boolean = false;

  constructor(private http:HttpClient , private fb:FormBuilder , private datePipe : DatePipe ,
    private _inventoryService : inventoryService , private notifier : NotifierService,
    public _permService : PermissionService , private _productService:productService , private _authService: AuthenticationService){
    this.pageData = {
      title: 'All Products in Inventory',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Dashboard'
        },
        {
          title: 'Product List'
        }
      ]
    };

  }
  ngOnInit(){
    let that = this ;
    this.InventoryForm = this.fb.group({
      product : ['' , [Validators.required]] ,
      quantity: [{value : '' , disabled: true} , [Validators.required]]
      , end: [{value : '' , disabled: true}]
      , lastSupply:[{value : '' , disabled: true}],
      recieved : ['' , [Validators.required, Validators.min(1)]]
    });


    //instantiating the details form which takes info of vehicles from user
    this.inventoryDetailsForm = this.fb.group({
        vehicles : that.fb.array([ that.createVehicle() ])
    })

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
				that.http.post<DataTablesResponse>(environment.apiUrl+'inventory/datatable' , dataTablesParameters , {})
                      .subscribe(resp=>{
                        console.log("Response in datatables" , resp)
                        if(resp.data.length == 0 )
                          this.noInventoryData = true;

                        for(let index= 0 ; index < resp.data.length ;index ++)
                          {
                            resp.data[index].last_supply_date = this.datePipe.transform(resp.data[index].last_supply_date , 'dd.MM.yy hh:mm a');
                            resp.data[index].end_date = this.datePipe.transform(resp.data[index].end_date , 'dd.MM.yy hh:mm a');

                            //for categories
                            let categories = resp.data[index].product.categories;
                            let htm = '  <span class="container-tooltip">';
                            for(let i=0 ; i < categories.length  ; i++)
                            {
                                htm += '<span tooltip="'+categories[i].name+'" placement="top" delay="500" ><i  class="'+categories[i].icon+'"> </i></span>';
                            }
                            resp.data[index].categories = htm+'</span>';
                          }
                        console.log(resp);
                        callback({
                          recordsFiltered:resp.recordsFiltered,
                          recordsTotal : resp.recordsTotal ,
                          data :  resp.data
                        });
  					$('#overlay').hide();
  				});
			   } ,
        columns : [
            {data:'product.product_display_name'} , {data : 'quantity_available'} ,
            {data: 'end_date'} , {data : 'last_supply_date'} ,
            {data:'categories'} ,
            {
              title : 'Actions' ,
              render: function (data: any, type: any, obj: any) {
                let template = `<a href="javascript:void(0)" style="cursor:pointer;" data='${(obj._id ? obj._id : '')}'
                                    class="badge badge-light mb-1 inventory-detail">
                                    View&nbsp;
                                    <span class="badge badge-light btn_inventory_loader spinner_${obj._id}" style="display:none;">
                                      <img src="assets/img/spinner.gif" class="btninventoryLoader" style="width:10px;"/>
                                    </span>
                                    </a><br>`;
                
                return template;
              }
            }
          ] ,
        language: {
          paginate: {
            first : "<<",
            last: ">>" ,
            previous: "<i class='simple-icon-arrow-left'></i>",
            next: "<i class='simple-icon-arrow-right'></i>"
          }
        },
        createdRow: function( row, data, dataIndex ) {
            // Set the data-status attribute, and add a class
            $( row ).attr('data', (<any> data)._id  );
        },
        drawCallback: function () {
            console.log("Callback called :: " , $('#datatableRows tbody') );
            (<any>$)(".inventory-detail").click(function(event) {
              let _id = event.target.attributes.data.nodeValue;
              that.fetchInventoryDetails(_id);
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
            // console.log("Start of" ,api.page.info().start);
            // console.log("Api " ,api);
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

            $('#datatableRows tbody').on('click', 'tr', function () {
              console.log("Check box changed");
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

        }
      };



    let access_token ;
    //Taking care of authorization
    access_token = this._authService.token;

    let session = sessionStorage.getItem('session') || '';

    //Add product quantity options
    this.addProductAjax = {
      url : environment.apiUrl+'product/getNonBarcodedlist' ,
      headers : { "Authorization" : "Bearer "+access_token , session },
      dataType : 'json' ,
      delay : 250 ,
      cache : false ,
      data : (params : any) => {
        console.log("Ajax Select 2" , params);
        return {
          search : params.term
        }
      },
      processResults : (data : any) => {
        console.log("Ajax Select 2 results " , data);
        return {
          results : $.map(data , function(obj){
              return {id:obj._id , text: obj.product_display_name}
          })
        }
      }
    };
    // $(".select2-search__field").unbind('focus focusin');

  }
  async fetchInventoryDetails(_id: any) {
    console.log("Inventory id " , _id );

    try{
      $(".spinner_"+_id).css('display' , 'unset');
      let detailsFetched  = await (this._inventoryService.viewDetail(_id) ).toPromise();
      this.selectedInventoryItem = detailsFetched;
      $("#inventoryDetailModal").modal('show')
      console.log("Details Fetched inventory" , detailsFetched , $("#inventoryDetailModal").length );
    }catch(err){
      console.log("Inventory details error occured " , err );
    }finally{
      $(".spinner_"+_id).css('display' , 'none');
    }
  }
  ngAfterViewInit() : void {
    this.dtTrigger.next();
    //Stoping the zone from not allowing to interact with select 2
    $(".select2-container").on("click" , function () {
      $(".select2-search__field").on('focusin' , function(e){ e.stopPropagation();})
    })
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    if(this.dtElement)
    {
      if(this.dtElement.dtInstance)
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          // Destroy the table first
          dtInstance.destroy();
          // Call the dtTrigger to rerender again
          this.dtTrigger.next();
        });
      else
          this.dtTrigger.next();
    }
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
  selectProductChanged($evt){
      this.InventoryForm.controls.product.setValue($evt.value);
      this._inventoryService.viewDetail($evt.value).subscribe(response => {
        console.log("response" , response);
        response = response[0];

        this.InventoryForm.controls.quantity.setValue(response  ? response.quantity_available : 0);
        this.InventoryForm.controls.lastSupply.setValue(response ? response.last_supply_date : '');
        this.InventoryForm.controls.end.setValue(response ? response.end_date : "");
      }, error => {
        console.log("Error" , error);
      });
  }
    addInventory(){
      let that = this;
      console.log("Main form" , this.InventoryForm.invalid , ":___:" , this.InventoryForm.value  ," Inner form " , this.inventoryDetailsForm.invalid ,":___:" , this.inventoryDetailsForm.value );

      if(this.InventoryForm.invalid)
      {
        Object.keys( this.InventoryForm.controls).forEach(key => {
          this.InventoryForm.controls[key].markAsDirty();
         });
        return ;
      }


      //fetch information about the categories of the product
      this._productService.getCategories(this.InventoryForm.value.product)
        .subscribe(
          response=>{
              let categories = response.categories;
              let isVehicle = false;

              //checking categories
              categories.some(category => {
                if(that.vehileIndicators.indexOf(category.name.toLowerCase()) > -1 ){
                  isVehicle = true;
                  return true;
                }
              });
              //getting the colors Available for the produtc
              that.colorsAvailable = response.other_info.colors_available

              //if its a vehicle show the form
              if(isVehicle)
              {
                let quantity = that.InventoryForm.get('recieved').value;

                that.addVehicles(quantity )
                $('#LeftModalDetails').modal()

              }
              //else let it be inserted normally
              else{
                that.simpleInsertInventory();
              }
          } , error=>{
            console.log("We have categories error in add inventory" , error)

          })
      return ;
    }
  //This method will submit form which have complex information like engine_no , chassis etc
  addVehicleInventory(){
    let that= this;


    let dataToSend = this.InventoryForm.value;
    dataToSend.stock = this.inventoryDetailsForm.value.vehicles
    console.log("The add vehicle form ", dataToSend )
    this._inventoryService.add(dataToSend).subscribe(
      resp=>{
        $("#closebtn").click();
        $("#close2").click();

        this.notifier.notify("success" , "Inventory Added")

        //just incase there is no inventory and the user has added a product to inventory then this no data div must hide
        this.noInventoryData = false
        that.rerender();
      } , err=>{
        this.notifier.notify("error" , err.error)
        console.log("The complex inventory add error " , err);

      })
  }
  //this method will submit form of non vehicles where we dont need much information
  simpleInsertInventory(){
      let that = this;
      this._inventoryService.add(this.InventoryForm.value).subscribe(response => {
        $("#closebtn").click();

        this.notifier.notify("success", "Inventory Added" );

        //just incase there is no inventory and the user has added a product to inventory then this no data div must hide
        this.noInventoryData = false
        that.rerender();
      } , error =>{
        this.notifier.notify("error", "Failed to add inventory!" );
      } );
  }
  //A template for vehicle information getting
  createVehicle(): FormGroup {
    return this.fb.group({
      reg_no : ['' ],
      engine_no : ['' , Validators.required],
      chasis_no : ['' , Validators.required],
      key_no : [''],
      color : ['' , Validators.required ]
    });
  }
  //A method which will push a template vehicle to the form
  addVehicles(count ): void {
    //clear the form array first to remove previous
    const vehTemp = <FormArray>this.inventoryDetailsForm.controls.vehicles;
    vehTemp.controls = [];


    this.vehicles = this.inventoryDetailsForm.get('vehicles') as FormArray;
    for (let index = 0; index < count ; index++) {
      this.vehicles.push(this.createVehicle() );
    }

    //setting the color default value
    let allFGs =(<any> this.inventoryDetailsForm.controls.vehicles).controls;
    allFGs.map(formGroup =>{
      formGroup.controls.color.patchValue(this.colorsAvailable[0])
    })
    // this.inventoryDetailsForm.controls.vehicles.color.setValue([count].map(i=> this.colorsAvailable[0]))
  }

  //A function to check if a product is selected or not
  isProductSelected(){
    return $("#optionSelect").val()
  }
  //This method will be used to show products selected by user in modal for dumping
  dumpStock(){

    //Getting Selected Ones
    this.dtElement.dtInstance.then((dtInstance : DataTables.Api) =>{
      let selectedRows = dtInstance.rows('.selected').data();
      console.log("Rows selected :::" , selectedRows );
      //Setting the id of the selected inventory product
      this.selectedInventoryProduct = selectedRows[0]._id;
      $('#dumpModal').modal('show');


    })
  }
  //This method will be used to show products selected by user in modal for dumping
  deleteStock(){

    //Getting Selected Ones
    this.dtElement.dtInstance.then((dtInstance : DataTables.Api) =>{
      let selectedRows = dtInstance.rows('.selected').data();
      console.log("Rows selected :::" , selectedRows, "{}{}{}" , dtInstance.rows('.selected') , "#############" , dtInstance.rows().data() );
      //Setting the id of the selected inventory product
      this.selectedInventoryProduct = selectedRows[0]._id;
      $('#dumpModal').modal('show');


    })
  }
  singleSelected(){
    return ($(".selected").length == 1 )
  }
  async printStock(){
    try{
      if(this.stockInfoBeingFetched){
        return ;
      }
      this.stockInfoBeingFetched = true;
      //Fetch the info from db now against this
      let stockInfo = await this._inventoryService.getStockInfo().toPromise();
      if(!stockInfo ){
        throw "Something went wrong while fetching stock info.";
      }
      console.log("Whats in stock" , stockInfo , " Error " , stockInfo.error )
      if(stockInfo.error ){
        throw stockInfo.error;
      }
      let stockArr = stockInfo.data;
      this.downloadFile(stockArr);
      console.log("Stock info i have " , stockInfo );
    }catch(error){
      console.log("An error occured " ,error )
    }finally{
      this.stockInfoBeingFetched = false;
    }
  }

downloadFile(stockArr : any = []) {
  let _self = this;
  const getNestedObject = (nestedObj, pathArr) => {
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
  }
  const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
  let count= 0;

  const header = ["Sr", "Product Title" , "Category Name" , "Quantity Available" , "Ended On" , "Unit Price" , "Price"];

  let csv = stockArr.map(stock=>{
    let objToReturn = [ `${++count}`];
    
    //taking care of title
    let title = getNestedObject(stock , ["product" , "product_display_name"]);
    
    objToReturn.push(title);

    // Taking care of category
    let category = getNestedObject(stock , ["product"  , "categories" , "0" , "name"]);
    objToReturn.push(category);

    //Taking care of quantity available
    let quantity_available = ~~(getNestedObject(stock , ["quantity_available"]));
    objToReturn.push(quantity_available+'');

    // Taking care of ended on
    let ended_on = quantity_available ? 'N/A' : getNestedObject(stock, ["end_date"]);
    objToReturn.push(ended_on);

    // Taking care of price
    let unitPrice = ~~getNestedObject(stock , ["product" , "price" , "sale_price"]);

    objToReturn.push(unitPrice+'');
    objToReturn.push((unitPrice*quantity_available)+'');

    return objToReturn.join(" , ")
  });

  // //Add the footer with Summary
  // csv.push(['' ,'', '' , '' , '','','','','' ].join(" , "));
  // csv.push(['' ,'', '' , '' , '','','','TOTAL DEBIT',''+_self.sumDebit ].join(" , "));
  // csv.push(['' ,'', '' , '' , '','','','TOTAL CREDIT',''+_self.sumCredit ].join(" , "));
  // csv.push(['' ,'', '' , '' , '','','','CASH IN HAND',''+(_self.sumDebit - _self.sumCredit) ].join(" , "));
  
  csv.unshift(header.join(','))
  let csvArray = csv.join('\r\n');
  var blob = new Blob([csvArray], {type: 'text/csv' })
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!

  saveAs(blob, dd+'_'+mm+"_stock_report.csv");
}
// $("#exampleModalContent").on("show.bs.modal", function (event) {
//   var button = $(event.relatedTarget);
//   var recipient = button.data("whatever");
//   var modal = $(this);
//   modal.find(".modal-title").text("New message to " + recipient);
//   modal.find(".modal-body input").val(recipient);
// });
 
}