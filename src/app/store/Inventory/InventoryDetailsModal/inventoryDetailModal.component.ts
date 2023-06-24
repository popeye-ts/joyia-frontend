import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , OnChanges , SimpleChanges} from '@angular/core';
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
import { inventoryService } from '@services/inventory.service';
import { NotifierService } from "angular-notifier";
declare var $: any;

class TableResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}
@Component({
  selector : 'inventoryDetailModal',
  templateUrl: './inventoryDetailModal.component.html',
  styleUrls: ['./inventoryDetailModal.component.scss']
})
export class inventoryDetailModalComponent implements AfterViewInit , OnInit , OnChanges{
  @Input() details : any;
  noStock : string = 'UNKNOWN' ;
  pageData : any;
  rsrcTitle : String = "Inventory Details List";

  //An object to track changes
  formChanges : any [] = [];
  beingEditFormSubmit: any;

  constructor(private http:HttpClient , private datePipe : DatePipe ,
    private $state : StateService , public _permService : PermissionService ,
    private _authService : AuthenticationService,
    private _inventoryService : inventoryService , private notifier : NotifierService){
    this.pageData = {
      title: 'Orders',
      loaded: true,
      breadcrumbs: [
        {
          title: 'inventorys'
        },
        {
          title: 'inventorys List'
        },
        {
          title: 'inventory Details'
        }
      ]
    };
  }
  ngOnInit(){
    let that = this ;
    let decodedToken = jwt_decode(this._authService.token);
    let user_id = decodedToken.user_id;

    //data table options
  }
  ngAfterViewInit() : void {
    let that = this ;
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
  }

  rerender(): void {

  }
 
 
  ngOnChanges(changes: SimpleChanges) {
    let that = this;
    if(changes && changes.details ){
      //Adjustment of inventory
      console.log("Inventory details recieve in child component " , changes.details.currentValue );
      this.details =  changes.details.currentValue;
      if(changes.details.currentValue){
        let count = ~~(changes.details.currentValue.quantity_available);
        this.noStock =( count == 0 ? 'NO-STOCK' : 'STOCK AVAILABLE'); 
      }
    }
  }

  async saveChanges(){
    //Make sure the form is not already submitted
    if(this.beingEditFormSubmit)
      return ;
    if(Object.keys(this.formChanges).length == 0){
      this.notifier.notify("warning" , "Nothing to change.");
      return ;
    }

    try{
        this.beingEditFormSubmit = true;
        let dataUpdated = await this._inventoryService.updateInventoryStatus(this.details._id ,  this.formChanges ).toPromise();
        console.log("Data has been updated " , dataUpdated );
        this.formChanges = [];
        this.notifier.notify("success", dataUpdated.message );
    } catch(err){
      console.log("Error occured in save changes " , err );
      this.notifier.notify("success", err.error);
    } finally{
      this.beingEditFormSubmit = false;
    }
    console.log("Changes to be saved " , this.formChanges );

  }
  updateinventory(status : string ){
    let that = this;
    //Track Changes
   
  }
  showProductDetail(product_id : string ){
    // Close the modal and backdrop
    $("#inventoryDetailModal").modal('hide')
    this.$state.go('store.productdetail' , {id : product_id})
  }
}