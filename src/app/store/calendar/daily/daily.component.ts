import { Component ,ChangeDetectionStrategy,ViewChild,TemplateRef , OnInit } from '@angular/core';
import {startOfDay,endOfDay,subDays,addDays,endOfMonth,isSameDay,isSameMonth,addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent,CalendarEventAction,CalendarEventTimesChangedEvent,CalendarView} from 'angular-calendar';
import { PermissionService } from "@services/permissions.service";
import { CalendarService } from "@services/calendar.service";

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
  selector: 'app-daily',
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.scss']
})

export class DailyComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  CalendarView = CalendarView;
  viewDate: Date = new Date();
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
  modalData: {
    action: string;
    event: CalendarEvent;
  };

  events: CalendarEvent[] = [];
  // [
  //   {
  //     start: subDays(startOfDay(new Date()), 1),
  //     end: addDays(new Date(), 1),
  //     title: 'A 3 day event',
  //     color: colors.red,
  //     actions: this.actions,
  //     allDay: true,
  //   },
  //   {
  //     start: startOfDay(new Date()),
  //     title: 'An event with no end date',
  //     color: colors.yellow,
  //     actions: this.actions,
  //   },
  //   {
  //     start: subDays(endOfMonth(new Date()), 3),
  //     end: addDays(endOfMonth(new Date()), 3),
  //     title: 'A long event that spans 2 months',
  //     color: colors.blue,
  //     allDay: true,
  //   },
  //   {
  //     start: addHours(startOfDay(new Date()), 2),
  //     end: addHours(new Date(), 2),
  //     title: 'A draggable and resizable event',
  //     color: colors.yellow,
  //     actions: this.actions,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true,
  //     },
  //     draggable: true,
  //   },
  // ];
  refresh: Subject<any> = new Subject();

  constructor(private modal: NgbModal ,  private _calendarService  : CalendarService ) { }

  ngOnInit() {
    let that = this;
    this._calendarService.getAll().subscribe(resp=>{
        console.log("Data fetched from activity" , resp)
        let n=0;
        resp.forEach(activity => {
          console.log("foreach avtivity" , activity)
          if(n++ > 50)
            return ;
          const random = Math.floor(Math.random() * 4);
          let i=0;
          let obj = {
            start: new Date(activity.login_time),
            title: activity.userId.username,
            color: colors.red,
          };
          if(activity.logout_time)
            {
              obj['end'] = new Date(activity.logout_time);
            }
          else
            {
              obj['allDay'] = true ;
              obj['title'] = activity.userId.username+' is online.';
              obj.color = colors.blue;
            }
          Object.keys(colors).forEach(col=>{
            if( random % i++ == 3)
                {
                  obj.color = colors.red
                  return ;
                }
            if(i++ % random == 2)
                {
                  obj.color = colors.blue
                  return ;
                }
            if(i++ % random == 1)
              obj.color = colors.yellow

          })
          that.events.push(obj)
        })
        that.refresh.next();
    } , err=>{
      console.log("Error occured in activity" , err)
    })

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

}
