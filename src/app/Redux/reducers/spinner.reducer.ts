import { Action } from '@ngrx/store';
import {SHOW_SPINNER , HIDE_SPINNER } from '@actionTypes';
import {SpinnerActions} from '@actions/spinner.actions';

export function spinnerReducer(state = false, action: SpinnerActions ): boolean {
  switch (action.type) {
    case SHOW_SPINNER : return   true ;
    case HIDE_SPINNER : return   false;
    default:
      return state;
  }
}
