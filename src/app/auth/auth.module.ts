import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from '@/auth/routing/routing.module';
import { LoginComponent } from './login/login.component'
import { HttpClientModule } from '@angular/common/http';
import * as jwt_decode from "jwt-decode";
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { customNotifierOptions } from '@store/UI/Toaster/notifier';



// import { AppModule } from '@/app.module';
@NgModule ({
  declarations : [ LoginComponent ],
  imports : [
    CommonModule ,
    FormsModule ,
    NotifierModule.withConfig(customNotifierOptions) ,
    // AppModule ,
    HttpClientModule,
    ReactiveFormsModule ,
    AuthRoutingModule
  ],
  providers: [],
  bootstrap: [LoginComponent]
})
export class AuthModule{

}
