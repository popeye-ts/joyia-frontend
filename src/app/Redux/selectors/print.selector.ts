import { Action, createSelector, createFeatureSelector } from '@ngrx/store';
import {State , PrintState } from '@stateInterface';

const getPrint = createFeatureSelector<State, PrintState>('print');

export const getAllProducts = createSelector(getPrint, state => state.products);
export const getPrintState = createSelector(getPrint, state => state);
export const getTotal = createSelector(getPrint, state => state.total);
export const getDiscount = createSelector(getPrint, state => state.discount);
export const getTax = createSelector(getPrint, state => state.tax);
export const getSubTotal = createSelector(getPrint, state => state.subTotal );
export const getOrderNumber = createSelector(getPrint, state => state.number );
export const getPrintStatus = createSelector(getPrint, state => state.status );
export const getId = createSelector(getPrint, state => state.order_id );