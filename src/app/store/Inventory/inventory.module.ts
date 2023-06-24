import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { InventoryComponent} from './Inventory/inventory.component';
import { DumpInventoryComponent } from "./ModalDumpInventory/dumpinventory.component";
import { Select2Module  } from 'ng2-select2';
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { customNotifierOptions } from "./../UI/Toaster/notifier";
import { TooltipModule } from './../UI/ToolTip/tooltip';
import { RoutingModule } from '@store/routing/routing.module';
import { UIModule } from '@ui/ui.module';

//****** Inventory Form Components *******// 
import { InventoryFormComponent } from './InventoryForm/inventoryForm.component';
import { SessionDetailComponent } from './SessionDetail/sessionDetail.component';
import { SessionsLstComponent } from './Sessions/sessions.component';
import { InventorySearchComponent } from './InventoryForm/productSearch/productSearch.component.';
import { InventorySummaryComponent } from './InventoryForm/inventorySummary/inventorySummary.component';
import { InventoryProductsComponent } from './InventoryForm/inventoryproducts/inventoryProducts.component';
import { UtilsModule } from '@store/utils/utils.module';
import { inventoryDetailModalComponent } from './InventoryDetailsModal/inventoryDetailModal.component';


@NgModule({
  declarations: [ InventoryComponent  , inventoryDetailModalComponent , DumpInventoryComponent , InventoryFormComponent , SessionDetailComponent , SessionsLstComponent , InventoryProductsComponent ,InventorySummaryComponent , InventorySearchComponent ],
  imports: [
    CommonModule ,
    ReactiveFormsModule,
    DataTablesModule ,
    Select2Module,
    RoutingModule,
    NotifierModule.withConfig(customNotifierOptions),
    TooltipModule,
    UIModule,
    UtilsModule ,
    FormsModule 
  ]
})
export class InventoryModule { }
