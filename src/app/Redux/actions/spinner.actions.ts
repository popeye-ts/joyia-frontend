import {Action} from '@ngrx/store';
import { SHOW_SPINNER , HIDE_SPINNER } from "@actionTypes";


export class showSpinner implements Action {
    readonly type = SHOW_SPINNER;
}

export class hideSpinner implements Action {
    readonly type = HIDE_SPINNER ;
}

export type SpinnerActions = showSpinner | hideSpinner;