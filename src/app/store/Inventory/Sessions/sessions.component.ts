import { Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";

import { AuthenticationService } from '@services/authentication.service';
import { Store } from '@ngrx/store';
import { State } from '@/Redux/state';
import { QRSessionService } from '@store/services/QRSessionService.service';
import { PermissionService } from '@store/services/permissions.service';

@Component({
  selector : 'sessionsLst',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsLstComponent implements AfterViewInit , OnInit{
  pageData : any;
  sessions : Array<any> = [];
  total : number = 10;
  noSessions : boolean = false;
  shownSpinner : Boolean = false;
  dataLengthChanged : Boolean = false;
  dataBeingFetchedFirstTime : Boolean = true;
  rsrcTitle : String = "Inventory";

  filters : any = {
    skip : 0 ,
    limit : 10 
  }
  pages: number[] = [1];
  currentPage: number = 1;

  constructor(private _sessionService:QRSessionService  ,
    private $state: StateService ,public _permService : PermissionService ,   private notifier : NotifierService , private _authService : AuthenticationService , 
    private store: Store<State>){
    this.pageData = {
      title: 'Inventory',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Sessions List'
        }
      ]
    };
  }
  ngOnInit(){
    let that = this ;
    this.fetchList();
  }
  ngAfterViewInit() : void {
  }
  
  async fetchList(): Promise<any> {
    let that = this;
    try{
      this.shownSpinner = true;
      let response = await this._sessionService.get(this.filters).toPromise();
      let sessions = response.sessions || [];
      if(sessions){
        this.sessions = sessions;
        this.total = response.total;
        this.noSessions = false;
      }else{
        this.noSessions = true;
      }
      this.paginate();
    }catch(error){
      this.notifier.notify("error" , "Something went wrong while fetching sessions list")
      console.log("An error occured while fetching list " , error );
    }finally{
      this.shownSpinner = false;
      this.dataBeingFetchedFirstTime = false;
    }
  }
  ngOnDestroy(): void {

  }
  showDetails(id ){
    this.$state.go('store.sessiondetail' , { id : id });
  }
  async changeNumberOfRecords(count : number = 10){
    try{
      this.dataLengthChanged = true;
      this.filters.limit = count;
      await this.fetchList();
    }catch(error ){
      console.log("An error occured " , error );
    }finally{
      this.dataLengthChanged = false;
    }
  }
  paginate() {
    let totalItems = this.total;
    let pageSize = this.filters.limit;
    let currentPage = Math.floor(this.filters.skip / pageSize)+1; 
    let maxPages = Math.floor(totalItems / pageSize)+1;

    // calculate total pages
    let totalPages = Math.ceil(~~totalItems / ~~pageSize);

    // ensure current page isn't out of range
    if (currentPage < 1) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= maxPages) {
        // total pages less than max so show all pages
        startPage = 1;
        endPage = totalPages;
    } else {
        // total pages more than max so calculate start and end pages
        let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
        let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrentPage) {
            // current page near the start
            startPage = 1;
            endPage = maxPages;
        } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
            // current page near the end
            startPage = totalPages - maxPages + 1;
            endPage = totalPages;
        } else {
            // current page somewhere in the middle
            startPage = currentPage - maxPagesBeforeCurrentPage;
            endPage = currentPage + maxPagesAfterCurrentPage;
        }
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    this.pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

    // return object with all pager properties required by the view
    this.currentPage = currentPage;
  }
  showPage(pageNumber){
      this.filters.skip = this.filters.limit*(pageNumber-1);
      this.fetchList();
  }
}
