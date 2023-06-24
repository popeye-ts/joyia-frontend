import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MoneyPipe } from './money.pipe';
import { SafeHTMLPipe } from './safeHTML.pipe';


@NgModule({
  declarations: [MoneyPipe , SafeHTMLPipe],
  imports: [
    CommonModule
  ],
  exports : [
    MoneyPipe ,
    SafeHTMLPipe
  ]
})
export class UtilsModule { }
