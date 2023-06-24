import { Component, Input, OnInit } from '@angular/core';
import {AlertService} from "@services/alert.sevice";
@Component({
   //moduleId: module.id,
   selector: 'alert',
   templateUrl: 'alert.component.html',
  
})
export class AlertComponent implements OnInit {
   yesFn : any ;
   noFn : any;
   message: any;
   constructor(
     private alertService: AlertService
  ) { 
     let that = this;
   //this function waits for a message from alert service, it gets 
   //triggered when we call this from any other component
   console.log("Gonna Subscribe to alert service ")
   this.alertService.getMessage().subscribe(message => {
      console.log("ALERT COMPONENT SUBSCRIBED" , message );
      this.message = message;

      if(message){
         message.status = message.status  || 'confirm';
         that.yesFn = this.message.siFn;
         that.noFn = this.message.noFn;
         setTimeout(()=>{
            (<any>$('.confirmModal')).modal('show');
         } , 1000)
      }else{
         (<any>$('.confirmModal')).modal('hide');
      }
   });

  }
  
  ngOnInit() {

 }
 confirmClicked(){
   let that = this;
   that.yesFn();
 }
 cancelClicked(){
   let that = this;
   that.noFn();
 }
}