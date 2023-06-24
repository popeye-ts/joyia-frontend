import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input ,OnChanges, SimpleChanges , Output , EventEmitter} from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  , Validators} from '@angular/forms';


@Component({
  selector : 'orderGuarantorStep',
  templateUrl: './guarantorsStep.component.html',
  styleUrls: ['./guarantorsStep.component.scss']
})
export class OrderGuarantorStepComponent implements AfterViewInit , OnInit , OnChanges{
  pageData : any;
  guarantorForm : FormGroup ;
  active : Number ;
  @Input() selectedGuarantor : any;
  @Input() second : boolean;
  @Input() reset : any;
  @Output() removeGuarantorEmitter = new EventEmitter();
  constructor(private _productService:productService  , private fb:FormBuilder){
    this.pageData = {
      title: 'All Orders',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Order'
        },
        {
          title: 'Order Details'
        }
      ]
    };
    this.active = 1;
  }
  ngOnInit(){
    let that = this ;
      this.guarantorForm = this.fb.group({
      name: ['' , Validators.required],
      phone : [''  ,[ Validators.required , Validators.minLength(12),Validators.maxLength(12)] ] ,
      address : [''],
      cnic : ['' , [Validators.required , Validators.minLength(15),Validators.maxLength(15)] ]  

    });
  }
  ngAfterViewInit() : void {
    if(this.selectedGuarantor)
    {  this.guarantorForm.setValue({
        name :this.selectedGuarantor.name
        ,phone: this.selectedGuarantor.phone
        ,address:  this.selectedGuarantor.address
        ,cnic : this.selectedGuarantor.cnic
      })
      this.guarantorForm.disable()
    }
  }
  ngOnDestroy(): void {

  }
  ngOnChanges(changes){
    console.log("Changes in guarantors step component" , changes)

    if(changes.selectedGuarantor && changes.selectedGuarantor.currentValue)
    {
      this.selectedGuarantor = changes.selectedGuarantor.currentValue
      this.guarantorForm.setValue({
        name :this.selectedGuarantor.name
        ,phone: this.selectedGuarantor.phone
        ,address:  this.selectedGuarantor.address
        ,cnic : this.selectedGuarantor.cnic
      })
      this.guarantorForm.disable()
    }
    if(changes.reset && changes.reset.currentValue)
    {
      this.selectedGuarantor = null
      this.guarantorForm.reset();
      this.guarantorForm.enable();
    }
  }
  remove(gu){
    console.log(gu)
    this.guarantorForm.reset();
    this.guarantorForm.enable()
    this.removeGuarantorEmitter.emit(this.second);
    this.selectedGuarantor = undefined ;
  }
  inpPhone(event)
    {
      let keyCode  = event.which;
      let str = event.target.value;

      if(str.length > 11 && keyCode !=8)
        {
          event.preventDefault();
          return ;
        }

      //If its not a number prvenet from writing
      if( keyCode < 48 || keyCode > 57)
        event.preventDefault();

      if(str.length == 4)
        event.target.value = str+="-";
      // console.log(event ,  , "Key code phone")
    }
    inputCNIC(event){
      let keyCode  = event.which;
      let str = event.target.value;

      if(str.length > 14 && keyCode !=8)
        {
          event.preventDefault();
          return ;
        }

      //If its not a number prevent from writing
      if( keyCode < 48 || keyCode > 57)
        event.preventDefault();

      if(str.length == 5 || str.length == 13 )
        event.target.value = str+="-";
      // console.log(event ,  , "Key code phone")

      }
}
