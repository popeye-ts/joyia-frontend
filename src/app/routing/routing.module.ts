import { NgModule } from '@angular/core';
import {  UIRouterModule  } from "@uirouter/angular";
import { Transition } from "@uirouter/core";

//================= User Defined Modules ========================//
// import { AuthModule }  from '@auth/auth.module';
// import { StoreModule } from '@store/store.module';

//=================]]]]>::User Defined Components::<[[[[[=============//

import { Page404Component} from '@/Page404/Page404.component';

import { LandingComponent } from '@/landing/landing.component';

const states = [
  {
    name : 'store.**' ,
    url : '/store' ,
    loadChildren :() => import('@store/store.module').then( result => result.StoreModule)
  },
  {
    name : 'login.**' ,
    url : '#login' ,
    loadChildren :() => import('@/auth/auth.module').then( result => result.AuthModule)
  } ,
  {
    name : 'auth' ,
    url : '/' ,
    loadChildren :() => import('@/auth/auth.module').then( result => result.AuthModule)
  }
]
@NgModule({
  imports : [UIRouterModule.forRoot({states : states , useHash : true })] ,
  exports : [ UIRouterModule ] ,
  declarations : []
})
export class MainRoutingModule{}
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
