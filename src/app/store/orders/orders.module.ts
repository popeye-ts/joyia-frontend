import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select2Module , Select2OptionData } from 'ng2-select2';
import { NgxPrintModule } from 'ngx-print';

import { UIModule } from '@ui/ui.module';
import { DataTablesModule } from 'angular-datatables';
import { FilterComponent} from './filters/filter.component';
import { OrderComponent} from './Order/order.component';
import { OrderDetailComponent } from './OrderDetail/orderDetail.component';
import { InstallmentsComponent } from './OrderDetail/installments/installments.component';
import { SummaryOrderDetailComponent } from './OrderDetail/summary/summaryOrder.component';

//Order Details Components
import { OtherOrdersComponent } from './OrderDetail/otherOrders/otherOrders.component';
import { CLientDetailsComponent } from './OrderDetail/clientDetails/clientDetails.component';
import { GuarantorsDetailComponent } from './OrderDetail/guarantorsDetail/guarantorsDetail.component';
import { ProductsDetailComponent } from './OrderDetail/productsDetail/productsDetail.component';
import { PrintModule } from '@store/print/print.module';
import { OrderFormComponent } from './../orders/OrderForm/orderForm.component';
import { RoutingModule } from './../routing/routing.module';
import { OrderClientStepComponent} from './OrderForm/client/clientStep.component';
import { OrderGuarantorStepComponent} from './OrderForm/guarantors/guarantorsStep.component';
import { OrderProductsStepComponent} from './OrderForm/products/productsStep.component';
import { SelectComponentForOrder } from './OrderForm/SelectComponent/select.component';
import { ConfirmOrderComponent } from './OrderForm/modal/confirmModal.component';
import { ProductsModule } from './../Products/products.module';
import { PendingPaymentComponent } from './PendingPayments/pendingPayment.component';
import { OrderCommentsComponent } from './OrderDetail/comments/comments.component';
import { BatchesComponent } from './OrderDetail/batches/batches.component';
import { WaiversComponent } from './OrderDetail/waivers/waivers.component';

//Cash Order Components
import { CashOrderSearchComponent } from './CashOrder/orderSearch/cashOrderSearch.component.';
import { CashOrderSummaryComponent } from './CashOrder/orderSummary/cashOrderSummary.component';
import { PreviousOrdersComponent } from './CashOrder/previousOrders/previousOrders.component';

import { CashOrderProductsComponent } from './CashOrder/orderproducts/cashOrderProducts.component';
import { CashOrderFormComponent } from './CashOrder/cashOrderForm.component';



//Batch form component
import { BatchFormComponent } from "./BatchForm/batchForm.component";

import { LedgerComponent } from "./Ledger/ledger.component";

//Waivers component
import { LstWaiversComponent } from "./Waivers/waivers.component";

//**************::  Utilities  ::*******************//
import { UtilsModule } from "@utilities/utils.module";


import { WaiverDetailModalComponent } from "./WaiverDetailsModal/waiverDetailModal.component";
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { CompleteOrderLstComponent } from './OrderCompleted/order_completed.component';
import { CashOrderLstComponent } from './LstCashOrders/lstCashOrders.component';
import { CRMComponent } from './OrderDetail/CRM/crm.component';
import { OrderCustomerSelectComponent } from './CashOrder/customer/customer.component';
import { ClientFormModalComponent } from './CashOrder/ClientFormModal/clientformModal.component';
import { OrderCompleteModalComponent } from './CashOrder/orderCompleteModal/orderCompleteModal.component';
import { OrderGuarantorsSelectComponent } from './CashOrder/guarantor/guarantor.component';
import { GuarantorFormModalComponent } from './CashOrder/GuarantorForm/guarantorform.component';
import { OrderStockModalComponent } from './CashOrder/stockModal/stockModal.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [ SummaryOrderDetailComponent ,OrderComponent , OrderFormComponent, OrderDetailComponent , InstallmentsComponent,
    CLientDetailsComponent ,GuarantorsDetailComponent,ProductsDetailComponent, OrderCommentsComponent , GuarantorFormModalComponent , OrderStockModalComponent ,
     OrderClientStepComponent , OrderProductsStepComponent , OrderGuarantorStepComponent  , SelectComponentForOrder , OrderGuarantorsSelectComponent ,
    ConfirmOrderComponent , CashOrderFormComponent , CashOrderSearchComponent , CashOrderSummaryComponent , CashOrderProductsComponent , PendingPaymentComponent , 
    OtherOrdersComponent , FilterComponent , LedgerComponent , BatchesComponent , BatchFormComponent , CashOrderLstComponent ,CRMComponent , OrderCompleteModalComponent , 
    WaiversComponent , PreviousOrdersComponent , LstWaiversComponent , WaiverDetailModalComponent , CompleteOrderLstComponent , OrderCustomerSelectComponent , ClientFormModalComponent],
  imports: [
    CommonModule ,
    ReactiveFormsModule ,
    DataTablesModule  ,
    RoutingModule ,
    ProductsModule ,
    Select2Module ,
    UIModule ,
    NgxPrintModule ,
    PrintModule ,
    UtilsModule,
    NgSelectModule ,
    FormsModule ,
    ConfirmationPopoverModule.forRoot({
         confirmButtonType: 'danger', // set defaults here
         focusButton: 'confirm',
   }),
  ]
})
export class OrdersModule { }
