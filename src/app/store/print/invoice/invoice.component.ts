import { Component, OnInit } from '@angular/core';
// import {ActivatedRoute} from '@angular/router';
import {PrintService} from '@services/print.service';
import { Observable } from 'rxjs';
import {select , Store} from '@ngrx/store';
import {State } from '@stateInterface';
import { getAllProducts, getOrderNumber, getPrintState, getTotal , getTax} from '@selectors/print.selector';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  products$ : Observable<any []>;
  invoice$ : Observable<any >;
  total$ : Observable<number >;
  tax$ : Observable<number >;
  order_number$ : Observable<number >;

  constructor(private store: Store<State>) {
    this.products$ = this.store.select(getAllProducts);
    this.invoice$ = this.store.select(getPrintState);
    this.total$ = this.store.select(getTotal);
    this.tax$ = this.store.select(getTax);
    this.order_number$ = this.store.select(getOrderNumber);
  }

  ngOnInit() {
    // this.invoiceDetails = this.invoiceIds
    //   .map(id => this.getInvoiceDetails(id));
    // Promise.all(this.invoiceDetails)
    //   .then(() => this.printService.onDataReady());
  }

  getInvoiceDetails(invoiceId) {
    const amount = Math.floor((Math.random() * 100));
    return new Promise(resolve =>
      setTimeout(() => resolve({amount}), 1000)
    );
  }

}