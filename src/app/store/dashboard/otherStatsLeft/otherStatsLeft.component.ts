import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input , OnChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";

@Component({
  selector : 'otherStatsLeft',
  templateUrl: './otherStatsLeft.component.html',
  styleUrls: ['./otherStatsLeft.component.scss']
})
export class otherStatsLeftComponent implements AfterViewInit , OnInit , OnChanges{
  pageData : any;
  @Input('data') data : any  ;
  serverImagesPath : string = environment.apiUrl+"uploads/";
  keys : any;
  titles : string [];
  constructor(private _productService:productService  , private fb:FormBuilder , private notifier : NotifierService){
  }
  ngOnInit(){

  }
  ngOnChanges(changes)
  {
    if(changes && changes.data && changes.data.currentValue)
    {
      this.keys = Object.keys(changes.data.currentValue)
      this.titles = this.keys.map(key=>{
        return key.replace("_" , " ")
      })
    }
  }

  ngAfterViewInit() : void {

  }
  ngOnDestroy(): void {

  }

}
