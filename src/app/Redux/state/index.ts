import { CashOrderState , cashOrderInitialState } from './cashOrder.state';
import { DashboardState, inititalDashboardState } from './dashboard.state';
import { inititalInventoryFormState, InventoryFormState } from './inventoryForm.state';
import { PrintState , PrintInitialState  } from "./print.state";

export interface ProductState {
    _id: string ,
    product_display_name :  string ,
    price : number ,
    quantity : number ,
    quantity_available : number ,
    image : string [],
    categories : { name : string, icon : string}[] ,
    sku : String ,
    other_info : {
        model :  String ,
        company : String ,
        colors_available : String [] ,
        inventory_type : "Barcoded" | "Non Barcoded" ,
    },
}

export const productInitialState: ProductState = {
    _id: '-1' ,
    product_display_name :  '' ,
    price : 0 ,
    quantity : 0 ,
    quantity_available : 0 ,
    image : [],
    categories : [],
    sku : '' ,
    other_info : {
        model : '',
        company : '',
        colors_available : [] ,
        inventory_type : 'Barcoded' ,
    },
}
interface State {
    cashOrder: CashOrderState ,
    print : PrintState ,
    spinner:  boolean ,
    dashboard : DashboardState,
    inventoryForm : InventoryFormState,
    products : Array <ProductState>
}
const initialState: State = {
    cashOrder : cashOrderInitialState,
    print : PrintInitialState,
    spinner : false ,
    dashboard : inititalDashboardState,
    inventoryForm : inititalInventoryFormState,
    products : []
}

export { State , initialState };