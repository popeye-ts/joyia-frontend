import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from './../UI/ToolTip/tooltip';
import { ReactiveFormsModule  } from '@angular/forms';
import { Select2Module , Select2OptionData } from 'ng2-select2';
import { RoutingModule } from './../routing/routing.module';
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { customNotifierOptions } from "./../UI/Toaster/notifier";
import { MomentModule } from "angular2-moment";
import { DataTablesModule } from 'angular-datatables';
import {ProgressBarModule} from "angular-progress-bar";
import { CalendarModule, DateAdapter } from 'angular-calendar';

import {cashOrdersChartComponent} from './cashOrdersChart/cashOrdersChart.component';
import {bestSellersComponent} from './bestSellers/bestSellers.component';
import {calendarComponent} from './calendar/calendar.component';
import {cardStatsComponent} from './cardStats/cardStats.component';
import {cardStatsSortableComponent} from './cardStatsSortable/cardStatsSortable.component';
import {categoriesComponent} from './categories/categories.component';
import {installmentOrdersChartComponent} from './installmentOrdersChart/installmentOrdersChart.component';
import {logsComponent} from './logs/logs.component';
import {orderFormComponent} from './orderForm/orderForm.component';
import {otherStatsLeftComponent} from './otherStatsLeft/otherStatsLeft.component';
import {otherStatsRightComponent} from './otherStatsRight/otherStatsRight.component';
import {pendingPaymentsComponent} from './pendingPayments/pendingPayments.component';
import {productsComponent} from './products/products.component';
import {recentOrdersComponent} from './recentOrders/recentOrders.component';
import {salesComponent} from './sales/sales.component';
import {summaryStatsComponent} from './summaryStats/summaryStats.component';
import { dashboardComponent } from './dashboardRoot/dashboardRoot.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { UIModule } from '@store/UI/ui.module';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@NgModule({
  declarations: [    cashOrdersChartComponent , bestSellersComponent ,calendarComponent , cardStatsComponent ,cardStatsSortableComponent
       , categoriesComponent , installmentOrdersChartComponent  , orderFormComponent , otherStatsLeftComponent ,otherStatsRightComponent ,logsComponent ,
    pendingPaymentsComponent , productsComponent ,recentOrdersComponent , salesComponent , summaryStatsComponent , dashboardComponent ],
  imports: [
    NotifierModule.withConfig(customNotifierOptions) ,
    CommonModule,
    ReactiveFormsModule ,
    Select2Module ,
    RoutingModule,
    TooltipModule ,
    MomentModule,
    DataTablesModule,
    ProgressBarModule ,
    NgxSkeletonLoaderModule,
    UIModule,
    CalendarModule.forRoot({
      provide: DateAdapter, 
      useFactory: adapterFactory,
    }),
  ],
  exports : [
    dashboardComponent , cardStatsComponent
  ]
})
export class dashboardModule { }
