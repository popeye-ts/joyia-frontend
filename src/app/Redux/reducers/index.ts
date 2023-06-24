import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '@environments/environment';
import { State  , initialState } from '@stateInterface';
import { cashOrderReducer } from './cashOrder.reducer';
import { spinnerReducer } from './spinner.reducer';
import { printReducer } from "./print.reducer";
import { dashboardReducer } from "./dashboard.reducer";
import { inventoryReducer } from './inventory.reducer';
import { productsReducer } from './product.reducer';

export const reducers: ActionReducerMap<State> = {
  cashOrder : cashOrderReducer,
  spinner : spinnerReducer,
  print : printReducer,
  dashboard : dashboardReducer,
  inventoryForm : inventoryReducer,
  products : productsReducer
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
