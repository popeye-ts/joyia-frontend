import { Injectable } from '@angular/core'; 
import { Router, NavigationStart } from '@angular/router'; 
import { BehaviorSubject, Observable } from 'rxjs'; 
import { Subject } from 'rxjs/Subject';
@Injectable() export class AlertService {
    private subject = new BehaviorSubject <any>(false);
    private lastMessage : any = {};
    constructor(){}
    confirmThis(message: any ,siFn:()=>void,noFn:()=>void){
        this.lastMessage =  message;
        this.setConfirmation(siFn,noFn);
    }
    setConfirmation(siFn:()=>void,noFn:()=>void) {
        let that = this;
        this.subject.next({ status: this.lastMessage.type || "confirm",
            text: this.lastMessage.text ,
            title : this.lastMessage.title || '',
            siFn:
            function(){
                // that.subject.next(false); //this will close the modal
                siFn();
            },
            noFn:function(){
                that.subject.next(false);
                noFn();
            }
        });

    }
    setLoading(){
        let lastValue = this.subject.getValue();
        console.log("What is last value in set loading" , lastValue )
        this.subject.next({...lastValue , status : 'processing'})
    }
    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
    clear(){
        this.subject.next(false);
    }
}