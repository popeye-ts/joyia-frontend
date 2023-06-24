import {Action} from '@ngrx/store';
import { INVENTORY_FORM_ADD_ITEM , INVENTORY_FORM_BARCODE_ADD, INVENTORY_FORM_BARCODE_REMOVE, INVENTORY_FORM_BARCODE_SCANNED, INVENTORY_FORM_CHANGE_BARCODE, INVENTORY_FORM_CHANGE_EAN, INVENTORY_FORM_CHANGE_QUANTITY, INVENTORY_FORM_ITEM_SELECTED, INVENTORY_FORM_KEY_PRESS, INVENTORY_FORM_PRODUCTS_ADD, INVENTORY_FORM_PRODUCT_CHANGE, INVENTORY_FORM_REMOVE_ITEM, INVENTORY_FORM_RESET } from "@actionTypes";
import { DashboardState } from '@stateInterface';
import { inventoryItem , stockItem } from '../state/inventoryForm.state';


export class AddInventoyItem implements Action {
    readonly type = INVENTORY_FORM_ADD_ITEM;
    constructor(public payload : any ) {}
}

export class RemoveInventoryItem implements Action {
    readonly type = INVENTORY_FORM_REMOVE_ITEM;
    constructor(public payload : any ) {} //id of item
}

export class BarcodeScanned implements Action {
    readonly type = INVENTORY_FORM_BARCODE_SCANNED;
    constructor(public payload : string ) {} //barcode of item
}

export class ChangeQuantity implements Action {
    readonly type = INVENTORY_FORM_CHANGE_QUANTITY;
    constructor(public payload : number ) {} //quantity of item
}

export class AddInventoryProducts implements Action {
    readonly type = INVENTORY_FORM_PRODUCTS_ADD;
    constructor(public payload : any[] ) {} 
}

export class deleteBarcode implements Action {
    readonly type = INVENTORY_FORM_BARCODE_REMOVE;
    constructor(public payload : any ) {} 
}

export class addBarcode implements Action {
    readonly type = INVENTORY_FORM_BARCODE_ADD;
    constructor(public payload : any ) {} 
}

export class changeBarcode implements Action {
    readonly type = INVENTORY_FORM_CHANGE_BARCODE;
    constructor(public payload : any ) {} 
}

export class changeEAN implements Action {
    readonly type = INVENTORY_FORM_CHANGE_EAN;
    constructor(public payload : any ) {} 
}
export class keyPress implements Action {
    readonly type = INVENTORY_FORM_KEY_PRESS;
    constructor(public payload : any ) {} 
}
export class resetInventoryForm implements Action {
    readonly type = INVENTORY_FORM_RESET;
    constructor( ) {} 
}

export class changeSelected implements Action {
    readonly type = INVENTORY_FORM_ITEM_SELECTED;
    constructor(public payload : any ) {} 
}

export class changeProduct implements Action {
    readonly type = INVENTORY_FORM_PRODUCT_CHANGE;
    constructor(public payload : any ) {} 
}



export type InventoryActions = AddInventoyItem | RemoveInventoryItem | BarcodeScanned | ChangeQuantity | AddInventoryProducts | deleteBarcode | changeBarcode | changeEAN | addBarcode | keyPress | resetInventoryForm | changeSelected | changeProduct;