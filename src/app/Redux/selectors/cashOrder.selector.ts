import { Action, createSelector, createFeatureSelector } from '@ngrx/store';
import {State , CashOrderState } from '@stateInterface';

const getCashoOrder = createFeatureSelector<State, CashOrderState>('cashOrder');

export const getAllProducts = createSelector(getCashoOrder, state => state.products);
export const getTotal = createSelector(getCashoOrder, state => state.total);
export const getDiscount = createSelector(getCashoOrder, state => state.discount);
export const getTax = createSelector(getCashoOrder, state => state.tax);
export const getSubTotal = createSelector(getCashoOrder, state => state.subTotal );
export const getSelectedProducts = createSelector(getCashoOrder, state => state.productsSelected);
export const getSpinner = createSelector(getCashoOrder, state => state.spinner);
export const getSearch = createSelector(getCashoOrder, state => state.searchQuery);
export const getCurrentProduct = createSelector(getCashoOrder, state => state.currentProduct);


export const getAllProductsLoaded = createSelector(getCashoOrder, state => state);
export const getOrderCompletionStatus = createSelector(getCashoOrder, state => state.beingAdded);
export const getSelectedClient = createSelector(getCashoOrder, state => state.selectedClient );
export const getSelectedGuarantors = createSelector(getCashoOrder, state => state.selectedGuarantors );
export const getOrderType = createSelector(getCashoOrder, state => state.orderType );

export const getSelectedOrder = createSelector(getCashoOrder, state => state.selectedOrder);

 