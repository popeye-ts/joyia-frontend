import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  } from '@angular/core';
import { Subject } from 'rxjs';
import { PermissionService } from '@services/permissions.service';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import { StateService} from "@uirouter/angular";
import * as Glide from "@assets/js/vendor/glide.min.js";
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';

@Component({
  selector : 'productDetail',
  templateUrl: './productDetail.component.html',
  styleUrls: ['./productDetail.component.scss']
})
export class ProductDetailComponent implements AfterViewInit , OnInit{
  pageData : any;
  @Input('id') _id : any  ;
  data : any ;
  otherInfo : any ; //needed it for product detail etc
  ProductForm : FormGroup ;
  active : Number ;
  inventoryInfoExists : boolean = true;
  serverImagesPath : any = environment.cloudinary;

  name = 'Angular 8';
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  value = 'https://www.techiediaries.com/';

  constructor(private _productService:productService  , private fb:FormBuilder , private notifier : NotifierService
    , public _permService : PermissionService, private state: StateService){
    this.pageData = {
      title: 'All Products',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Product'
        },
        {
          title: 'Product Detail'
        }
      ]
    };
    this.active = 1;

  }
  ngOnInit(){
    let that = this ;
    if(this._id)
    {
      this.fetchDetail(this._id);
    }
  }

  fetchDetail(id): void {
    let that = this;
    that.data = {
      image  : ['alternate-image']
    };
    this._productService.viewDetail(id).
          subscribe(
            response =>
              {
                console.log("response from inventory detail of product" , response) ;
                if(response == null)
                  {
                    this.data.quantityAvailable= 0;
                    // Sorry invalid details required
                  }
                else
                    {
                      //check if there is some info in inventory

                      //if there is no info then fetch product info

                      //we have info in inventory
                      if(response.product)
                      {
                        that.data = response.product;
                        that.data.quantityAvailable = response.quantity_available;
                        that.data.endDate = response.end_date;
                        that.data.lastSupply = response.last_supply_date;
                        that.data.stock = response.stock;
                        that.pageData.breadcrumbs.push({title : ''+response.product.product_display_name});
                        console.log("Product details",response.product , "other response", response.product);
                      }else{
                        that.inventoryInfoExists = false;
                        that.data = response;
                      }

                      //initializing otherInfo
                      that.otherInfo = [];
                      that.otherInfo.push({ key : "Sale price" , value:   that.data.price.sale_price+"/_"})
                      that.otherInfo.push({ key : "Purchase price" , value:   that.data.price.purchase_price+"/_"})
                      that.otherInfo.push({ key : "Model" , value:   that.data.other_info.model})
                      that.otherInfo.push({ key : "Company" , value:   that.data.other_info.company})
                      that.otherInfo.push({ key : "Created " , value:   that.data.created_at})
                      that.otherInfo.push({ key : "Last updated " , value:   that.data.updated_at})
                      //initializing glide
                      setTimeout(() => {
                        that.initGlide()
                      }, 0);
                    }

              } ,
            error =>
              {
                console.log("response", error);
              }
            );
      console.log("Data after initialized" , this.data);
  }
  ngAfterViewInit() : void {
    // this.notifier.notify("success", "You are awesome! I mean it!" );
    // this.notifier.notify("error", "Failed!" );
    // this.notifier.notify("warning", "Warning!" );
    // this.notifier.notify("default", "ok!" );


  }
  ngOnDestroy(): void {

  }
  capturedQr(result: string) {
       console.log("Capture QR Code" , result);
  }
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
  all(){
    // console.log("All clicked")
  }
  deleteProduct(){
    this._productService
      .remove(this._id)
        .subscribe(
            resp=>{
              //Client deleted
              this.notifier.notify("success", resp.message );
              this.state.go('store.product');

            } ,
            error=>{
              this.notifier.notify("error", error.error.message );
              console.log("Error occured" , error)
            })
  }

}
