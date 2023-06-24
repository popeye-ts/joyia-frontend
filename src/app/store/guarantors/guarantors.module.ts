import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { GuarantorComponent } from './Guarantor/guarantor.component';
import { GuarantorFormComponent } from './GuarantorForm/guarantorform.component';
import { UIModule } from '@ui/ui.module';

@NgModule({
  declarations: [ GuarantorComponent , GuarantorFormComponent ],
  imports: [
    CommonModule ,
    ReactiveFormsModule ,
    DataTablesModule ,
    UIModule
  ]
})
export class GuarantorsModule { }
