import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';

import { map, mergeMap, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { State } from '@stateInterface';
import { statsService } from "@services/stats.service";
import { NotifierService } from 'angular-notifier';

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
    LOAD_DASHBOARD_OTHER_STATS_LEFT,LOADED_DASHBOARD_OTHER_STATS_LEFT, LOAD_DASHBOARD_SALES, LOAD_DASHBOARD_ORDERS_COUNT,
  } from "@actionTypes";
import { BestSellersFetched, CardStatsFetched , CategoriesFetched, FetchError, LogsFetched, OrderStatsFetched, PendingPaymentsFetched, ProductsFetched, RecentOrdersFetched, SalesFetched, SummaryStatsFetched} from '../actions/dashboard.actions';
import { getLogs, getPendingPayments, getRecentOrders } from '../selectors/dashboard.selector';


@Injectable()
export class DashboadEffects {
    loadCardStats$ = createEffect(() => this.actions$.pipe(
        ofType(LOAD_DASHBOARD_CARD_STATS),
        mergeMap(() => this._statsService.getCardStats()
        .pipe(
            map(resp => {
                return new CardStatsFetched(resp.data); 
            }),
            catchError(() => of(new FetchError() ))
        )) )
    );
    loadSales$ = createEffect(() => this.actions$.pipe(
      ofType(LOAD_DASHBOARD_SALES),
      mergeMap(() => this._statsService.getSales()
      .pipe(
          map(resp => {
              return new SalesFetched(resp.data); 
          }),
          catchError(() => of(new FetchError() ))
      )) )
    );
    loadOrderStats$ =  createEffect(() => this.actions$.pipe(
      ofType(LOAD_DASHBOARD_ORDERS_COUNT),
      mergeMap(() => this._statsService.getOrderStats()
      .pipe(
          map(resp => {
              return new OrderStatsFetched(resp.data); 
          }),
          catchError(() => of(new FetchError() ))
      )) )
    ); 
    
    loadCategories$  = createEffect(() => this.actions$.pipe(
      ofType(LOAD_DASHBOARD_CATEGORIES),
      mergeMap(() => this._statsService.getCategories()
      .pipe(
          map(resp => {
              return new CategoriesFetched(resp.data); 
          }),
          catchError(() => of(new FetchError() ))
      )) )
    );
    
    loadLogs$ = createEffect(() => this.actions$.pipe(
      ofType(LOAD_DASHBOARD_LOGS),
      withLatestFrom(this.store.select(getLogs)),   
      mergeMap((state) => this._statsService.getLogs(state.pop().filters)
      .pipe(
          map(resp => {
              return new LogsFetched(resp.data); 
          }),
          catchError(() => of(new FetchError() ))
        )) )
    );
    loadPendingPayments$ = createEffect(() => this.actions$.pipe(
      ofType(LOAD_DASHBOARD_PENDING_PAYMENTS),
      withLatestFrom(this.store.select(getPendingPayments)),   
      mergeMap((state) => this._statsService.getPendingPayments(state.pop().filters)
      .pipe(
          map(resp => {
              return new PendingPaymentsFetched(resp.data); 
          }),
          catchError(() => of(new FetchError() ))
        )) )
    )
    loadSummaryStats$ = createEffect(() => this.actions$.pipe(
      ofType(LOAD_DASHBOARD_SUMMARY_STATS),
      mergeMap(() => this._statsService.getSummaryStats()
      .pipe(
          map(resp => {
              return new SummaryStatsFetched(resp.data); 
          }),
          catchError(() => of(new FetchError() ))
      )) )
    );
    loadLatestProducts$ = createEffect(() => this.actions$.pipe(
      ofType(LOAD_DASHBOARD_PRODUCTS),
      mergeMap(() => this._statsService.getLatestProducts()
      .pipe(
          map(resp => {
              return new ProductsFetched(resp.data.map(d=>({product_id : d._id , name : d.product_display_name}))); 
          }),
          catchError(() => of(new FetchError() ))
      )) )
    ); 
    loadBestSellerProducts$ = createEffect(() => this.actions$.pipe(
      ofType(LOAD_DASHBOARD_BEST_SELLERS),
      mergeMap(() => this._statsService.getBestSeller()
      .pipe(
          map(resp => {
              return new BestSellersFetched(resp.data ); 
          }),
          catchError(() => of(new FetchError() ))
      )) )
    );
    
    loadRecentOrders$ = createEffect(() => this.actions$.pipe(
      ofType(LOAD_DASHBOARD_RECENT_ORDERS),
      withLatestFrom(this.store.select(getRecentOrders)),   
      mergeMap((state) => this._statsService.getRecentOrders(state.pop().filters)
      .pipe(
          map(resp => {
              return new RecentOrdersFetched(resp.data); 
          }),
          catchError(() => of(new FetchError() ))
        )) )
    );


  constructor(
    private actions$: Actions,
    private _statsService: statsService ,
    private notifier : NotifierService,
    private store: Store<State>
  ) {
  }
}