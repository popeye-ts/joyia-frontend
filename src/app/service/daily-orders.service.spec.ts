import { TestBed } from '@angular/core/testing';

import { DailyOrdersService } from './daily-orders.service';

describe('DailyOrdersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DailyOrdersService = TestBed.get(DailyOrdersService);
    expect(service).toBeTruthy();
  });
});
