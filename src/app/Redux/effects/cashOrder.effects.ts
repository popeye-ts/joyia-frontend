import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';

import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { productService } from '@services/product.service';
import { PRODUCTS_BEING_FETCHED , PRODUCTS_FETCH_SUCCESS , PRODUCTS_FETCH_ERROR , ADD_PRODUCT , 
  REMOVE_PRODUCT , INCREASE_QUANTITY , DECREASE_QUANTITY, EMPTY_CART, SUBMIT_ORDER, COMPLETE_ORDER, SUBMIT_ORDER_ERROR , PRINT_CASH_INVOICE , PRINTED_CASH_INVOICE, PRINT_FETCH_DATA, 
  PRINT_DATA_FETCHED, CATEGORY_CHANGED, SEARCH_TEXT, CHANGE_RECIEVED_AMOUNT , INVENTORY_FORM_BARCODE_SCANNED } from '@actionTypes';
import { SearchProducts , SearchResultsSuccess , SearchError , CalculateSummary, CompleteOrder , SubmitError, ApplyFilters} from '@/Redux/actions/cashOrder.actions';
import { printing , printed , fetching , fetched , fetchError} from '@/Redux/actions/print.actions';

import {Store} from '@ngrx/store';
import {State } from '@stateInterface';
import { orderService } from '@store/services/order.service';
import { NotifierService } from 'angular-notifier';
import { inventoryService } from '@store/services/inventory.service';

@Injectable()
export class CashOrderEffects {
 loadProducts$ = createEffect(() => this.actions$.pipe(
    ofType(PRODUCTS_BEING_FETCHED),
    mergeMap((action :any) => this._productsService.getFiltered(action.payload)
      .pipe(
        map(resp => {
          let tempProducts = 
            resp.products.map((item) => {
              let inventoryType = item.other_info ? (item.other_info.inventory_type || "Non Barcoded") : "Non Barcoded";

              return { _id : item._id  , price : item.price.sale_price , price_calculated : item.price.sale_price , 
                  name : item.product_display_name , quantity : 1 , quantity_available : item.stock.length > 0 ? item.stock[0].quantity_available : 0, 
                  image : item.image[0] , categories : item.categories , hidden : false , stock : item.stock || []  , inventory_type : inventoryType , inventory_id : item.inventory_id } 
            });
          console.log("Products being fetched", resp);
          return new SearchResultsSuccess( tempProducts); 
        }),
        catchError(() => of(new SearchError() ))
    )) )
  ); 
  
  calculateSummary$ = createEffect(()=> 
    this.actions$.pipe( ofType(ADD_PRODUCT , REMOVE_PRODUCT , INCREASE_QUANTITY , DECREASE_QUANTITY , EMPTY_CART , CHANGE_RECIEVED_AMOUNT) , 
    map(()=>{
      return new CalculateSummary();
    }) )
  );

  submitOrder$ = createEffect( () =>{ 
    let that = this;
    return this.actions$.pipe( 
      ofType(SUBMIT_ORDER),
      mergeMap((action) => this._orderService.createCash(action)
        .pipe(
          map(resp => {
            return new CompleteOrder( resp.message ); 
          }),
          catchError((err) => {
            console.log("Catch error in cash order effects " , err);
            return of(new SubmitError() );
          })
      ))) });

  displaySuccess$ = createEffect(()=>this.actions$.pipe(
    ofType(COMPLETE_ORDER) ,
    tap(action =>{ 
      this.notifier.notify("success" , action['message']);
    })
  ) , { dispatch : false} );
  
  printingCashOrder$ = createEffect( ()=>this.actions$.pipe(
    ofType(PRINT_CASH_INVOICE) ,
    map( (action : any ) => (new fetching(action.payload) ) )
  ))
  categoryChanged$ = createEffect( ()=>this.actions$.pipe(
    ofType(CATEGORY_CHANGED) ,
    map( ( ) => (new ApplyFilters() ) )
  ))
  searchTextChanged$ = createEffect( ()=>this.actions$.pipe(
    ofType(SEARCH_TEXT) ,
    map( ( ) => (new ApplyFilters() ) )
  ))
  fetchOrderDetail$ = createEffect( ()=>{
    return this.actions$.pipe(
      ofType(PRINT_FETCH_DATA) ,
      mergeMap((action : any) => this._orderService.viewDetail(action.payload)
          .pipe(
            map(resp => {
              // console.log("I am fetch order details for print" , resp);
              setTimeout(() => {
                window.print();
              }, 500 );
              return new fetched( resp[0] ) ; 
            }),
            catchError((err) => {
              console.log("Catch error in cash order effects " , err);
              return of(new fetchError(err)) ;
            })
        ))
    ) 
  });

  printedCashOrder$ = createEffect( ()=>this.actions$.pipe(
    ofType(PRINT_DATA_FETCHED) ,
    map( (action : any ) => (new printed() ) )
  ))

  displayError$ = createEffect(()=>this.actions$.pipe(
    ofType(SUBMIT_ORDER_ERROR) ,
    tap(action =>{
      console.log("Action order error " , action );
      this.notifier.notify("error" , action['error']  );
    })
  ) , { dispatch : false} );
  
  barcodeScanned$ = createEffect( () =>{ 
    let that = this;
    return this.actions$.pipe( 
      ofType(INVENTORY_FORM_BARCODE_SCANNED),
      mergeMap((action : any) => this._inventoryService.searchInventory(action.payload)
        .pipe(
          map(resp => {
            console.log("I am barcoe scanned effect response " , resp )
            return resp;
            // return new CompleteOrder( resp.message ); 
          }),
          catchError((err) => {
            console.log("Catch error in cash order effects barcode scanned " , err);
            return of(new SubmitError() );
          })
      ))) });

  constructor(
    private actions$: Actions,
    private _productsService: productService ,
    private notifier : NotifierService,
    private _orderService : orderService ,
    private _inventoryService : inventoryService ,
    private store: Store<State>
  ) {
  }
}