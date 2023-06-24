import { NgModule } from '@angular/core';
import {  UIRouterModule } from "@uirouter/angular";
import { Transition } from "@uirouter/core";

//================= User Defined Modules ========================//


//=================]]]]>::User Defined Components::<[[[[[=============//

import { MainComponent } from './../main/main.component';

//****************::Product Component::**************//
import { ProductComponent } from './../Products/Product/product.component';
import { ProductDetailComponent } from './../Products/ProductDetail/productDetail.component';
import { ProductFormComponent } from   './../Products/ProductForm/productForm.component';
import { CategoryComponent } from   '@store/Products/Category/category.component';

//****************::Order Component::****************//
import { OrderDetailComponent  } from './../orders/OrderDetail/orderDetail.component';
import { OrderFormComponent } from './../orders/OrderForm/orderForm.component';
import { ClientComponent} from './../clients/Client/client.component';
import { ClientFormComponent } from "@store/clients/ClientForm/clientform.component";
import { FinanceComponent} from './../finances/Finance/finance.component';
import { AccountTypeComponent} from './../finances/AccountType/accountType.component';
import { AccountComponent} from './../finances/Account/account.component';
import { GuarantorComponent} from './../guarantors/Guarantor/guarantor.component';
import { GuarantorFormComponent } from "@store/guarantors/GuarantorForm/guarantorform.component";
import { InventoryComponent} from '@store/Inventory/Inventory/inventory.component';
import { OrderComponent} from './../orders/Order/order.component';
import { CompleteOrderLstComponent } from './../orders/OrderCompleted/order_completed.component';

import { LstWaiversComponent } from './../orders/Waivers/waivers.component';
import { Page404Component} from '@/Page404/Page404.component';
import { CashOrderFormComponent } from './../orders/CashOrder/cashOrderForm.component';
import { PendingPaymentComponent } from './../orders/PendingPayments/pendingPayment.component';
import { BatchFormComponent } from './../orders/BatchForm/batchForm.component';

//****************::DAshboard Component :: *****************//
import { dashboardComponent } from './../dashboard/dashboardRoot/dashboardRoot.component';

//****************::Settings Modules ::**********************//
import { UsersComponent } from '@settings/users/users.component';

//****************::LoginTimeline Component::*********************//
import { LoginTimelineComponent } from '@store/logintimeline/logintimeline.component';

//***************::Calendar Component :: ******************************//
import { CalendarComponent } from '@store/calendar/Calendar/calendar.component';

//**************:: Print Components :: *******************************//
import {InvoiceComponent} from '@store/print/invoice/invoice.component';
import {PrintLayoutComponent} from '@store/print/print-layout/print-layout.component';
import { InventoryFormComponent } from '@store/Inventory/InventoryForm/inventoryForm.component';

//**************:: Reports Components :: ****************************//
import { OrdersAssignedComponent } from '@store/reports/orders-assigned/orders-assigned.component';
import { CashOrderLstComponent } from '@store/orders/LstCashOrders/lstCashOrders.component';
import { SessionsLstComponent } from '@store/Inventory/Sessions/sessions.component';
import { SessionDetailComponent } from '@store/Inventory/SessionDetail/sessionDetail.component';
import { TaggedFinanceComponent } from '@store/finances/TaggedFinance/taggedFinance.component';
import { ProfileFormComponent } from '@store/settings/profile-form/profileForm.component';
 
