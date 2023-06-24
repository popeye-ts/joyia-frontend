import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input} from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { orderService } from '@services/order.service';
import * as Glide from "@assets/js/vendor/glide.min.js";
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";
import { OtherOrdersComponent } from "./otherOrders/otherOrders.component";
import { AuthenticationService } from '@services/authentication.service';
import { AlertService } from '@store/services/alert.sevice';
import { StateService } from '@uirouter/angular';
import { orderDetailService } from '@store/services/orderDetails.service';
import { Store } from '@ngrx/store';
import { State } from '@/Redux/state';
import { SelectOrder } from '@/Redux/actions/cashOrder.actions';


@Component({
  selector : 'orderdetail',
  templateUrl: './orderDetail.component.html',
  styleUrls: ['./orderDetail.component.scss']
})

export class OrderDetailComponent implements AfterViewInit , OnInit{
  pageData : any;
  ProductForm : FormGroup ;
  active : Number ;
  @Input('id') _id : any  ;
  orderData : any;
  g_ids : any;
  client_id : any;
  products : any;
  productImages : any[]=['image-alternate'];
  batches : any ;
  serverImagesPath : any = environment.cloudinary;
  total : Number = 0 ;
  totalRecieved : Number = 0 ;
  rsrcTitle : String = "";
  rating : Number = -1;
  beingRatingFormSubmit : Boolean =false;
  beingEditFormSubmit : Boolean = false;
  assignmentInProgress : Boolean = false;
  selectedUserId : String = "" ;
  assigned_to : any ;

  public assignUserAjax : Select2AjaxOptions;

  @ViewChild(OtherOrdersComponent , { static : true} ) thisClientOrders : OtherOrdersComponent;

