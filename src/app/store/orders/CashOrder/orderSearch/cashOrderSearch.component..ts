import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { orderService } from '@services/order.service';
import {  StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";

import { AuthenticationService } from '@services/authentication.service';
import { categoryService } from '@store/services/category.service';
import { CategoryChanged, SearchByText } from '@/Redux/actions/cashOrder.actions';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { getSearch } from '@/Redux/selectors/cashOrder.selector';


@Component({
  selector : 'cashordersearch',
  templateUrl: './cashOrderSearch.component.html',
  styleUrls: ['./cashOrderSearch.component.scss']
})
export class CashOrderSearchComponent implements AfterViewInit , OnInit{
  pageData : any;
  beingLoaded : boolean = true;
  categoryList : any[] ;
  searchCriteria$ : Observable<any>; 
  searchLabel : string = '';
  constructor(private store: Store<State> , private _catService : categoryService){
      this.pageData = {
      title: 'Products Component for Cash Order Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Cash Order'
        }
      ]
    };
    this.searchCriteria$ = this.store.select(getSearch);
  }
  ngOnInit(){
    this.fetchCategories();
    this.searchCriteria$.subscribe(searchCriteria=>{
      this.searchLabel = searchCriteria.label;
    })
  }
  ngAfterViewInit() : void {
    fromEvent( $("#search-inp") ,"keyup").pipe(
      //get value
      map((event : any) => {
        return event.target.value;
      })

      //If character length is greater then two
      // , filter(res => res.length > -1  )

      //Time in milliseconds between key events
      , debounceTime(1000)

      //If previous query is different from current
      , distinctUntilChanged()

      //subscription for response
    ).subscribe((text : string )=>{
      this.store.dispatch(new SearchByText(text));
    });
  }
  ngOnDestroy(): void {

  }
  
  fetchCategories(){
    this.beingLoaded = true ;
    this._catService.getAll().subscribe(resp =>{
      console.log("Fetch categories" , resp);
      this.categoryList = resp;
      this.beingLoaded = false;
    });

  }

  //validating the quantity
  validateNumber(event , index)
  {
    //check if the user enterred a number
    if(event.which <48 || event.which > 57)
    {
      event.preventDefault()
      return
    }

  }
  categoryChanged(category_title){
    console.log("Categroy changed" , category_title );
    this.store.dispatch(new CategoryChanged(category_title));

    if(category_title == 'all'){

    }else{

    }
  }
}
