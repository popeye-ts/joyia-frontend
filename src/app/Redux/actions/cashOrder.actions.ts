import {Action} from '@ngrx/store';
import { ADD_PRODUCT, REMOVE_PRODUCT, PRODUCTS_BEING_FETCHED, COMPLETE_ORDER, EMPTY_CART , 
    PRODUCTS_FETCH_SUCCESS , PRODUCTS_FETCH_ERROR , INCREASE_QUANTITY , DECREASE_QUANTITY , CALCULATE_SUMMARY , 
    SUBMIT_ORDER , SUBMIT_ORDER_ERROR , CATEGORY_CHANGED , SEARCH_TEXT, FILTERS_CHANGED, CHANGE_RECIEVED_AMOUNT, CHANGE_ORDER_TYPE, CHANGE_CLIENT, CHANGE_ORDER_MARKUP, CHANGE_ORDER_DISCOUNT, CHANGE_GUARANTOR1, CHANGE_GUARANTOR2, SET_CURRENT_PRODUCT, SELECT_INVENTORY_ITEMS, CHANGE_GUARANTOR, SELECT_ORDER } from "@actionTypes";
import { ProductState} from '@stateInterface';
import { searchFilters, searchFiltersInitialState } from '../state/cashOrder.state';


export class AddProduct implements Action {
    readonly type = ADD_PRODUCT;
    constructor(public payload: ProductState) {}
}

export class RemoveProduct implements Action {
    readonly type = REMOVE_PRODUCT;
    //id of product
    constructor(public payload: string) {}
}

export class ClearCart implements Action {
    readonly type = EMPTY_CART;
}

export class SearchProducts implements Action {
    readonly type = PRODUCTS_BEING_FETCHED;
    //String to search for
    constructor(public payload: searchFilters = searchFiltersInitialState) {
        
    }
}

export class SearchResultsSuccess implements Action {
    readonly type = PRODUCTS_FETCH_SUCCESS;
    //Products in the form of payload
    constructor(public payload ) {
        
    }
}

export class SearchError implements Action {
    readonly type = PRODUCTS_FETCH_ERROR;
    //String to search for
    constructor(public error : string = 'Something went wrong while fetching') {        
    }
}

export class QuantityIncreased implements Action {
    readonly type = INCREASE_QUANTITY ;
    //We will have product id to increase quantity
    constructor(public product_id ) {
    
    }
}

export class QuantityDecreased implements Action {
    readonly type = DECREASE_QUANTITY ;
    //We will have product id to decrease quantity
    constructor(public product_id ) {

    }
}

export class RecievedAmountChanged  implements Action {    
    readonly type = CHANGE_RECIEVED_AMOUNT ;
    //We will have product id and changed recieved amount 
    constructor(public payload ) {

    }
}
export class CalculateSummary implements Action {
    readonly type = CALCULATE_SUMMARY ;
    //We will have product id to decrease quantity
    constructor() {

    }
}

export class SubmitOrder implements Action {
    readonly type = SUBMIT_ORDER ;
    data : any ;
    //Request to complete order
    constructor(data) {
        this.data = data;
    }
}

export class CompleteOrder implements Action {
    readonly type = COMPLETE_ORDER ;
    //Request to complete order
    constructor(public message = '') {

    }
}
export class SubmitError implements Action {
    readonly type = SUBMIT_ORDER_ERROR ;
    public error = '';
    //Request to complete order
    constructor(error = '') {
        this.error = error
    }
}
export class CategoryChanged implements Action {
    readonly type = CATEGORY_CHANGED ;
    public payload = '';
    constructor(payload) {
        this.payload = payload;
    }
}
export class SearchByText implements Action {
    readonly type = SEARCH_TEXT ;
    public payload = '';
    constructor(payload = '') {
        this.payload = payload;
    }
}
export class ApplyFilters implements Action {
    readonly type = FILTERS_CHANGED;
    constructor() {        
    }
}
export class ChangeOrderType implements Action {
    readonly type = CHANGE_ORDER_TYPE;
    constructor(public payload : string ) {        
    }
}
export class ChangeClient implements Action {
    readonly type = CHANGE_CLIENT;
    constructor(public payload = null ) {        
    }
}
export class ChangeOrderMarkup implements Action {
    readonly type = CHANGE_ORDER_MARKUP;
    constructor(public payload) {        
    }
}
export class ChangeOrderDiscount implements Action {
    readonly type = CHANGE_ORDER_DISCOUNT;
    constructor(public payload) {        
    }
}
export class ChangeGuarantor implements Action {
    readonly type = CHANGE_GUARANTOR;
    constructor(public id , public payload) {        
    }
}
export class ChangeGuarantor1 implements Action {
    readonly type = CHANGE_GUARANTOR1;
    constructor(public payload) {        
    }
}
export class ChangeGuarantor2 implements Action {
    readonly type = CHANGE_GUARANTOR2;
    constructor(public payload) {        
    }
}
export class ChangeCurrentProduct implements Action {
    readonly type = SET_CURRENT_PRODUCT;
    constructor(public payload) {        
    }
}
export class SelectInventoryItems implements Action {
    readonly type = SELECT_INVENTORY_ITEMS;
    constructor(public payload) {        
    }
}
export class SelectOrder implements Action {
    readonly type = SELECT_ORDER;
    constructor(public payload) {        
    }
}


export type CashOrderActions = 
AddProduct | RemoveProduct | ClearCart | SearchProducts | CompleteOrder | ChangeOrderDiscount | ChangeGuarantor1 | ChangeGuarantor2 | SelectInventoryItems |
SearchResultsSuccess | SearchError | QuantityIncreased | QuantityDecreased | RecievedAmountChanged | ChangeOrderMarkup | ChangeCurrentProduct |
CalculateSummary | SubmitOrder | SubmitError | CategoryChanged | SearchByText | ApplyFilters | ChangeOrderType | ChangeClient | ChangeGuarantor | SelectOrder;