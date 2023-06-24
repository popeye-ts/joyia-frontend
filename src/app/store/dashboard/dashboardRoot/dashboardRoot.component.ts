import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  } from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from './../../services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import { statsService } from "./../../services/stats.service";
import PerfectScrollbar from 'perfect-scrollbar';
import {  Store } from '@ngrx/store';
import { State } from '@/Redux/state';
import { FetchBestSellers, FetchCardStats, FetchCategories, FetchLogs, FetchOrdersStats, FetchPendingPayments, FetchProducts, FetchRecentOrders, FetchSales, FetchSummaryStats } from '@/Redux/actions/dashboard.actions';

@Component({
  selector : 'dashboard',
  templateUrl: './dashboardRoot.component.html',
  styleUrls: ['./dashboardRoot.component.scss']
})
export class dashboardComponent implements AfterViewInit , OnInit{
  serverImagesPath : string = environment.apiUrl+"uploads/";
  pageData : any ;
  active : any;
  cardsArray : any  ;
  categoriesArray : any;
  recentOrders : {} ;
  salesData :  {} ;
  pendingData : {} ;
  bestSellers : {} ;
  summaryStats : any ;
  infoData : any ;

 
  constructor( private fb:FormBuilder ,
               private notifier : NotifierService ,
               private statisticsService : statsService ,
               private store: Store<State>
              ){
    this.pageData = {
      title: 'Dashboard',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Default'
        }
      ]
    };
    this.active = 1;
    this.store.dispatch(new FetchCardStats());
    this.store.dispatch(new FetchRecentOrders());
    this.store.dispatch(new FetchSales());
    this.store.dispatch(new FetchCategories());
    this.store.dispatch(new FetchLogs());
    this.store.dispatch(new FetchPendingPayments());
    this.store.dispatch(new FetchSummaryStats());
    this.store.dispatch(new FetchProducts());
    this.store.dispatch(new FetchBestSellers());
    this.store.dispatch(new FetchOrdersStats());
    
    
  }
  ngOnInit(){
    // this.statisticsService.getAll().subscribe(resp =>  {
    //   resp= resp.stats
    //   //fetching categories
    //   this.categoriesArray = resp.categories;

    //   //Taking care of card stats
    //   this.cardsArray = {}
    //   this.cardsArray.Total_Completed_Orders = resp.totalOrdersCompleted
    //   this.cardsArray.Total_Pending_Orders = resp.totalOrdersPending
    //   this.cardsArray.Total_Payments = resp.totalPayments
    //   this.cardsArray.Total_Recieved_Today = resp.countTodayRecieved
    //   this.cardsArray.Amount_Recieved_Today = resp.amountTodayRecieved

    //   //Taking care of recent orders
    //   this.recentOrders = resp.recent

    //   //Taking care of sales
    //   this.salesData = resp.sales

    //   //Taking care of Pending Installments Orders
    //   this.pendingData = resp.pendingInstalmentsOrdersIds ;

    //   //Taking care of best Sellers
    //   this.bestSellers = resp.bestSellers


    //   //Taking care of summary statistics
    //   this.summaryStats = {}
    //   this.summaryStats.Orders_Completed = { first: this.shortenLargeNumber(resp.totalOrdersCompleted ,0) ,second: this.shortenLargeNumber(resp.orderCount,0) }
    //   this.summaryStats.Orders_Pending = { first : this.shortenLargeNumber(resp.totalOrdersPending ,0 ), second :this.shortenLargeNumber(resp.orderCount , 0) }
    //   this.summaryStats.Total_Payments_Recieved = { first: this.shortenLargeNumber(resp.totalPaymentsRecieved,0) ,second:  this.shortenLargeNumber(resp.totalPayments , 0) }
    //   this.summaryStats.Count_Payments_Recieved = { first: this.shortenLargeNumber(resp.countTodayRecieved ,0),second: this.shortenLargeNumber(resp.orderCount , 0 ) }

    //   //Taking care of otherStatsLeft data
    //   this.infoData = {}
    //   this.infoData.Total_Products = {value : this.shortenLargeNumber(resp.totalProducts , 0) , label : "A total of all products " }
    //   this.infoData.Total_Guarantors = { value : this.shortenLargeNumber(resp.totalGuarantors , 0) , label : "A total of all guarantors "}
    //   this.infoData.Total_Clients = { value : this.shortenLargeNumber(resp.totalClients , 0) , label : "A total of all clients"}

    //   this.notifier.notify("success", "You are awesome! I mean it!" );
    //   console.log(resp)
    // }, err=> {
    //   this.notifier.notify("error", "Failed!" );
    // })
  }

  ngAfterViewInit() : void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // this.notifier.notify("warning", "Warning!" );
    // this.notifier.notify("default", "ok!" );



    // this.notifier.notify(
    //     "success",
    //     "You are awesome! I mean it!",
    //     "THAT_NOTIFICATION_ID"
    //   );
    if (typeof PerfectScrollbar !== "undefined") {
      var chatAppScroll;
      $(".scroll").each(function () {
        var ps = new PerfectScrollbar($(this)[0]);
      });
    }
  }
  ngOnDestroy(): void {

  }

  //Making helpers
  //for formating numbers
   shortenLargeNumber(num, digits) {
    var units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        decimal;

    for(var i=units.length-1; i>=0; i--) {
        decimal = Math.pow(1000, i+1);

        if(num <= -decimal || num >= decimal) {
            return +(num / decimal).toFixed(digits) + units[i];
        }
    }

    return num;
  }


}
