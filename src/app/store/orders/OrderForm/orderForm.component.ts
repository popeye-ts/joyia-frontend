import {Component , OnInit , ViewChild , ViewChildren , QueryList , AfterViewInit , OnDestroy} from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import {OrderClientStepComponent} from './client/clientStep.component';
import {OrderGuarantorStepComponent} from './guarantors/guarantorsStep.component';

@Component({
  selector : 'orderform',
  templateUrl: './orderForm.component.html',
  styleUrls: ['./orderForm.component.scss']
})
export class OrderFormComponent implements AfterViewInit , OnInit{
  @ViewChild(OrderClientStepComponent , {static : false}) client;
  @ViewChildren(OrderGuarantorStepComponent ) guarantorChildren !: QueryList<OrderGuarantorStepComponent>;

  pageData : any;
  ProductForm : FormGroup ;
  active : Number ;
  guarantorCount : Number = 1;
  currentlySelectedStep : number = 1;
  selectedClient  : any;
  selectedGuarantor : any;
  products : Array<any> = [];
  guarantors : Array<any> =[];
  selectedProductTemp : any;
  productsQuantity : any;
  desc: string = '';
  resetGuarantors : number = 0;
  resetProducts : number = 0;
  resetClient : number = 0;

  constructor(private _productService:productService  , private fb:FormBuilder){
    this.pageData = {
      title: 'Add Order Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Order'
        }
      ]
    };
    this.active = 1;
  }
  ngOnInit(){
    let that = this ;
      // this.ProductForm = this.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
  }
  ngAfterViewInit() : void {
    let that = this;
    (<any>$)('#smartWizardCheck').smartWizard({
      selected: 0,
      theme: 'check',
      transitionEffect: 'fade',
      showStepURLhash: false ,

    });
    (<any>$)("#smartWizardCheck").on("leaveStep", function (e, anchorObject, stepNumber, stepDirection) {
            if (stepDirection === 'forward' ) {
              //handling client form
              if(stepNumber == 0)
                {
                  let cForm = that.client.clientForm.value
                  if(that.client.clientForm.valid || that.client.clientForm.disabled)
                      {
                        that.selectStep( (++stepNumber)+1)
                        return ;
                      }
                    that.client.clientForm.controls.name.markAsDirty() ;
                    that.client.clientForm.controls.phone.markAsDirty() ;
                    that.client.clientForm.controls.cnic.markAsDirty() ;

                    e.preventDefault()
                }
                //handling guarantor form
                if(stepNumber == 1)
                  {
                    let flagAllGuarantorsGood = true ;
                    that.guarantorChildren.forEach((g , i)=>{
                      if(g.guarantorForm.valid || g.guarantorForm.disabled)
                        return ;
                      g.guarantorForm.controls.name.markAsDirty();
                      g.guarantorForm.controls.phone.markAsDirty();
                      g.guarantorForm.controls.cnic.markAsDirty();
                      flagAllGuarantorsGood = false;
                    })
                    if(flagAllGuarantorsGood )
                    {
                      that.selectStep( (++stepNumber)+1)
                    }else
                      e.preventDefault()
                  }

            }else
              that.selectStep( (--stepNumber)+1)
    });

  }

  getCurrentStepTitle(step = 0): string{
    let titles = ["Clients" , "Guarantors" , "Products"];

    let tempTitle = titles[step];
    return tempTitle;
  }
  addGuarantor(){
    this.guarantorCount=2;
  }
  ngOnDestroy(): void {

  }
  entitySelected(selectedObj){
    if(this.currentlySelectedStep == 1)
      {
        this.client.filledByHand = false
        this.selectedClient = selectedObj;
      }
    if(this.currentlySelectedStep == 2)
    {
      this.selectedGuarantor = selectedObj._id
      this.guarantors.push(selectedObj)
      if(this.guarantors.length > 2)
          this.guarantors.shift()
      this.guarantors= [].concat(this.guarantors)
      console.log("In order Form Parent component the array structure is of guarantors ::" , this.guarantors)
    }
    if(this.currentlySelectedStep == 3)
    {
      console.log("In step 3 now check if what's the information :" , selectedObj )

      this.products.push(selectedObj)
      this.selectedProductTemp = "";
      this.selectedProductTemp=selectedObj
      this.calculateQuantity();
    }
  }
  calculateQuantity(){
    this.productsQuantity = {};
    this.products.forEach(product => {
    this.productsQuantity[product._id] =  (this.productsQuantity[product._id] || 0) +1;
      if(product.quantity_available < this.productsQuantity[product._id] )
        this.productsQuantity[product._id] = product.quantity_available;
    })

  }
  selectStep(step){
    this.currentlySelectedStep = step;
  }
  removeClient(){
    this.selectedClient = undefined;
  }
  removeProduct(prod)
  {
    console.log("In order form component  the products array" , this.products  )
    let productsTemp = this.products.filter(function(obj){ return obj._id !== prod._id  })
    console.log("Temp array" , productsTemp)
    this.products = productsTemp
    console.log("In order form Component the products array after" , this.products)
    this.selectedProductTemp = undefined
  }
  removeGuarantor(guarantorNo)
  {
    switch( guarantorNo)
    {
      case 0: this.guarantors.shift() ; break;
      case 1: this.guarantors.pop() ;
    }
  }
  reset(){
    ++this.resetGuarantors ;
    ++this.resetClient ;
    ++this.resetProducts;
  }
  validate(){
    let that = this
    //check client form
    if(that.client == undefined || !(that.client.clientForm.disabled || that.client.clientForm.valid  ))
        return true

    //check guarantors forms
    let flagAllGuarantorsInvalid = false ;
    that.guarantorChildren.forEach((g , i)=>{
      if(g.guarantorForm.valid || g.guarantorForm.disabled)
        return ;
      flagAllGuarantorsInvalid = true;
    })

    //check atleast one product selected
    if(this.products == undefined || this.products.length == 0)
      return true
    return flagAllGuarantorsInvalid;
  }
  descChanged(event)
  {
    this.desc = event.target.value
  }
  updateInfo(){
    //check if currently selected client is empty or not
    if(  this.selectedClient == undefined )
      {
          this.client.filledByHand = true
          this.selectedClient= this.client.clientForm.value
      }
    //check if gurantors have either selected or filled forms
    //check for the length of guarantors

      //It means that one guarantor is selected
        this.guarantorChildren.forEach((g )=> {
          //check if this guarantor is selected form already affed guarantors
          if(g.guarantorForm.disabled )
            return ;
          if(g.guarantorForm.valid)
            this.guarantors.push(g.guarantorForm.value)
        } )

        console.log("In parent component the guarantors array now becomes after updateInfo method call ::" , this.guarantors)
  }
}
