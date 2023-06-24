import { Action } from '@ngrx/store';
import { PrintInitialState , PrintState } from '@stateInterface';
import { PrintActions } from '@actions/print.actions';
import { PRINT_CASH_INVOICE,PRINT_FETCH_DATA ,PRINT_DATA_FETCHED ,PRINTED_CASH_INVOICE } from "@actionTypes";


export function printReducer(state = PrintInitialState , action: PrintActions ): PrintState {
  // console.log("I am print reducer" , state , action );
  switch (action.type) {
    case PRINT_CASH_INVOICE : return   {...state , status : "printing.." } ;
    case PRINT_FETCH_DATA : return   {...state , order_id : action.payload , status : "fetching data.." };
    case PRINT_DATA_FETCHED: 
        let products = action.payload.batches[0].products;
        let total =action.payload.total_paid;
        let discount = action.payload.discount;
        let subTotal = action.payload.total_paid;
        let tax = action.payload.tax;
        let number =  action.payload.order_id
    return {...state , tax : tax , number : number , products : products , total : total , discount : discount , subTotal : subTotal , status : "fetched"};
    case PRINTED_CASH_INVOICE: return {...state , status : "printed"}
    default:
      return state;
  }
}
