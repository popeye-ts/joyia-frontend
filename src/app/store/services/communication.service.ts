import { Injectable } from "@angular/core";
import { StoreEvent } from "@store/models/event";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable()
export class StoreEventService {

  private eventBrocker = new Subject<StoreEvent>();

  on(eventType: string): Observable<StoreEvent> {
    return this.eventBrocker.pipe(filter(event => event.type === eventType));
  }

  dispatch<T>(event: StoreEvent): void {
    this.eventBrocker.next(event);
  }
}