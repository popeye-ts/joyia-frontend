import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input , OnChanges  } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import { DataTableDirective } from 'angular-datatables';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { getBestSelllers } from '@/Redux/selectors/dashboard.selector';

@Component({
  selector : 'bestSellers',
  templateUrl: './bestSellers.component.html',
  styleUrls: ['./bestSellers.component.scss']
})
export class bestSellersComponent implements AfterViewInit  , OnInit {
  @ViewChild(DataTableDirective  , {static : false})
  dtElement : DataTableDirective;
  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<DataTableDirective> = new Subject();
  

  serverImagesPath : string = environment.apiUrl+"uploads/";
  bestSellers$ : Observable<any>  ;
  bestSellers : any [];

  beingLoaded : boolean = true;

  constructor(private store: Store<State> ){
    this.bestSellers$ = this.store.select(getBestSelllers );
    
  }
  ngOnInit(){
    //dataTable
    this.dtOptions =
      {
              lengthChange: false,
              searching: false,
              destroy: true,
              info: false,
              dom: '<"row view-filter"<"col-sm-12"<"float-left"l><"float-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>',
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
            }
    ;
  }


  ngAfterViewInit() : void {
    this.bestSellers$.subscribe(bestSellerData=>{
      this.beingLoaded = bestSellerData.beingLoaded;
      this.rerender();
      this.bestSellers = bestSellerData.data || [];
      console.log("Best sellers length " , this.bestSellers );

      if(this.bestSellers.length)
       {
         console.log("Best sellers length --" , this.bestSellers );
        this.dtTrigger.next();
       } 
    })
    this.dtTrigger.next()
  }
  rerender(): void {
    if(this.dtElement.dtInstance)
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear().draw();
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();

  }

}
