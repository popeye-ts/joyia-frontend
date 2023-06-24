import { Action } from '@ngrx/store';
import { productInitialState, ProductState } from '../state/index';
import { ProductActions } from '@actions/product.actions';
import { LOAD_PRODUCTS,PRODUCTS_LOADED ,PRODUCTS_LOAD_ERROR  } from "@actionTypes";


export function productsReducer(state : Array<ProductState>= [] , action: ProductActions ): Array<ProductState> {
  // console.log("I am product reducer" , state , action );
  switch (action.type) {
    case PRODUCTS_LOADED : return  [...action.payload];
    default:
      return state;
  }
}
