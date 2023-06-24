import { Component, HostListener, OnInit } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, concat, forkJoin, fromEvent, Observable, of, Subject } from 'rxjs';
import { UserService } from '@store/services/user.service';
import { environment } from '@environments/environment';
import { PermissionService } from '@store/services/permissions.service';
import { reportService } from '@store/services/reports.service';
import { StateService } from '@uirouter/core';
import { saveAs } from 'file-saver';
import { ScrollService } from '@store/services/scroll.service';

@Component({
  selector: 'reports-orders-assigned',
  templateUrl: './orders-assigned.component.html',
  styleUrls: ['./orders-assigned.component.scss']
})
export class OrdersAssignedComponent implements OnInit {
  rsrcTitle : String = "Report Orders Assigned";
  pageData : any ;
  selectedPersonId = '5a15b13c36e7a7f00cf0d7cb';
  peopleAsync: Observable<any[]>;
  githubUsers$: Observable<any[]>;
  users$ : Observable<any[]>;
  peopleLoading = false;
  serverImagesPath : any = environment.cloudinary;
  noOrders : boolean = false;
  peopleAsyncSearch: Observable<any[]>;
  peopleLoadingAsyncSearch = false;
  peopleInputAsyncSearch = new Subject<string>();
  selectedPersonsAsyncSearch : any = [];
  filtersBeingApplied : boolean = false;
  selectedUsers: any[] = [];
  ordersLst : any = [];
  totalCount : number = 0;
  filteredCount : number = 0;

  obsArray: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  items$: Observable<any> = this.obsArray.asObservable();
  currentPage: number = 0;
  pageSize: number = 10;
  
  private ngUnsubscribe = new Subject();
  constructor( 
    public _permService : PermissionService ,
    private _usersService : UserService ,
    private _reportsService : reportService ,
    private _scrollService : ScrollService ,
    private $state : StateService ) {
    // this.people = selectDataService.people;
    this.pageData = {
      title: 'Reports',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Orders'
        },
        {
          title: 'Assignment List'
        }
      ]
    };
  }
  ngOnInit() {
    let that = this;
    this.users$ = this._usersService.search('-');
    this.ordersLst = [];
    this.currentPage = 0;
    this.applyFilters();
    this.peopleInputAsyncSearch.pipe(
      //get value

      //If character length is greater then two
      // , filter(res => res.length > -1  )

      //Time in milliseconds between key events
      debounceTime(200)

      //If previous query is different from current
      , distinctUntilChanged()

      //subscription for response
    ).subscribe(async(text : string )=>{
      let data :any = [];
      try{
        this.peopleLoading = true;
        this.users$ = await this._usersService.search(text);
      }catch(err){
        console.log("An error occured " , err );
      }finally{
        this.peopleLoading = true;
      }
    });

    // Handle scroll event on containing dialog so we can load more results if necessary
   this._scrollService.onScrolledDown$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.currentPage++;
        console.log("Gonna fetch data for page :"+this.currentPage)
        this.applyFilters()
      });

    //Page count changed
    $("#pageCountDatatable .dropdown-menu a").on("click", function (event) {
      //Showing spinner
      $(".dropdown-item").removeClass("active");
      $(this).addClass("active");
      $("#records").text($(this).text() );
      console.log("Show results size :", $(this).text());
      that.currentPage = 0;
      that.pageSize = ~~($(this).text());
      that.ordersLst = [];
      that.applyFilters();
    });
  }
  applyClicked(){
    this.currentPage = 0;
    this.ordersLst = [];
    this.applyFilters();
  }
  async applyFilters(){
    try{

      this.filtersBeingApplied=true;
      let data =await this._reportsService.assignedOrdersReport({users : this.selectedUsers , offset : this.currentPage, size : this.pageSize} ).toPromise();
      this.ordersLst = this.ordersLst.concat(data.data);
      this.totalCount = ~~data.recordsTotal;
      this.filteredCount = ~~data.recordsFiltered;
      console.log("After filters application orders fetched:"  , data );

    }catch(err){
      console.log("An error occured " , err )
    }finally{
      this.filtersBeingApplied=false;
    }
  }
  showDetails(_id){
    this.$state.go('store.orderdetail' , {id : _id})

  }
  downloadFile() {
    const getNestedObject = (nestedObj, pathArr) => {
      return pathArr.reduce((obj, key) =>
          (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
    }
    
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    let count= 0;
    const header = ['Sr' ,'Order Id', 'Client','Client Phone','Assigned To','Next Payment Date','Last Payment Date' , 'Guarantors' , 'Grand Total' , 'Total Paid'];
    let csv = this.ordersLst.map(order=>{
      let orderAssignedTo = getNestedObject( order , ["assigned_to" , "username"]) || getNestedObject( order ,["created_by","username"]);
      let guarantors = order.guarantors.map(g=>{
        return getNestedObject(g , ["guarantor_id","name"]) +'_' + getNestedObject(g , ["guarantor_id", "phone"])        
      }).join(" | ")
      guarantors = guarantors == " | " ? "No info" : guarantors;
      let objToReturn = [
        ++count,
        order.order_id ,
        getNestedObject(order , ["client","personal_info", "name"]) ,
        getNestedObject(order , ["client","personal_info", "phone"]),
        orderAssignedTo ,
        getNestedObject(order , ["next_payment_date"]),
        getNestedObject(order , ["last_payment_time"]),
        guarantors  ,
        (order.grand_total ? order.grand_total : order.total_amount)+'' ,
        order.total_paid+'' ,
      ];
      return objToReturn.join(" , ")
    });
    csv.unshift(header)
    let csvArray = csv.join('\r\n');
    var blob = new Blob([csvArray], {type: 'text/csv' })
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!

    saveAs(blob, dd+'_'+mm+"_AssignedOrders.csv");
  }
  public ngOnDestroy () {
		// Remove event handlers
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
