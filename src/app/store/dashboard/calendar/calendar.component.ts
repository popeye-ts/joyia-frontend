import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '@environments/environment';

@Component({
  selector : 'calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class calendarComponent implements AfterViewInit {
  data : any ;
  serverImagesPath : string = environment.apiUrl+"uploads/";
  viewDate: Date = new Date();

  constructor(){

  }

  ngAfterViewInit() : void {
    if ( (<any>$()).fullCalendar) {
      var testEvent = new Date(new Date().setHours(new Date().getHours()));
      var day = testEvent.getDate();
      var month = testEvent.getMonth() + 1;
      (<any>$(".calendar")).fullCalendar({
        themeSystem: "bootstrap4",
        height: "auto",
        isRTL: false,
        buttonText: {
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
          list: "List"
        },
        bootstrapFontAwesome: {
          prev: " simple-icon-arrow-left",
          next: " simple-icon-arrow-right",
          prevYear: " simple-icon-control-start",
          nextYear: " simple-icon-control-end"
        },
        events: [
          {
            title: "Account",
            start: "2018-05-18"
          },
          {
            title: "Delivery",
            start: "2019-07-22",
            end: "2019-07-24"
          },
          {
            title: "Conference",
            start: "2019-06-07",
            end: "2019-06-09"
          },
          {
            title: "Delivery",
            start: "2019-09-03",
            end: "2019-09-06"
          },
          {
            title: "Meeting",
            start: "2019-06-17",
            end: "2019-06-18"
          },
          {
            title: "Taxes",
            start: "2019-08-07",
            end: "2019-08-09"
          }
        ]
      });
    }
  }
  ngOnDestroy(): void {

  }

}
