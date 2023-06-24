import { TestBed } from '@angular/core/testing';

import { OrdersApiService } from './orders-api.service';

describe('OrdersApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdersApiService = TestBed.get(OrdersApiService);
    expect(service).toBeTruthy();
  });
});
