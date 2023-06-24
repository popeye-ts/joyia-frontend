import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy, ElementRef} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { PermissionService } from "@services/permissions.service";
import { StateService } from '@uirouter/angular';
import { NotifierService } from "angular-notifier";
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import * as $ from 'jquery';


@Component({
  selector : 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements AfterViewInit , OnInit{
  @ViewChild('productsSearch', { static: true }) productsSearchInput: ElementRef;

  pageData : any;
  ProductForm : FormGroup ;
  productList :any[];
  filters : any ;
  totalProducts : Number ;
  active : Number ;
  pagination : Number[];
  selectedProduct : any ;
  serverImagesPath : string = environment.cloudinary.medium;
  rsrcTitle : String = "Products";
  noProducts : Boolean = false;

  //preloader
  static beingSearched : boolean = false;

  preloader : boolean = true;
  constructor(public _productService:productService  , private fb:FormBuilder , public _permService : PermissionService ,
    private $state : StateService , private notifier: NotifierService){
    this.totalProducts = 0;
    this.pageData = {
      title: 'All Products',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Product List'
        }
      ]
    };
    this.filters = {
      limit : 10 ,
      skip : 0 ,
      sorttype : 'created_at',
      sortdirection : -1,
      search : ''
    };
    this.pagination = [1];
    this.active = 1;
  }
  ngOnInit(){
    // console.("Initializing");
    let that = this ;
    this.inflateData();
      // this.ProductForm = this.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
    //data table options
  }
  inflateData(){
    let that = this;
    this._productService.get(this.filters).subscribe(resp =>
      {
        console.log("All Products" ,resp)

        //In case there are no products in database for this store
        if(resp.count == 0)
          this.noProducts = true;
        else
          this.noProducts = false;

        this.preloader = false;
        this.productList = resp.products;
        this.totalProducts =  resp.count;
        //Finding currently active page
        that.active = Math.ceil(that.filters.skip / that.filters.limit) +1 ;
        //Finding total pages
        let totalPages  = Math.ceil(
          resp.count /
          that.filters.limit) ;

        let pStr= "";
        for(let i=1 ; i <= totalPages ; i++ )
          pStr+=i+" ";
        that.pagination = pStr.trim().split(" ").map(Number);
        ProductComponent.beingSearched =  false;
      });


  }
  ngAfterViewInit() : void {
    let that = this;
    $(".dropdown-menu-right a").on("click", function (event) {
      $(".dropdown-menu-right .dropdown-item").removeClass("active");
      $(this).addClass("active");
      $("#records").text($(this).text() );
        that.filters.limit = parseInt($(this).text());
        that.inflateData();
    });
    $(".filter").on("click", function (event) {
      $("#sortBy").text("Order By "+$(this).text() );
      that.filters.sortdirection = that.filters.sortdirection*-1;
        that.inflateData();
    });
    this.initSearchFunctionality();

  }
  initSearchFunctionality() : void {
    let that = this;
    //search datatable functionality init
    fromEvent( $("#inputSearchProducts") ,"keyup").pipe(
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
      ProductComponent.beingSearched = true;
      console.log("Text we have for search" , text );
      // api.search(text).draw();
      that.filters.search = text;
      that.inflateData();
    });
  }
  ngOnDestroy(): void {

  }
  searchProducts(event:any):void {
    let inp = event.target;
    if(inp.value.length < 3)
      {

        $('#searchText').text('Minimum 3 letters');
                $('#searchText').show();
        return ;
      }
    $('#searchText').hide();

  }
  checkAll(evt):void {
     $('.custom-control-input').not(evt.target).prop('checked', evt.target.checked);
  }
  change(pNum) : void {
    if(this.active == pNum)
      return ;
    console.log("Page Number" ,pNum);

    //check if its the first number
    if(pNum == 1)
      {
        this.filters.skip = 0;
        this.inflateData();
        return ;
      }
    //check if its the last number

    this.filters.skip = (pNum-1)*this.filters.limit;
    this.inflateData();
    console.log("Its last");
    console.log("Skip : " + this.filters.limit*(pNum-1 ) );
  }
  showAll(evt){
    this.selectedProduct = null;
    console.log("Showing all");
  }
  singleSelected()
  {
    return ( $('.productInp.custom-control-input:checked').length ==1);
  }
  editProduct(){
    let id = $('.custom-control-input:checked').attr("id")
    this.$state.go("store.productForm" , {id : id});
  }
  deleteProducts(){
    let productsLst = $('.productInp.custom-control-input:checked');
    console.log("Products selected to delete" , productsLst , productsLst.length)
    if(productsLst.length >0 )
    {
      //Making an array of ids to remove
      let ids =  (productsLst.map((index , elem)=>{
        return   $(elem).attr("id")
      } )).toArray();


      //Sendinga delete request
      this._productService
        .remove({ids : ids})
        .subscribe(
          resp=>{
            //Rfresh the products list
            this.inflateData();
            this.notifier.notify("success", resp.message );
          },
          err=>{
            this.notifier.notify("error", err.error );
          })
    }else{
      this.notifier.notify("error", "Please select a product to delete." );
    }
  }
  get beingSearched(){
    return ProductComponent.beingSearched;
  }

}