  constructor(private _productService:productService  , private fb:FormBuilder ,
    private _orderService : orderService , private notifier : NotifierService ,
    public _permService : PermissionService , private _authService: AuthenticationService,
    private $state : StateService , private _orderDetailService : orderDetailService , 
    private _alertService : AlertService , private store: Store<State>){
    this.pageData = {
      title: 'Orders',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Order'
        },
        {
          title: 'Order Details'
        }
      ]
    };
    this.active = 1;
    // this.productImages.push("loading.gif");
  }
  ngOnInit(){
    let that = this ;
    this.fetchOrderDetail();
      // this.ProductForm = this.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
    let access_token ;
    //Taking care of authorization
    access_token = this._authService.token;
    let session = sessionStorage.getItem('session') || '';

    //Add product quantity options
    this.assignUserAjax = {
      url : environment.apiUrl+'users/' ,
      headers : { "Authorization" : "Bearer "+access_token , session },
      dataType : 'json' ,
      delay : 250 ,
      cache : false ,
      data : (params : any) => {
        console.log("Ajax Select 2" , params);
        return {
          search : params.term
        }
      },
      processResults : (data : any) => {
        console.log("Ajax Select 2 results assign" , data);
        return {
          results : $.map(data , function(obj){
              return {id:obj._id , text: obj.username}
          })
        }
      }
    };
    // $(".select2-search__field").unbind('focus focusin');
  }
  fetchOrderDetail(){
    let that = this;
    that.orderData = null;
    $("#summarySpinner").addClass("spinning");

    this._orderService.viewDetail(this._id).subscribe(response=>{
      console.log("We have some response in order detail component:" , response)
      that.orderData = response[0];

      let temp = [];
      response[0].guarantors.forEach(guarantor=>{
        temp.push (guarantor.guarantor_id)
      })
      //products
      //Now we have a situation here
      //After revolution of architecture change in products and orders
      //previouly we had products against order but now we have products against batches of order
      let tempProducts = [];
      that.batches = "[]";

      if(response[0].batches && !(response[0].products && response[0].products.length > 0) ){
        //Setting the local batches component
        that.batches = JSON.stringify(response[0].batches);

        //New architecture based order
        response[0].batches.forEach(batch => {
          batch.products.forEach(product => {
            tempProducts.push(product);
          });
        });
      }else{
        //Old architecutre based order
        response[0].products.forEach(product => {
            tempProducts.push(product);
        });
      }

      that.products =  JSON.stringify(tempProducts);
      //guarantor ids
      that.g_ids = JSON.stringify(temp)
      //client ids
      that.client_id= response[0].client;

      //Ratings
      if(response[0].rating)
        this.rating = response[0].rating;

      //If its cash order show respective tab
      if(response[0].on_full_payment){
        setTimeout(() => {          
          $("#fifth-tab").click()
        }, 500);
      }
      //Check if the Amount remaining is zero and the rating is not provided then show modal
      if(response[0].total_paid == response[0].total_amount && !response[0].rating && !response[0].on_full_payment)
        { 
          console.log("Gonna show modal what is response " , response);
          setTimeout(() => {
            (<any>$("#feedback")).modal("show")
          }, 3000);
        }
      //Since we have all the core data
      //We can request otherOrdersComponent to fetch other orders of this client if any
      that.thisClientOrders && that.thisClientOrders.getOrders(that._id);

      this.assigned_to =response[0].assigned_to ? response[0].assigned_to : response[0].created_by;

      $("#summarySpinner").removeClass("spinning");
    } , error=>{
      console.log("we have some error" , error)
    })
  }
  ngAfterViewInit() : void {


  }
  ngOnDestroy(): void {

  }
  populateImages(event){
    let that = this;
    let pObj = event;
    that.productImages = [];
    pObj.forEach(product => {
      product.image.forEach(imgSrc => {
          that.productImages.push(imgSrc);
      });
    });
    if(!that.productImages.length){
      that.productImages.push('v1659815812/store/no_product_image.jpg');
    }
    //initializing glide
    setTimeout(() => {
      that.initGlide()
    }, 0);
  }

  //Glides and sub glides
  initGlide(){
    let that = this;
    // Details Images
    if ($(".glide.details").length > 0) {
      var glideThumbCountMax = 5;
      var glideLength = $(".glide.thumbs li").length;
      var perView = Math.min(glideThumbCountMax, glideLength);
      let direction = 'rtl';

      var glideLarge = new Glide(".glide.details", {
        bound: true,
        rewind: false,
        focusAt: 0,
        perView: 1,
        startAt: 0,
        direction: direction,
      });

      var glideThumbs = new Glide(".glide.thumbs", {
        bound: true,
        rewind: false,
        perView: perView,
        perTouch: 1,
        focusAt: 0,
        startAt: 0,
        direction: direction,
        breakpoints: {
          576: {
            perView: Math.min(4, glideLength)
          },
          420: {
            perView: Math.min(3, glideLength)
          }
        }
      });

      $(".glide.thumbs").css("width", perView * 70);
      that.addActiveThumbClass(0 , glideThumbs  , perView);

      $(".glide.thumbs li").on("click", function (event) {
        var clickedIndex = $(event.currentTarget).index();
        glideLarge.go("=" + clickedIndex);
        that.addActiveThumbClass(clickedIndex , glideThumbs , perView);
      });

      glideLarge.on(["swipe.end"], function () {
        that.addActiveThumbClass(glideLarge.index , glideThumbs , perView);
      });

      glideThumbs.on("resize", function () {
        perView = Math.min(glideThumbs.settings.perView, glideLength);
        $(".glide.thumbs").css("width", perView * 70);
        if (perView >= $(".glide.thumbs li").length) {
          $(".glide.thumbs .glide__arrows").css("display", "none");
        } else {
          $(".glide.thumbs .glide__arrows").css("display", "block");
        }
      });

      glideThumbs.mount();
      glideLarge.mount();
    }
  }
  addActiveThumbClass(index , glideThumbs , perView) {
    $(".glide.thumbs li").removeClass("active");
    $($(".glide.thumbs li")[index]).addClass("active");
    var gap = glideThumbs.index + perView;
    if (index >= gap) {
      glideThumbs.go(">");
    }
    if (index < glideThumbs.index) {
      glideThumbs.go("<");
    }
  }
  //In case of new information recieved
  newData($event)
  {
    this.fetchOrderDetail()
  }
  setRating(score){
    this.rating = 5-parseInt(score);
    console.log("rating :" , score  , this.rating)
    let starsList = $(".ratingStar");
    for (let index = starsList.length; index > score; index--) {
      $(starsList[index-1]).html('\u2605');
    }
    //update database that rating has been added

  }
  submitRating(){
    let that = this;
    this.beingRatingFormSubmit =true;

    //update db that rating has been provided
    this._orderDetailService.submitRating(this._id , {rating : this.rating})
      .subscribe(resp=>{
        console.log("Response of rating submit " , resp )
        that.notifier.notify("success" , "Rating saved.");
        this.beingRatingFormSubmit =false;
        (<any>$("#feedback")).modal("hide")
      } , err=>{
        console.log("Error in rating submit " , err )
        that.notifier.notify("error" , err.error.error ? err.error.error : err.error.message);
        this.beingRatingFormSubmit =false;
      })
  }
  assignOrder(){
    (<any>$("#assign")).modal("show")
  }
  SelectAssignChange($evt){
      this.selectedUserId = $evt.value;
  }
  assignUser(){
      let that = this;
      this.assignmentInProgress = true;
      console.log("User which will be assigned " , this.selectedUserId );
      this._orderService.assignOrder(this._id , { user_id : this.selectedUserId } )
        .subscribe(resp=>{
          that.notifier.notify("success" , "Order assigned");
          this.assignmentInProgress = false;
          (<any>$("#assign")).modal("hide")
          that.fetchOrderDetail();

        } , err=>{
          that.notifier.notify("error" , err.error.error ? err.error.error : err.error.message);
          this.assignmentInProgress = false;
        })

  }
  markComplete(){
    let that = this;
    console.log("Complete order clicked " , this.orderData )
    let instructionBody = {
      title : "Complete order "+(that.orderData.order_id)+" modal",
      text : "Are you sure you want to mark order as completed?"
    };
    that._alertService.confirmThis( instructionBody ,async function(){
      //ACTION: Do this If user says YES
      console.log("Yes clicked" );
      that._alertService.setLoading();
      let orderBeingDeleted = await that._orderService.markCompleteOrder(that._id).toPromise();
      that._alertService.clear();
      
      that.notifier.notify("success" , orderBeingDeleted.message );      
      console.log("Whats in order being completed" , orderBeingDeleted );
    },function(){
      //ACTION: Do this if user says NO
      console.log("No clicked");
    })
  }
  deleteOrder(){
    let that = this;
    console.log("Delete order clicked " , this.orderData )
    let instructionBody = {
      title : "Delete order "+(that.orderData.order_id)+" modal",
      text : "Are you sure you want to delete order?"
    };
    that._alertService.confirmThis( instructionBody ,async function(){
      //ACTION: Do this If user says YES
      console.log("Yes clicked" );
      that._alertService.setLoading();
      let orderBeingDeleted = await that._orderService.deleteOrder(that._id).toPromise();
      that._alertService.clear();
      
      that.notifier.notify("success" , orderBeingDeleted.message );
      that.$state.go('store.order')

      console.log("Whats in order being deleted" , orderBeingDeleted );
    },function(){
      //ACTION: Do this if user says NO
      console.log("No clicked");
    })
  }
  addBatch(){
    this.store.dispatch(new SelectOrder(this.orderData ));
    this.$state.go("store.cashorder");

  }

}
