import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersAssignedComponent } from './orders-assigned/orders-assigned.component';
// import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [OrdersAssignedComponent],
  imports: [
    CommonModule,
    // ReactiveFormsModule,
    FormsModule,
    NgSelectModule

  ]
})
export class ReportsModule { }
