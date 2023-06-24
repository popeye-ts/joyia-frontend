import { Action, createSelector, createFeatureSelector } from '@ngrx/store';
import {State , InventoryFormState } from '@stateInterface';

export const getInventoryForm = createFeatureSelector<State, InventoryFormState>('inventoryForm');