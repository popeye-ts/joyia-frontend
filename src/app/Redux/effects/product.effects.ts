import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';

import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { productService } from '@services/product.service';
import { LOAD_PRODUCTS, PRODUCTS_LOAD_ERROR } from '@actionTypes';

import {Store} from '@ngrx/store';
import {State } from '@stateInterface';
import { orderService } from '@store/services/order.service';
import { NotifierService } from 'angular-notifier';
import { productsFetchError, productsLoaded } from '../actions/product.actions';

@Injectable()
export class ProductEffects {
 loadProducts$ = createEffect(() => this.actions$.pipe(
    ofType(LOAD_PRODUCTS),
    mergeMap(() => this._productsService.getAll()
      .pipe(
        map(resp => {
          let tempProducts = 
            resp.map((item) => {
                return { ...item } 
              });
          return new productsLoaded( tempProducts); 
        }),
        catchError((err) => of(new productsFetchError(err) ))
    )) )
  ); 
  
  displayError$ = createEffect(()=>this.actions$.pipe(
    ofType(PRODUCTS_LOAD_ERROR) ,
    tap(action =>{
      console.log("Action products error " , action );
      this.notifier.notify("error" , action['error']  );
    })
  ) , { dispatch : false} );

  constructor(
    private actions$: Actions,
    private _productsService: productService ,
    private notifier : NotifierService,
    private _orderService : orderService ,
    private store: Store<State>
  ) {
  }
}