import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input , OnChanges  } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import { productService } from "@services/product.service";

@Component({
  selector : 'similarProducts',
  templateUrl: './similarProducts.component.html',
  styleUrls: ['./similarProducts.component.scss']
})
export class similarProductsComponent implements AfterViewInit , OnInit , OnChanges{
  similarProducts : any[] = new Array(6);
  serverImagesPath : string = environment.cloudinary.medium;

  constructor(private _prodService : productService){}
  @Input('categories') categories : any ;
  ngOnInit(): void{
    console.log("Categories in similar products component" , this.categories )
    //fetch Related category products
    this.fetchSimilar()
  }
  ngAfterViewInit():void{
        console.log("Categories in similar products component after" , this.categories )
  }
  ngOnChanges(changes){

    if(changes && changes.categories && changes.categories.currentValue)
    {
          console.log(changes , changes.categories , "In similar products on changes method if::")
      this.categories = changes.categories.currentValue;
      //fetch products which are similar
      this.fetchSimilar()
    }
  }
  fetchSimilar(){
    if(this.categories =='')
      return ;
    this._prodService.fetchSimilar({ category :this.categories})
      .subscribe(
          resp => {
            this.similarProducts = resp;
            console.log("In similar products response " , resp )
          } ,
          err=>{
            console.log("In similar products error occured " ,err )
          })
    }
}
