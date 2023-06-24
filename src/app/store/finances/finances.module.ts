import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FinanceComponent } from './Finance/finance.component';
import { AccountComponent } from './Account/account.component';
import { AccountTypeComponent } from './AccountType/accountType.component';
import { AccountFormComponent } from "./AccountForm/accountForm.component";
import { FinanceFilterComponent } from "./Filters/filter.component";
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { UIModule } from '@ui/ui.module';

//To show tree view
import { NestableModule } from 'ngx-nestable';
import { Select2Module , Select2OptionData } from 'ng2-select2';
import { TaggedFinanceComponent } from './TaggedFinance/taggedFinance.component';

@NgModule({
  declarations: [ FinanceComponent , AccountComponent , AccountTypeComponent , AccountFormComponent  , FinanceFilterComponent , TaggedFinanceComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule ,
    UIModule ,
    NestableModule ,
    Select2Module,
    FormsModule
  ],
  // entryComponents : [AccountRowEditorComponent]
})
export class FinancesModule { }
