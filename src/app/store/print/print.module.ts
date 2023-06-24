import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from '@ui/ui.module';
import { RoutingModule } from './../routing/routing.module';
import { NgxPrintModule } from 'ngx-print';
import { InstallmentReceiptComponent } from './installmentReceipt/installmentReceipt.component';

@NgModule({
  declarations: [ InstallmentReceiptComponent ],
  imports: [
    CommonModule ,
    RoutingModule ,
    UIModule ,
    NgxPrintModule
  ],
  exports :[
    InstallmentReceiptComponent
  ]
})
export class PrintModule { }
