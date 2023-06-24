import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductComponent } from './Product/product.component';
import { ProductDetailComponent  } from './ProductDetail/productDetail.component';
import { ProductFormComponent } from './ProductForm/productForm.component';
import { similarProductsComponent } from './similarProducts/similarProducts.component';
import { CategoryComponent } from './Category/category.component';
import { UIModule } from '@ui/ui.module';

import { TooltipModule } from './../UI/ToolTip/tooltip';
import { ReactiveFormsModule  } from '@angular/forms';
import { Select2Module , Select2OptionData } from 'ng2-select2';
import { RoutingModule } from './../routing/routing.module';
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { customNotifierOptions } from "./../UI/Toaster/notifier";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
//*****************:: QR CODE  ::**********************//
import { NgQrScannerModule } from 'ngx-qr';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';



@NgModule({
  declarations: [    ProductComponent , ProductDetailComponent , ProductFormComponent  , CategoryComponent , similarProductsComponent ],
  imports: [
    NotifierModule.withConfig(customNotifierOptions) ,
    CommonModule,
    ReactiveFormsModule ,
    Select2Module ,
    RoutingModule,
    TooltipModule,
    NgxSkeletonLoaderModule,
    UIModule,
    NgQrScannerModule,
    NgxQRCodeModule
  ],
  exports : [
    similarProductsComponent
  ]
})
export class ProductsModule { }
