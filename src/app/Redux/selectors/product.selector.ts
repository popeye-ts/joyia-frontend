import { Action, createSelector, createFeatureSelector } from '@ngrx/store';
import {State , CashOrderState } from '@stateInterface';

export const getProducts = createFeatureSelector<State, CashOrderState>('products');