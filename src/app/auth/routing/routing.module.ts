import { NgModule } from '@angular/core';
import {  UIRouterModule } from "@uirouter/angular";
import { Transition } from "@uirouter/core";

//================= User Defined Modules ========================//
import { LoginComponent } from '@/auth/login/login.component';

//********* States which are protected from general public  ***************//
const STATES  = [

  {
    name : 'login' ,
    url : '' ,
    component : LoginComponent,
  }

  ];
@NgModule({
  imports : [UIRouterModule.forChild({states : STATES })] ,
  exports : [ UIRouterModule ] ,
  declarations : []
})
export class AuthRoutingModule{}
/*
const DASHBOARD_ROUTES  = [
];
const PRODUCT_ROUTES  = [
  {
    path : 'product' ,
    component : ProductComponent
  },
  {
    path : 'product:id' ,
    component : ProductDetailComponent
  },
  {
    path : 'productForm',
    component : ProductFormComponent
  },
  {
    path : 'productForm:id',
    component : ProductFormComponent
  }
];
const FINANCE_ROUTES  = [
  {
    path : 'finance' ,
    component : FinanceComponent
  }
] ;
const INVENTORY_ROUTES  = [
  {
    path : 'inventory',
    component : InventoryComponent
  }
];
const ORDER_ROUTES = [
  {
    path : 'order' ,
    component : OrderComponent
  },
  {
    path : 'order:id' ,
    component : OrderDetailComponent
  },
  {
    path : 'client' ,
    component : ClientComponent
  },
  {
    path : 'guarantor' ,
    component : GuarantorComponent
  }
];
const REPORT_ROUTES  = [

];

const PUBLIC_ROUTES = [
  //{ path: 'sign-in', component: SignInComponent },

];

export const ROUTES = [
  {
    path: '',
    component : MainComponent
  },
  {
    path: 'product',
    component: ProductComponent,
    children: PRODUCT_ROUTES
  },
  {
    path: 'finance',
    component: FinanceComponent,
    children: FINANCE_ROUTES
  },
  {
    path: 'inventory',
    component: InventoryComponent,
    children: INVENTORY_ROUTES
  },
  {
    path: 'order',
    component: OrderComponent,
    children: ORDER_ROUTES
  } ,
  {
    path: 'inventory',
    component: InventoryComponent,
    children: INVENTORY_ROUTES
  },
  {
    path: '**',
    component: Page404Component,
  }
];
*/
