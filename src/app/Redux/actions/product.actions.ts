import {Action} from '@ngrx/store';
import { LOAD_PRODUCTS,PRODUCTS_LOADED ,PRODUCTS_LOAD_ERROR  } from "@actionTypes";
import { ProductState } from '../state';


export class loadProducts implements Action {
    readonly type = LOAD_PRODUCTS;
}

export class productsLoaded implements Action {
    readonly type = PRODUCTS_LOADED ;
    constructor(public payload : Array<ProductState> ){}
}

export class productsFetchError implements Action {
    readonly type = PRODUCTS_LOAD_ERROR ; 
    payload : any ;
    constructor(error : any ){
        this.payload = error;
    }
}


export type ProductActions = loadProducts | productsLoaded | productsFetchError;