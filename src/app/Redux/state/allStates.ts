//This file will be used to export all the interfaces of all the states
//So that we have one place to take interfaces from
import {cashOrderInitialState , CashOrderState}  from './cashOrder.state';
import {ProductState , productInitialState }  from './cashOrderProducts.state';
import { DashboardState, inititalDashboardState } from './dashboard.state';
import {State , initialState}  from './index';
import { InventoryFormState } from './inventoryForm.state';
import {PrintState , PrintInitialState}  from './print.state';

export { CashOrderState , ProductState ,  State , DashboardState , InventoryFormState , cashOrderInitialState , productInitialState , initialState , PrintInitialState , inititalDashboardState  , PrintState};