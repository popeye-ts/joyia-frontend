import { Component , OnInit , ViewChild , AfterViewInit , Output , EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup ,  Validators ,  ValidatorFn, AbstractControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StateService } from '@uirouter/angular';
import { PermissionService } from "@services/permissions.service";
import { Select2OptionData } from 'ng2-select2';

import { Observable , of , fromEvent } from 'rxjs';
import { AuthenticationService } from '@services/authentication.service';
import { categoryService } from '@services/category.service';

import {
  debounceTime ,
  map ,
  distinctUntilChanged ,
  filter
} from 'rxjs/operators';

@Component({
  selector : 'filters',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements AfterViewInit , OnInit{
  @Output() applyFiltersEmitter : EventEmitter<any> = new EventEmitter();

  FilterForm : FormGroup ;
  static beingSearched : boolean = false;
  //For optimization in case a request is already made cancel that
  ajaxCallSubscription : any;
  static dataLengthChanged : boolean = true;
  //Search filters
  public searchClientAjax : Select2AjaxOptions;
  searchCategoryData : any;
  filtersBeingApplied : boolean = false;

  constructor(private http:HttpClient , private fb:FormBuilder , private datePipe : DatePipe ,
    private $state : StateService , public _permService : PermissionService , private _authService: AuthenticationService
    ,private _catService : categoryService){

  }
  ngOnInit(){
    let that = this ;
    this.FilterForm = this.fb.group({
      fromDate : ['' ],
      toDate: ['' ],
      client: [''],
      category:[''],
      orderType : ['']
    });

    //Taking care of authorization
    let access_token = this._authService.token;

    let session = sessionStorage.getItem('session') || '';

    //Add search client ajax options
    this.searchClientAjax = {
      url : function (params ) {
          return environment.apiUrl+'client/select2/'+params.term;
      } ,
      cache : false ,
      headers : {
        "Authorization" : "Bearer "+access_token,
        session
      },
      processResults : (data : any) => {
        return {
          results : $.map(data , function(obj){
              return {id:obj._id , text: obj.personal_info.name}
          })
        }
      }
    };
    //After a little pause fetch categories
    setTimeout(() => {
      this.fetchCategories()
    }, 1000);
  }
  ngAfterViewInit() : void {
    let that = this ;
    (<any>$)(".datepicker").datepicker({ autoclose : true }).on('changeDate', function(e){
          let val = e.target.value;
          let formControlName = $(e.target ).attr("data-name") || "";
          let actualFormControl = that.FilterForm.get(formControlName);
          actualFormControl.setValue(val)
      });
  }

    //Fetch All categories
    fetchCategories(){
      let that = this;
      this._catService.getAll().subscribe(resp =>
        {
          let chooseOption = [{id : '' , text : 'All'}];
          let normalizedCategories =  resp.map(cat=>{ return {id: cat._id , text : cat.title }; });
          this.searchCategoryData = chooseOption.concat( normalizedCategories);
        });
    }
    //handling select 2
    selectCategoryChanged($event){

    }
    //Apply filters
    applyFilters(){
      let val = this.FilterForm.value;
      this.applyFiltersEmitter.emit(val)
        //First take all info from either make a temporary form
        //Making spinner
        this.filtersBeingApplied = true;

        // setTimeout(() => {
        //   this.filtersBeingApplied = false;
        // }, 5000);
    }

  //Validator for date range
  dateLessThan(){
    //factory function
      return (control: AbstractControl)=>{
            let invalid = false;
            const from = this.FilterForm && this.FilterForm.get("fromDate").value;
            const to = this.FilterForm && this.FilterForm.get("toDate").value;
            if (from && to) {
              invalid = new Date(from).valueOf() > new Date(to).valueOf();
            }
            return invalid ? { invalidRange: { from, to } } : null;
        }
    }
    public changedClient(e: any): void {
        this.FilterForm.controls.client.setValue(e.value);
    }
    public changedCategory(e: any): void {
        this.FilterForm.controls.category.setValue(e.value);
    }
    public changedOrderType(e: any): void {
        this.FilterForm.controls.orderType.setValue(e.value);
    }
}
