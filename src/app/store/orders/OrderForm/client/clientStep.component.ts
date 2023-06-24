import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy  , Input ,OnChanges, SimpleChanges , Output , EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';


@Component({
  selector : 'orderClientStep',
  templateUrl: './clientStep.component.html',
  styleUrls: ['./clientStep.component.scss']
})
export class OrderClientStepComponent implements AfterViewInit , OnInit , OnChanges{
  pageData : any;
  clientForm : FormGroup ;
  active : Number ;
  filledByHand : Boolean = false;
  @Input() clientData :  any;
  @Output() removeClient = new EventEmitter();
  @Input() reset : any;
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
    this.clientForm = this.fb.group({
      name: ['' , Validators.required] ,
      phone :['' , [Validators.required , Validators.minLength(12),Validators.maxLength(12)]  ],
      address : ['' , ],
      cnic :  ['' , [Validators.required , Validators.minLength(15),Validators.maxLength(15)] ] ,
      fName : ['' , ],
      fCnic : ['' , [ Validators.minLength(15),Validators.maxLength(15)] ]
    });
  }
  ngOnInit(){
    let that = this ;

  }
  ngAfterViewInit() : void {


  }
  ngOnDestroy(): void {

  }
  ngOnChanges(changes ){
    console.log("I client step right now and the data has been changed" , changes)


    if(changes.clientData && changes.clientData.currentValue && !this.filledByHand)
    {
      this.clientData = changes.clientData.currentValue
      this.clientForm.setValue({
           name :this.clientData.personal_info.name
         , phone : this.clientData.personal_info.phone
         , address : this.clientData.personal_info.address
         , cnic : this.clientData.personal_info.cnic
         , fName :this.clientData.personal_info.father_name
         , fCnic : this.clientData.personal_info.father_cnic
        });
      this.clientForm.disable()  ;
      this.filledByHand = false;
    }
    if(changes.reset && changes.reset.currentValue)
    {
      this.clientData = null
      this.clientForm.reset();
      this.clientForm.enable();
    }
  }
  remove(){
    this.clientData = null;
    this.removeClient.emit()
    this.clientForm.reset()
    this.clientForm.enable()
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
