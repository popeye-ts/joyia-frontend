import {Action} from '@ngrx/store';
import { PRINT_CASH_INVOICE,PRINT_FETCH_DATA ,PRINT_DATA_FETCHED ,PRINTED_CASH_INVOICE , PRINT_DATA_FETCH_ERROR } from "@actionTypes";


export class printing implements Action {
    readonly type = PRINT_CASH_INVOICE;
    public payload : string ;
    constructor(data = ""){
        this.payload =  data;
    }
}

export class printed implements Action {
    readonly type = PRINTED_CASH_INVOICE ;
}

export class fetching implements Action {
    readonly type = PRINT_FETCH_DATA ;
    public payload : string;
    constructor(data = ""){
        this.payload =  data;
    }
}

export class fetched implements Action {
    readonly type = PRINT_DATA_FETCHED ;
    public payload : any ;
    constructor(data = ""){
        this.payload =  data;
    }
}

export class fetchError implements Action {
    readonly type = PRINT_DATA_FETCH_ERROR ; 
    public payload : any ;
    constructor(error = ""){
        this.payload = error;
    }
}


export type PrintActions = printing | printed | fetching | fetched | fetchError;