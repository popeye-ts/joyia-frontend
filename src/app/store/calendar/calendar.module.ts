import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarComponent } from './Calendar/calendar.component';
import { CalendarHeaderComponent } from './CalendarHeader/calendar-header.component';
import { FormsModule } from '@angular/forms';
import { MonthlyComponent } from './monthly/monthly.component';
import { DailyComponent } from './daily/daily.component';
import { WeeklyComponent } from './weekly/weekly.component';
import { HttpClientModule }  from '@angular/common/http';
// import { OrdersApiService } from '../../service/orders-api.service'

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    // OrdersApiService,
    // OrdersApiService,
    ReactiveFormsModule,
    FormsModule ,
    NgbModalModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  declarations: [CalendarComponent , CalendarHeaderComponent, MonthlyComponent, DailyComponent, WeeklyComponent],
  exports: [CalendarComponent , CalendarHeaderComponent],
})
export class CalendarViewModule {}
