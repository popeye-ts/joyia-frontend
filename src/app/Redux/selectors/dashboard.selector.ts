import { Action, createSelector, createFeatureSelector } from '@ngrx/store';
import {State , DashboardState } from '@stateInterface';

const getDashboardState = createFeatureSelector<State, DashboardState>('dashboard');

export const getCardStats = createSelector(getDashboardState, state => state.cardStats);
export const getSales = createSelector(getDashboardState, state => state.sales);
export const getRecentOrders = createSelector(getDashboardState, state => state.recentOrders);

export const getCategories = createSelector(getDashboardState, state => state.categories);
export const getLogs = createSelector(getDashboardState, state => state.logs );
export const getPendingPayments = createSelector(getDashboardState, state => state.pendingPayments);

export const getBestSelllers = createSelector(getDashboardState, state => state.bestSellers);
export const getSummaryStats = createSelector(getDashboardState, state => state.summaryStats);
export const getProducts = createSelector(getDashboardState, state => state.products);

export const getCardStatsSortable = createSelector(getDashboardState, state => state.cardStatsSortable);
export const getCashOrderCharts = createSelector(getDashboardState, state => state.cashOrdersChart);
export const getInstallmentOrdersChart = createSelector(getDashboardState, state => state.installmentOrdersChart);

export const getOrderForm = createSelector(getDashboardState, state => state.orderForm);
export const getOtherStatsRight = createSelector(getDashboardState, state => state.otherStatsRight);
