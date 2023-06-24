import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , Output , EventEmitter} from '@angular/core';
declare var $: any;

import { Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormArray  , FormControl , Validators  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { financeService } from './../../../services/finance.service';
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";
import { orderService } from '@services/order.service';
import { UserService } from '@services/user.service';
import { WaiverService } from '@services/waiver.service';

declare var contextMenu: any;

class DataTablesResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}

@Component({
  'selector':'orderWaivers',
  'templateUrl':'./waivers.component.html',
  'styleUrls':['./waivers.component.scss']
})

export class WaiversComponent implements AfterViewInit, OnInit  {
  @ViewChild(DataTableDirective  , {static : false})
  dtElement : DataTableDirective;
  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<any> = new Subject();
  pageData : any;
  WaiverForm : FormGroup ;
  EditWaiverForm : FormGroup ;
  EditWaiverId : any ;

  waiverList : any[] ;
  approvalAuthorties : any [] ;
  @Input() order_id : any;
  @Input('order') order_data : any;
  @Input('showForm') showForm : boolean ;
  @Output('dataUpdated') newData : EventEmitter<any> = new EventEmitter();
  rsrcTitle : String = "Waivers";

  beingAdded : boolean = false;
  beingEditWaiver : boolean = false;
  beingDeletedWaiver : boolean = false;
  beingEditFormSubmit : boolean = false;
  printInProgress : boolean = false ;

  //for print component
  installmentId : any;
  //To track updates in a form
  updatedValues : any;

  constructor (private http:HttpClient , private fb:FormBuilder ,
    private datePipe : DatePipe , private _financeService : financeService,
    private notifier : NotifierService , public _permService : PermissionService ,
    private _orderService : orderService , private _userService : UserService ,
    private _waiverService : WaiverService ){
  }
  ngOnInit(){
    let that = this ;
    this.WaiverForm=
      new FormGroup({
        waiver_value:new FormControl( '1' , [Validators.required ,  Validators.min(1) ] ),
        waiver_type:new FormControl( 'Fixed' , [Validators.required ] ),
        approval_authority:new FormControl( '' , [Validators.required ] ),
        reason : new FormControl( '' , [Validators.required , Validators.minLength(3)])
      });


    //Edit waiver form
    this.EditWaiverForm=
      new FormGroup({
        waiver_value :new FormControl( '1' , [Validators.required ,  Validators.min(1) ] ),
        waiver_type :  new FormControl( 'Fixed' , [Validators.required ] ),
        approval_authority:new FormControl( '' , [Validators.required ] ),
        reason : new FormControl( '' , [Validators.required , Validators.minLength(3)])
      });

    //dataTable
    this.dtOptions = { };

    //Fetching approval authorities
    if(this.order_id){
      this.fetchApprovalAuthorities();
    }
  }
  fetchApprovalAuthorities(){
    let that = this;
    this._waiverService
      .getAllApprovalAuthorities()
      .subscribe(response => {
        console.log("Approval authorities" , response )
        that.approvalAuthorties = response.data;
      } , err => {
        console.log("Approval authorities error" , err )
      });
  }
  formSubmitted()
  {
    let formData = this.WaiverForm.value;
    formData.order = this.order_id;
    console.log("Form of waivers which is gonna submit is" , formData)
    let that = this;
    this.beingAdded = true ;

    this._waiverService.create(formData)
      .subscribe(response => {
        that.fetchInfo(false)
        // that.rerender();
        that.beingAdded = false;
        this.WaiverForm.reset();
        //informing parent that data has changed
        this.newData.emit();
        that.notifier.notify("success" , "Waiver successfuly added.");
    } , error=>{
      that.beingAdded = false;
      that.notifier.notify("error" , error.error.error ? error.error.error : error.error.message);
    })
  }
  ngAfterViewInit() : void {

    let that = this;

    this.fetchInfo(true)

     //data table
     //dataTable
    this.dtOptions =
       {
               lengthChange: false,
               searching: false,
               destroy: true,
               info: false,
               dom: '',
               pageLength: 6,
               language: {
                 paginate: {
                   first : "<<" ,
                   previous: "<i class='simple-icon-arrow-left'></i>",
                   next: "<i class='simple-icon-arrow-right'></i>" ,
                   last : ">>"
                 }
               },
               drawCallback: function () {
                 $($(".dataTables_wrapper .pagination li:first-of-type"))
                   .find("a")
                   .addClass("prev");
                 $($(".dataTables_wrapper .pagination li:last-of-type"))
                   .find("a")
                   .addClass("next");

                 $(".dataTables_wrapper .pagination").addClass("pagination-sm");


               }
             };

      //Initializing the context menu
      /*03.35. Context Menu */
      setTimeout(() => {
        console.log("Context menu" , $().contextMenu);
        if ($().contextMenu) {
          $.contextMenu({
            selector: ".instmnt",
            callback: function (key, options) {
              var m = "clicked: " + key;
            },
            events: {
              show: function (options) {
                var $list = options.$trigger.parents(".list");
                if ($list && $list.length > 0) {
                  $list.data("shiftSelectable").rightClick(options.$trigger);
                }
              }
            },
            items: {
              copy: {
                name: "Copy",
                className: "simple-icon-docs"
              },
              archive: { name: "Move to archive", className: "simple-icon-drawer" },
              delete: { name: "Delete", className: "simple-icon-trash" }
            }
          });
        };
      }, 6000);



  }
  fetchInfo(isFirstTime): void{
    let that = this
    //dataTable
    this._waiverService.getOrderWaivers( this.order_id)
      .subscribe(result=>{
        console.log("Response from the installments module" , result)
        that.waiverList =  result;
        if(isFirstTime)
          that.dtTrigger.next();
        else
            that.rerender();
          //setting up the edit functionality
        setTimeout(() => {
            $("#instlmntTbl tr:has(td)").hover(function(e) {
              $(this).css("cursor", "pointer");
              $("#instlmntTbl tr:has(td)").addClass('blur');
              $(this).removeClass('blur');
              $(this).addClass('highlight');
            },
            function(e) {
              $("#instlmntTbl tr:has(td)").removeClass('blur highlight');
            });
        }, 400);
    } , error=>{
      console.log("error from the installment module" , error)
    })
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    if( this.dtElement && this.dtElement.dtInstance)
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }


    monthFromNow(){
      let d= new Date();
      d.setMonth(d.getMonth()+1);
      return this.datePipe.transform(d , 'dd/MM/yyyy');
    }
    //Method to edit installment
    editInstlmnt(event , installment){
      //check if the event is laready triggered
      if(this.beingEditWaiver)
        return ;

      //getting the target id from parent button data attribute
      //The event will be called even if children of button are
      //clicked so handle it
      let id =
            $(event.target).hasClass('btn') ?
                $(event.target).attr('data') :
                  $(event.target).closest('button').attr('data');

      //Preloader spinning
      this.beingEditWaiver = true;

      //setting the time of installment to the
      //Set the edit installment form
      this.EditWaiverForm.patchValue(installment);

      //setting the installment id
      this.EditWaiverId = id;

      $('#nextEditInstallmentDate').datepicker('setDate', new Date(installment.next_installment_date));

      //installment edit modal open
      $('#installmentEditModal').modal('show');

      //Preloader spinning
      this.beingEditWaiver = false;
    }

    //Method to delete installment
    deleteWaiver(event){
      let that = this;
      //chekc if the event is already triggered
      if(this.beingDeletedWaiver)
        return ;

      //getting the target id from parent button data attribute
      //The event will be called even if children of button are
      //clicked so handle it

      let id =
            $(event.target).hasClass('btn') ?
                $(event.target).attr('data') :
                  $(event.target).closest('button').attr('data');


      //setting up the preloaders/spinners
      this.beingDeletedWaiver = true;

      // this._financeService
      //   .deleteWaiver(id , {order_id :this.order_id})
      //     .subscribe(resp=>{
      //       //fetch the latest data
      //       that.fetchInfo(false)
      //
      //       //informing parent that data has changed
      //       that.newData.emit();
      //
      //       this.notifier.notify("success" , "Installment successfuly deleted.");
      //
      //
      //       //unsetting the preloaders
      //       this.beingDeletedWaiver = false;
      //
      //     } , err=>{
      //       console.log("Error occured while deleting installment" , err)
      //       this.notifier.notify("error" , err.error.error);
      //
      //       //unsetting the preloaders
      //       this.beingDeletedWaiver=false;
      //     })
    }
    //Edit installment form submit
    editWaiverFormSubmitted(){
      //setting the spinner to spinning
      this.beingEditFormSubmit =true;
      //Reseting the updatedValues
      this.updatedValues = {}

      //Getting to know what has changed in the form
      this.getUpdates(this.EditWaiverForm , this.updatedValues)

      //Check if there is something to update
      if( jQuery.isEmptyObject(this.updatedValues)  )
      {
        this.notifier.notify("warning" , "Nothing to change.");
        this.beingEditFormSubmit = false;

        //Close the modal
        $('#installmentEditModal').modal('hide');
        return;
      }

      //Send the edit request to server
      this._financeService
        .update(this.EditWaiverId , this.updatedValues )
          .subscribe(resp=>{
            this.notifier.notify("success" , "Installment has been updated.");
            this.beingEditFormSubmit = false;

            //installment edit modal open
            $('#installmentEditModal').modal('hide');

            //Referesh the data as well
            //informing parent that data has changed
            this.newData.emit();

          } , err=>{
            console.log("Installment edit form" , err)
            this.notifier.notify("error" , err.error.error);
            this.beingEditFormSubmit = false;
          })
    }

    //Get the updated form control values only
    getUpdates(formItem: FormGroup | FormArray | FormControl,updatedValues, name?: string) {

      if (formItem instanceof FormControl) {
        if (name && formItem.dirty) {
          if(updatedValues == undefined )
            updatedValues = [];
          updatedValues[name] = formItem.value;
        }
      } else {
        for (const formControlName in formItem.controls) {

          if (formItem.controls.hasOwnProperty(formControlName)) {
            const formControl = formItem.controls[formControlName];

            if (formControl instanceof FormControl) {
              this.getUpdates(formControl, updatedValues , formControlName);

            } else if (
              formControl instanceof FormArray &&
              formControl.dirty &&
              formControl.controls.length > 0
            ) {
              updatedValues[formControlName] = [];
              this.getUpdates(formControl, updatedValues[formControlName]);
            } else if (formControl instanceof FormGroup && formControl.dirty) {
              updatedValues[formControlName] = {};
              this.getUpdates(formControl, updatedValues[formControlName]);
            }
          }
        }
      }
    }

    waivedTypeChanged( type){
      if(type == 'Fixed'){
          this.WaiverValue.setValidators([Validators.required ,  Validators.min(1) ]);
      }else{
        this.WaiverValue.setValidators([Validators.required ,  Validators.min(1) , Validators.max(100) ]);
      }
      this.WaiverValue.setValue(1);
    }
    get WaiverValue(){
      return this.WaiverForm.get('waiver_value') as FormControl;
    }
}