//********* States which are protected from general public  ***************//
const STATES  = [

  {
    name : 'store.productdetail' ,
    url : '/productDetail/:id' ,
    component : ProductDetailComponent,
    resolve : [
      {
        token : "id",
        deps : [Transition] ,
        resolveFn : resolveFunc
      }
    ]
  },
  {
    name : 'store.productForm' ,
    url : '/productForm/:id' ,
    component : ProductFormComponent,
    params: {
        id : { squash: true, value: null },
    }
  }
    ,{
      name : 'store.product' ,
      url : '/product' ,
      component : ProductComponent
    },
    {
      name : 'store.category' ,
      url : '/category' ,
      component : CategoryComponent
    },
    {
      name : 'store.client' ,
      url : '/client' ,
      component : ClientComponent
    } ,
    {
      name : 'store.guarantor' ,
      url : '/guarantor' ,
      component : GuarantorComponent
    } ,
    {
      name : 'store.waivers' ,
      url : '/waivers' ,
      component : LstWaiversComponent
    } ,
    {
      name : 'store.finance' ,
      url : '/finance' ,
      component : FinanceComponent
    } ,
    {
      name : 'store.taggedFinance' ,
      url : '/tagged-finance' ,
      component : TaggedFinanceComponent
    } ,
    {
      name : 'store.inventory' ,
      url : '/inventory' ,
      component : InventoryComponent
    } ,
    {
      name : 'store.inventoryform' ,
      url : '/inventoryform/:id' ,
      component : InventoryFormComponent,
      params: {
        id : { squash: true, value: null },
      }
    } ,{      
      name : 'store.sessionlst' ,
      url : '/session-list' ,
      component : SessionsLstComponent
    },
    {
      
      name : 'store.sessiondetail' ,
      url : '/session-form/:id' ,
      component : SessionDetailComponent,
      params: {
            id : { squash: true, value: null },
      }
    },
    {
      name : 'store.order' ,
      url : '/order' ,
      component : OrderComponent
    } ,
    {
      name : 'store.order_completed' ,
      url : '/orders_completed' ,
      component : CompleteOrderLstComponent
    } ,
    {
      name : 'store.cash_order' ,
      url : '/cash_orders' ,
      component : CashOrderLstComponent
    },
    {
      name : 'store.orderdetail' ,
      url : '/orderDetail/:id' ,
      component : OrderDetailComponent ,
      resolve : [
        {
          token : "id",
          deps : [Transition] ,
          resolveFn : resolveOrderDetailFunc
        }
      ]
    } ,
    {
      name : 'store.batchForm' ,
      url : '/batchForm/:id' ,
      component : BatchFormComponent ,
      resolve : [
        {
          token : "id",
          deps : [Transition] ,
          resolveFn : resolveBatchFormFunc
        }
      ]
    } ,
    {
      name : 'store.clientform' ,
      url : '/clientform/:id' ,
      component : ClientFormComponent ,
      params: {
            id : { squash: true, value: null },
      }
    },{
      name : 'store.guarantorform' ,
      url : '/guarantorform/:id' ,
      component : GuarantorFormComponent ,
      params: {
            id : { squash: true, value: null },
      }
    },
    {
      name : 'store.orderform' ,
      url : '/orderForm' ,
      component : OrderFormComponent
    },
    {
      name : 'store.pendingPayment' ,
      url : '/pendingPayments' ,
      component : PendingPaymentComponent
    },
    {
      name : 'store.dashboard',
      url : '/dashboard',
      component: dashboardComponent

    },
    {
      name : 'store.cashorder',
      url : '/cashorder' ,
      component : CashOrderFormComponent
    },
    {
      name : 'store.userSettings',
      url : '/userSettings' ,
      component : UsersComponent
    },
    {
      name : 'store.account',
      url : '/accounts' ,
      component : AccountComponent
    },
    {
      name : 'store.accountType',
      url : '/accountTypes' ,
      component : AccountTypeComponent
    },
    {
      name : 'store.logintimeline',
      url : '/logintimeline' ,
      component : LoginTimelineComponent
    },
    {
      name : 'store.calendar-component',
      url : '/calendar' ,
      component : CalendarComponent
    },{
      name : 'store.profile',
      url : '/profile' ,
      component : ProfileFormComponent
    },
    {
      name : 'store' ,
      url: '',
      component : MainComponent,
      redirectTo: 'store.dashboard',
      children : [
        {
          path : '',
          component: PrintLayoutComponent,
            // children: [
          //   { path: 'invoice/:invoiceIds', component: InvoiceComponent }
          // ]
        }
      ]
    },
    {
      name : 'store.landing',
      url : '',
      component: dashboardComponent
    },
    {
      name: 'store.print',
      url: '',
      component: PrintLayoutComponent,
      children: [
        { path: 'invoice/:invoiceIds', component: InvoiceComponent }
      ]
    },
    {
      name : 'store.reports-orders-assigned' ,
      url : '/orders-assigned' ,
      component : OrdersAssignedComponent
    }
  ];
@NgModule({
  imports : [UIRouterModule.forChild({states : STATES })] ,
  exports : [ UIRouterModule ] ,
  declarations : []
})
export class RoutingModule{}

export function resolveFunc(trans : Transition ){
        return trans.params().id
}
export function resolveOrderDetailFunc(trans : Transition ){
        return trans.params().id
}
export function resolveBatchFormFunc(trans : Transition ){
        return trans.params().id
}
