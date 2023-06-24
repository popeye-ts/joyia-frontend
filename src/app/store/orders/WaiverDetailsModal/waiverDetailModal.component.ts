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
import { WaiverService } from '@services/waiver.service';
import { NotifierService } from "angular-notifier";

class TableResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}
@Component({
  selector : 'waiverDetailModal',
  templateUrl: './waiverDetailModal.component.html',
  styleUrls: ['./waiverDetailModal.component.scss']
})
export class WaiverDetailModalComponent implements AfterViewInit , OnInit , OnChanges{
  @Input() orderData : any;
  pageData : any;
  waiverList :any[];
  noWaivers : boolean = false;
  rsrcTitle : String = "Waiver Details List";
  beingEditFormSubmit : boolean = false;
  total_amount : any = 0 ;
  placements = ['top', 'left', 'right', 'bottom'];
  popoverTitle = 'Update waiver';
  popoverMessage = 'Click <b>accept</b> to accept and <b>reject</b> to reject waiver?';
  confirmText = 'Accept <i class="glyph-icon simple-icon-check"></i>';
  cancelText = 'Reject <i class="glyph-icon simple-icon-close"></i>';
  confirmClicked = false;
  cancelClicked = false;
  // trackByValue: TrackByFunction<string> = (index, value) => value;
  selectedWaiverId : any = '';  //Which ever waiver user is gonna update
  //An object to track changes
  formChanges : any [] = [];
  constructor(private http:HttpClient , private datePipe : DatePipe ,
    private $state : StateService , public _permService : PermissionService ,
    private _authService : AuthenticationService,
    private _waiverService : WaiverService , private notifier : NotifierService){
    this.pageData = {
      title: 'Orders',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Waivers'
        },
        {
          title: 'Waivers List'
        },
        {
          title: 'Waiver Details'
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
  getSelectedRows() {
          //Getting Selected Ones
      //    console.log(this.$dataTableRows.rows('.selected').data());
  }
  printData()
  {
     var divToPrint=document.getElementById("printTables");
     let newWin= window.open("");
     newWin.document.write(divToPrint.outerHTML);
     newWin.print();
     newWin.close();
  }
  // async fetchWaiverDetails(_id){
  //   console.log("Fetching waiver details");
  //   try{
  //     $(".spinner_"+_id).css('display' , 'unset');
  //     let detailsFetched  = await (this._waiverService.viewWaiverDetail(_id) ).toPromise();
  //     console.log("Details Fetched " , detailsFetched );
  //   }catch(err){
  //     console.log("Waiver details error occured " , err );
  //   }finally{
  //     $(".spinner_"+_id).css('display' , 'none');
  //   }
  // }
  ngOnChanges(changes: SimpleChanges) {
    let that = this;
    if(changes && changes.orderData && changes.orderData.currentValue && changes.orderData.currentValue.order){
      this.orderData = changes.orderData.currentValue;

      that.calculateTotal()
      //Adjustment of waivers
    }
    console.log("Changes passed" , changes );
  }
  calculateTotal(){
    let that = this;
    //Calculating a total
    that.total_amount = that.orderData.order.total_paid;

    console.log("Changes :::::\r\n" , that.orderData );

    this.orderData.order.waivers.map(w=>{
      if(w.approval_status != 'rejected' )
        that.total_amount -= w.calculated_value || 0;
    })

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
        let dataUpdated = await this._waiverService.updateWaiverStatus( this.formChanges ).toPromise();
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
  updateWaiver(status : string ){
    let that = this;
    this.orderData.order.waivers =

    this.orderData.order.waivers.map(w=>{
      if(w._id == that.selectedWaiverId ){
        w.approval_status = status;
      }
      return w;
    })
    //Track Changes
    that.formChanges.push({id : that.selectedWaiverId , status  : status });

    that.calculateTotal()
    console.log("status changed to " , status , " Id " , that.selectedWaiverId )
  }

  selectWaiver(id : any){
    this.selectedWaiverId = id;
    console.log("Waiver selected ::" , id );
  }
  extractInstallments(finances){
    if(finances ){
      return finances.filter(f=>!f.waiver_id)
    }
    return [];
  }
  extractWaivers(finances){
    if(finances ){
      return finances.filter(f=>f.waiver_id)
    }
    return [];
  }
}
