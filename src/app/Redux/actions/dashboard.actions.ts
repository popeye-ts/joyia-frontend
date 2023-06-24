import {Action} from '@ngrx/store';
import { 
    LOAD_DASHBOARD_CARD_STATS,LOADED_DASHBOARD_CARD_STATS,
    LOAD_DASHBOARD_RECENT_ORDERS,LOADED_DASHBOARD_RECENT_ORDERS,CHANGE_DASHBOARD_FILTERS_RECENT_ORDERS,
    LOAD_DASHBOARD_CATEGORIES,LOADED_DASHBOARD_CATEGORIES,
    LOAD_DASHBOARD_LOGS,LOADED_DASHBOARD_LOGS,CHANGE_DASHBOARD_FILTERS_LOGS ,
    LOAD_DASHBOARD_PENDING_PAYMENTS,LOADED_DASHBOARD_PENDING_PAYMENTS, CHANGE_DASHBOARD_FILTERS_PENDING_PAYMENTS,
    LOAD_DASHBOARD_BEST_SELLERS,LOADED_DASHBOARD_BEST_SELLERS, CHANGE_DASHBOARD_FILTERS_BEST_SELLERS,
    LOAD_DASHBOARD_SUMMARY_STATS,LOADED_DASHBOARD_SUMMARY_STATS,
    LOAD_DASHBOARD_PRODUCTS,LOADED_DASHBOARD_PRODUCTS,
    LOAD_DASHBOARD_CARD_STATS_SORTABLE,LOADED_DASHBOARD_CARD_STATS_SORTABLE,
    LOAD_DASHBOARD_OTHER_STATS_LEFT,LOADED_DASHBOARD_OTHER_STATS_LEFT, LOADED_DASHBOARD_DATA_FETCH_ERROR, LOAD_DASHBOARD_SALES, LOADED_DASHBOARD_SALES, LOAD_DASHBOARD_ORDERS_COUNT, LOADED_DASHBOARD_ORDERS_COUNT,
} from "@actionTypes";
import { DashboardState } from '@stateInterface';
import { searchFilters, searchFiltersInitialState , card, recent, log, category, pendingPayment, bestSeller, product, summary, statSortable } from '../state/dashboard.state';


export class FetchSales implements Action {
    readonly type = LOAD_DASHBOARD_SALES;
    constructor() {}
}
export class SalesFetched implements Action {
    readonly type = LOADED_DASHBOARD_SALES;
    constructor(public payload : Array<any>) {}
}
export class FetchOrdersStats implements Action {
    readonly type = LOAD_DASHBOARD_ORDERS_COUNT;
    constructor() {}
}
export class OrderStatsFetched implements Action {
    readonly type = LOADED_DASHBOARD_ORDERS_COUNT;
    constructor(public payload : Array<any>) {}
}

export class FetchCardStats implements Action {
    readonly type = LOAD_DASHBOARD_CARD_STATS;
    constructor() {}
}

export class CardStatsFetched implements Action {
    readonly type = LOADED_DASHBOARD_CARD_STATS;
    constructor(public payload: Array<card> ) {}
}

export class FetchRecentOrders implements Action {
    readonly type = LOAD_DASHBOARD_RECENT_ORDERS;
    constructor() {}
}
export class ChangeFiltersRecentOrders implements Action {
    readonly type = CHANGE_DASHBOARD_FILTERS_RECENT_ORDERS;
    constructor(public payload : searchFilters ) {}
}
export class RecentOrdersFetched implements Action {
    readonly type = LOADED_DASHBOARD_RECENT_ORDERS;
    constructor(public payload: Array<recent> ) {}
}


export class FetchCategories implements Action {
    readonly type = LOAD_DASHBOARD_CATEGORIES;
    constructor() {}
}
export class CategoriesFetched implements Action {
    readonly type = LOADED_DASHBOARD_CATEGORIES;
    constructor(public payload: Array<category> ) {}
}

export class FetchLogs implements Action {
    readonly type = LOAD_DASHBOARD_LOGS;
    constructor() {}
}
export class LogsFetched implements Action {
    readonly type = LOADED_DASHBOARD_LOGS;
    constructor(public payload: Array<log> ) {}
}

export class ChangeFilterLogs implements Action {
    readonly type = CHANGE_DASHBOARD_FILTERS_LOGS;
    constructor(public payload : searchFilters ) {}
}

export class FetchPendingPayments implements Action {
    readonly type = LOAD_DASHBOARD_PENDING_PAYMENTS;
    constructor() {}
}
export class PendingPaymentsFetched implements Action {
    readonly type = LOADED_DASHBOARD_PENDING_PAYMENTS;
    constructor(public payload: Array<pendingPayment> ) {}
}

export class ChangeFilterPendingPayments implements Action {
    readonly type = CHANGE_DASHBOARD_FILTERS_PENDING_PAYMENTS;
    constructor(public payload : searchFilters ) {}
}

export class FetchBestSellers implements Action {
    readonly type = LOAD_DASHBOARD_BEST_SELLERS;
    constructor() {}
}
export class BestSellersFetched implements Action {
    readonly type = LOADED_DASHBOARD_BEST_SELLERS;
    constructor(public payload: Array<bestSeller> ) {}
}

export class ChangeFilterBestSellers implements Action {
    readonly type = CHANGE_DASHBOARD_FILTERS_BEST_SELLERS;
    constructor(public payload : searchFilters ) {}
}

export class FetchSummaryStats implements Action {
    readonly type = LOAD_DASHBOARD_SUMMARY_STATS;
    constructor() {}
}

export class SummaryStatsFetched implements Action {
    readonly type = LOADED_DASHBOARD_SUMMARY_STATS;
    constructor(public payload: Array<summary> ) {}
}

export class ProductsFetched implements Action {
    readonly type = LOADED_DASHBOARD_PRODUCTS;
    constructor(public payload: Array<product> ) {}
}

export class FetchProducts implements Action {
    readonly type = LOAD_DASHBOARD_PRODUCTS;
    constructor() {}
}

export class CardStatsSortableFetched implements Action {
    readonly type = LOADED_DASHBOARD_CARD_STATS_SORTABLE;
    constructor(public payload: Array<statSortable> ) {}
}

export class FetchCardStatsSortable implements Action {
    readonly type = LOAD_DASHBOARD_CARD_STATS_SORTABLE;
    constructor() {}
}
export class FetchError implements Action {
    readonly type = LOADED_DASHBOARD_DATA_FETCH_ERROR;
    //String to search for
    constructor(public error : string = 'Something went wrong while fetching') {        
    }
}

export type DashboardActions = FetchCardStats | CardStatsFetched | FetchRecentOrders | ChangeFiltersRecentOrders | RecentOrdersFetched 
| SalesFetched | FetchSales | CategoriesFetched | LogsFetched | PendingPaymentsFetched | SummaryStatsFetched | ProductsFetched | BestSellersFetched | OrderStatsFetched;