import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';

import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { INVENTORY_FORM_CHANGE_EAN } from '@actionTypes';

import {Store} from '@ngrx/store';
import {State } from '@stateInterface';
import { orderService } from '@store/services/order.service';
import { NotifierService } from 'angular-notifier';
import { productsFetchError, productsLoaded } from '../actions/product.actions';
import { productService } from '@store/services/product.service';
import { changeEAN } from '../actions/inventory.actions';


@Injectable()
export class InventoryEffects {
//  eanChsanged$ = createEffect(() => this.actions$.pipe(
    // ofType(INVENTORY_FORM_CHANGE_EAN)
    // .map( action: changeEAN) => action.payload )
    // // .concatMap( payload => [
    // mergeMap((payload : any  , index : any ) => {
    //     console.log("I am in inventoy effect " , payload , " index " , index );
    //     return <Observable<any> > (this._productsService.getAll());
    // }
    // //   .pipe(
    // //     map(resp => {
    // //       let tempProducts = 
    // //         resp.map((item) => {
    // //             return { ...item } 
    // //           });
    // //       return new productsLoaded( tempProducts); 
    // //     }),
    // //     catchError((err) => of(new productsFetchError(err) ))
    // )) )

  constructor(
    private actions$: Actions,
    private _productsService: productService ,
    private notifier : NotifierService,
    private _orderService : orderService ,
    private store: Store<State>
  ) {
  }
}
