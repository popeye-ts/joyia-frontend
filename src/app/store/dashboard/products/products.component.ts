import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { getProducts } from '@/Redux/selectors/dashboard.selector';

@Component({
  selector : 'products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class productsComponent implements AfterViewInit {
  pageData : any; 
  dataFirstColumn : any[] ;
  dataSecondColumn : any[] ;
  serverImagesPath : string = environment.apiUrl+"uploads/";

  products$ : Observable<any>;
  beingLoaded : boolean = true;

  constructor(private store: Store<State> ){
    this.products$ = this.store.select(getProducts );
    
  }

 
  ngAfterViewInit() : void {
    let that = this;
    this.products$.subscribe(productsData=>{
      that.beingLoaded = productsData.beingLoaded;
      console.log("I have subscribed new products " , productsData  ,  that.beingLoaded)
      that.dataFirstColumn = []
      that.dataSecondColumn = []
      let count = 0;
    
      let data = productsData.data || [];
      data.map(product=>{
        count++;
        if(count > 22){

        }else 
        if(12 > count)
          that.dataFirstColumn.push(product)
        else
          that.dataSecondColumn.push(product)
        
      })
    })
  }
  ngOnDestroy(): void {

  }
  showDetail(id){
    console.log("Show product with id:" , id)
  }

}
