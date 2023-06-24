import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , OnChanges} from '@angular/core';

import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormControl , FormArray , Validators} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { inventoryService } from './../../services/inventory.service';
declare var $: any;
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";
import { productService } from '@services/product.service';
import { AuthenticationService } from '@services/authentication.service';
import { StateService } from '@uirouter/angular';

@Component({
  selector : 'dumpInventory',
  templateUrl: './dumpinventory.component.html',
  styleUrls: ['./dumpinventory.component.scss']
})
export class DumpInventoryComponent implements AfterViewInit , OnInit , OnChanges{
  pageData : any;
  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<any> = new Subject();

  // InventoryForm : FormGroup ;
  // inventoryDetailsForm : FormGroup ;
  // vehicles : FormArray;
  colorsAvailable : any[];
  vehileIndicators : string = "car bike vehicle motorcycle jeep van bus ";
  inventoryData : any;
  //
  @Input() inventoryId : any;
  stockList :any ;

  constructor(private http:HttpClient , private fb:FormBuilder , private datePipe : DatePipe ,
    private _inventoryService : inventoryService , private notifier : NotifierService,
    public _permService : PermissionService , private _productService:productService ,
    private _authService: AuthenticationService  , private $state : StateService){
    this.pageData = {
      title: 'Edit Product in Inventory',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Inventory'
        },
        {
          title: 'Edit Product in Inventory'
        }
      ]
    };

  }
  ngOnChanges(changes)
  {
    console.log("Changes :::" , changes );
    if(changes && changes.inventoryId && changes.inventoryId.currentValue)
    {
      this.inventoryId = changes.inventoryId.currentValue;
      this.fetchInfo();
    }
  }
  fetchInfo(){
    let that = this;
    //fetch inventory info
    this._inventoryService.
      viewDetail(this.inventoryId).
      subscribe(resp=>{
        console.log("Inventory details fetched" , resp)
        that.inventoryData = resp;
        //setting the stock info
        that.stockList = resp.stock;
      } , err=>{
        console.log("An error occured while fetching info" , err)
      })
    //In case of vehicle fetch stock info

  }
  ngOnInit(){
    let that = this ;
    // this.InventoryForm = this.fb.group({
    //   product : ['' , [Validators.required]] ,
    //   quantity: [{value : '' , disabled: true} , [Validators.required]]
    //   , end: [{value : '' , disabled: true}]
    //   , lastSupply:[{value : '' , disabled: true}],
    //   recieved : ['' , [Validators.required, Validators.min(1)]]
    // });
    //
    //
    // //instantiating the details form which takes info of vehicles from user
    // this.inventoryDetailsForm = this.fb.group({
    //     vehicles : that.fb.array([ that.createVehicle() ])
    // })


  }
  ngAfterViewInit() : void {

  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event

  }

  rerender(): void {

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

  //A function to check if a product is selected or not
  isProductSelected(){
    return $("#optionSelect").val()
  }
  //This method will be used to show products selected by user for dumping
  dumpProductStock(){
    let idsToDump = $(".chckStock:checked").toArray().map(chck=>{
        return $(chck).attr("data-id");
    })

    //sending the ids to the server
    this._inventoryService.
      dumpStock(this.inventoryId , {ids : idsToDump}).
      subscribe(resp=>{
        console.log("Ids gonna be dumped resp" , resp)
      } ,err=>{
        console.log("Ids gona be dumped error" , err)
      } )

  }
}
