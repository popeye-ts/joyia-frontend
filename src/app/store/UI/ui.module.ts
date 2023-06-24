import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgComponent } from "@ui/Image/img.component";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Preloader } from '@ui/preloader/preloader.component';
import { AlertComponent } from './Alert/alert.component';

@NgModule({
  declarations: [ ImgComponent , Preloader , AlertComponent ],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule

  ],
  exports : [
    ImgComponent ,
    Preloader,
    NgxSkeletonLoaderModule,
    AlertComponent
  ]
})
export class UIModule { }
