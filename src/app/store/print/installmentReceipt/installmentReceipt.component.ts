import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , OnChanges , Output , EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DatePipe } from '@angular/common';
import { StateService } from '@uirouter/angular';
import { PermissionService } from "@services/permissions.service";
import { financeService } from '@services/finance.service';

@Component({
  selector : 'installmentReceipt',
  templateUrl: './installmentReceipt.component.html',
  styleUrls: [ './installmentReceipt.component.scss']
})
export class InstallmentReceiptComponent implements AfterViewInit , OnInit , OnChanges{
  @Input() data : any;
  rsrcTitle : String = "Installment Receipt";
  orderData : any;
  total : number = 0;
  date:Date;
  id : '';
  @Input() orderAdvanceAmount : number ;
  @Output() printNow : EventEmitter<any> = new EventEmitter();

  constructor(private http:HttpClient , private datePipe : DatePipe ,
    private $state : StateService , public _permService : PermissionService , private _financeService : financeService){
      setInterval(() => {
        this.date = new Date()
      }, 1000)
    }
    ngOnChanges(changes){
      let that = this;
      console.log("In print installment component changes" , changes )
      if(changes && changes.data && changes.data.currentValue )
      {
        this.id= changes.data.currentValue.installmentId;
        console.log("Installment data " , this.id , changes.data.currentValue );
        //fetch data
        this._financeService
          .getPrevious(this.id)
            .subscribe(
                resp=>{
                  console.log("Installment print component" ,resp)
                  //New requirement manipulate response in case of single receipt to be printed
                  that.updateOrderData(resp , changes.data.currentValue.currentlySelectedForPrint);

                  that.total = 0;
                  //Calculating the sum of anounts
                  if(resp.order)
                  {
                    if(resp.order.advance_amount)
                    {
                      let advance = parseInt(resp.order.advance_amount);
                      that.total = isNaN(advance ) ? 0 : advance ;
                    }
                  }
                  //Adding up the amount to the total
                  if(resp.installments)
                  {
                    resp.installments.forEach(inst=>{
                      let instAmount = parseInt (inst.amount) ;
                      that.total+= isNaN(instAmount) ? 0 : instAmount ;
                    })
                  }
                  //We can now print the receipt as now it's data has been fetched
                  setTimeout(() => {
                    that.printNow.emit(null);
                  }, 400);
                } , err=>{
                  console.log("error in print"  , err)
                })
      }
  }
  updateOrderData(obj , type){
    let that = this;

    if(type == 'PRINT_SINGLE'){
      //We have a requirement that show single row for all previous Installments
      if( obj.installments.length > 1){
        let sumAmount = 0;
        let installmentArray = [];
        let lastPaymentTime = '';
        for (let index = 0; index < obj.installments.length - 1; index++) {
          const installment = obj.installments[index];
          sumAmount += installment.amount;
          lastPaymentTime = installment.created_at;
        }
        installmentArray.push({
          amount : sumAmount ,
          lastPaymentTime
        })
        installmentArray.push( obj.installments.pop() );
        obj.installments = installmentArray;
      }


    }
    that.orderData = obj;
  }
  ngOnInit(){
    let that = this ;
  }
  ngAfterViewInit() : void {
  }
  formatMoney(number){
    if(number)
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      else
        return '0';
  }

}
