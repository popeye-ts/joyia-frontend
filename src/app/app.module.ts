import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '@environments/environment';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

//Animations module
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule  , HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { MainRoutingModule } from "@/routing/routing.module";
import { Select2Module , Select2OptionData } from 'ng2-select2';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MomentModule } from 'angular2-moment';
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { ProgressBarModule } from "angular-progress-bar";

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = {  url: environment.socketOptions.url, options: environment.socketOptions.options };

//***************::Helpers ::***************************//
import { JwtInterceptor } from "@/helpers/jwt.interceptor";

//***************::Notifier options :: *****************//
import { customNotifierOptions } from "./store/UI/Toaster/notifier";

//***************:: Landing Component :: ***************//
import { LandingComponent } from "./landing/landing.component";


//***************:: SErvices ::************************//
import { RootAuthenticationService } from "./services/rootauthentication.service";

//****************::Invalid url Module ::**************//
import { Page404Component} from './Page404/Page404.component';

///Module Specific
import {DatePipe} from '@angular/common';

//*****************:: QR CODE  ::**********************//
import { NgQrScannerModule } from 'ngx-qr'; //scanner
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

//**************:: Redux Store ::*********************//
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from '@reducers/index';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { CashOrderEffects , DashboadEffects , ProductEffects} from '@/Redux/effects/index.effects';
import { InventoryEffects } from './Redux/effects/inventory.effect';
// import {OrdersApiService} from './service/orders-api.service'

@NgModule({
  declarations: [
    LandingComponent ,
    Page404Component
    ],
  imports: [
    BrowserAnimationsModule,
    NotifierModule.withConfig(customNotifierOptions) ,
    BrowserModule,
    Select2Module ,
    // OrdersApiService,
    HttpClientModule ,
    FormsModule ,
    ReactiveFormsModule ,
    MainRoutingModule ,
    NgxSkeletonLoaderModule,
    MomentModule ,
    ProgressBarModule,
    NgQrScannerModule ,
    NgxQRCodeModule ,
    SocketIoModule.forRoot(config),
    StoreModule.forRoot(reducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : [] ,
    EffectsModule.forRoot([CashOrderEffects , DashboadEffects , ProductEffects , InventoryEffects]) ,

  ],
  providers: [
    { provide : HTTP_INTERCEPTORS , useClass : JwtInterceptor , multi : true },
    DatePipe
  ],
  bootstrap: [LandingComponent]
})
export class AppModule { }
