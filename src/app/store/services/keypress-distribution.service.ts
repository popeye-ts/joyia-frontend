import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { filter, map } from "rxjs/operators";
import { StoreEventService } from "./communication.service";

@Injectable({ providedIn: 'root' })
export class KeyPressDistributionService {

    private keyEventSubject = new Subject<KeyboardEvent>();
    public keyEventObs: Observable<KeyboardEvent> = this.keyEventSubject.asObservable();
    constructor(private _eventService : StoreEventService){
        let that = this;
        this.keyEventObs
            .pipe(
            filter(this.permitKey),
            map(this.convertToString)
            )
            .subscribe((v)=>{
                    let customEvent = {
                        type : 'KeyPressed' ,
                        message : v
                    }
                    this._eventService.dispatch( customEvent )
                    return v;
                }
             );
    }
    public distributeKeyPress(keyValue: KeyboardEvent): void {
        this.keyEventSubject.next(keyValue);    
    }
    public ngOnDestroy() {
    //   this.obsRef.unsubscribe();
    }
      
    // ... more implementation here
    public permitKey(keyEvent: KeyboardEvent): boolean {
        const disallowedKeys = ['Shift', 'Control', 'Alt', 'Meta'];
        return !disallowedKeys.includes(keyEvent.key);
    }

    public convertToString(keyEvent: KeyboardEvent): any {
        // console.log("Key event " , keyEvent );
        const modifierKeys = ['altKey', 'ctrlKey', 'shiftKey'];
        let keyCode = 'k-';
        for (const code of modifierKeys) {
            if (keyEvent[code]) keyCode += code.substr(0, 1);
        }
        return { key : `${keyCode}-${keyEvent.code}` , evt : keyEvent };
    }
}