import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { TooltipModule } from './UI/ToolTip/tooltip';
import { RoutingModule } from "./routing/routing.module";
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { customNotifierOptions } from "./UI/Toaster/notifier";

import { Select2Module , Select2OptionData } from 'ng2-select2';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MomentModule } from 'angular2-moment';

//To show tree view
import { NestableModule } from 'ngx-nestable';
import {ProgressBarModule} from "angular-progress-bar";


//==================:: Helpers ::=============================//
import { DeviceDetectorService } from 'ngx-device-detector';

//=================]]]]>::User Defined Components::<[[[[[=============//
import { MainComponent } from './main/main.component';

//****************::Sign in Moduele :: ***************//

//****************::Dashboard Module :: **************//
import { dashboardModule } from './dashboard/dashboard.module';
//****************::Product Component::**************//
import { ProductsModule } from './Products/products.module';

//****************::Order Component::****************//


import { ClientsModule} from './clients/clients.module';

import { FinancesModule } from './finances/finances.module';

import { GuarantorsModule} from './guarantors/guarantors.module';

import { InventoryModule } from './Inventory/inventory.module';

import { OrdersModule } from './orders/orders.module';

//***************::Settings Module :: *********************//
import { SettingsModule } from './settings/settings.module';

//***************::Auth service being sjared in whole module ::****************//
import { AuthenticationService } from '@services/authentication.service';

//**************::Login Timeline component ::************//
import { LoginTimelineComponent } from '@store/logintimeline/logintimeline.component';

//**************::Calendar Module :: ***************//
import { CalendarViewModule } from './calendar/calendar.module';

//**************::Modal Module ::*****************//

//*************:: Print Module ::*****************//
import { PrintModule} from '@store/print/print.module';
import { PrintService} from '@services/print.service';
import { PrintLayoutComponent } from '@store/print/print-layout/print-layout.component';
import { InvoiceComponent} from '@store/print/invoice/invoice.component';
import { AlertService } from '@services/alert.sevice';

import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

//**************:: Reports Module :: ***************//
import { ReportsModule } from '@store/reports/reports.module';
import { UIModule } from './UI/ui.module';
import { ScrollService } from './services/scroll.service';
import { KeyPressDistributionService } from './services/keypress-distribution.service';
// import {OrdersApiService} from '../../app/service/orders-api.service';
import { StoreEventService } from './services/communication.service';
//Pipes
@NgModule({
  declarations: [
    MainComponent ,
    LoginTimelineComponent,
    PrintLayoutComponent,
    InvoiceComponent ,    
    ],
  imports: [
    NotifierModule.withConfig(customNotifierOptions) ,
    Select2Module ,
    FormsModule ,
    ReactiveFormsModule ,
    RoutingModule ,
    TooltipModule ,
    NgxSkeletonLoaderModule,
    MomentModule ,
    ProgressBarModule,
    CommonModule ,
    NestableModule,
    // OrdersApiService,

    ProductsModule ,
    FinancesModule ,
    ClientsModule ,
    OrdersModule ,
    InventoryModule ,
    GuarantorsModule,
    dashboardModule,
    SettingsModule,
    CalendarViewModule,
    PrintModule,
    UIModule ,
    ConfirmationPopoverModule.forRoot({
         confirmButtonType: 'danger', // set defaults here
         focusButton: 'confirm',
   }),
   ReportsModule
  ],
  providers: [
    AuthenticationService,
    DeviceDetectorService,
    ScrollService,
    PrintService,
    AlertService,
    KeyPressDistributionService ,
    StoreEventService 
  ],
  bootstrap: [MainComponent],
  exports : []
})
export class StoreModule { }
