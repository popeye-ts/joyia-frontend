import {Component,ChangeDetectionStrategy,ViewChild,TemplateRef , OnInit} from '@angular/core';
import {startOfDay,endOfDay,subDays,addDays,endOfMonth,isSameDay,isSameMonth,addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent,CalendarEventAction,CalendarEventTimesChangedEvent,CalendarView} from 'angular-calendar';
import { PermissionService } from "@services/permissions.service";
import { CalendarService } from "@services/calendar.service";
import { OrdersApiService }  from '../../../service/orders-api.service'
import { HttpClient } from '@angular/common/http';
// import { warn } from 'console';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'calendar-component',
  styleUrls: ['calendar.component.scss'],
  templateUrl: 'calendar.component.html',

})


export class CalendarComponent implements OnInit{
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  // orders:any;




  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'A 3 day event',
      color: colors.red,
      actions: this.actions,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      color: colors.yellow,
      actions: this.actions,
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'A long event that spans 2 months',
      color: colors.blue,
      allDay: true,
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'A draggable and resizable event',
      color: colors.yellow,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
  ];

  activeDayIsOpen: boolean = true;
  ordersLst:any;

  constructor(private modal: NgbModal , private _calendarService  : CalendarService ,private orderData:OrdersApiService, private http : HttpClient) {

    console.log("The events ::" , this.events )
  }
  // storeOrder() : any {
  //   this.http.get('http://localhost:3000/api/data').subscribe((data:any) => {
  //     // console.warn(data);
  //     this.orderData = data;
  //     console.warn(this.orderData);
      
      
  //   })
  // }
  ngOnInit(){
    this.countOrders()
    this.orderData.getOrders().subscribe((res)=>{
     
      this.ordersLst=res;
      console.log("tayyab:" , this.ordersLst);
      // this.refresh.next(true)
      // alert("The last payment time is " + res[2].last_payment_time.$date)
      return res;
    });

    
    let that = this;
    this._calendarService.getAll().subscribe(resp=>{
      console.log("Data fetched from activity" , resp)
      
     
      resp.forEach(activity => {
          const random = Math.floor(Math.random() * 4);
          let i=0;
          let obj = {
            start: new Date(activity.login_time),
            end: new Date(activity.logout_time),
            title: activity.description,
            color: colors.red,
          }
          Object.keys(colors).forEach(col=>{
            if( random % i++ == 3)
                {
                  obj.color = colors.red
                  return ;
                }
            if(i++ % random == 2)
                {
                  obj.color = colors.red
                  return ;
                }
            if(i++ % random == 1)
              obj.color = colors.yellow

          })
          that.events.push(obj)
        })
    } , err=>{
      console.log("Error occured in activity" , err)

    })
  }
  countOrders() : any{
    const dateString : any = this.ordersLst.created_at.toISOString();
    console.warn('dateString' , dateString);
    
  }
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({event,newStart,newEnd} :
                CalendarEventTimesChangedEvent): void {
                  this.events = this.events.map((iEvent) => {
                    if (iEvent === event) {
                      return {
                        ...event,
                        start: newStart,
                        end: newEnd,
                      };
                    }
                    return iEvent;
                  });
                  this.handleEvent('Dropped or resized', event);
                }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() { 
    this.activeDayIsOpen = false;

  }

}
