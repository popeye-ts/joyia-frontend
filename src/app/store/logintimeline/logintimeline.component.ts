import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
declare var $: any;
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";

@Component({
  selector : 'logintimeline',
  templateUrl: './logintimeline.component.html',
  styleUrls: ['./logintimeline.component.scss']
})
export class LoginTimelineComponent implements AfterViewInit , OnInit{
  pageData : any;

  constructor(private http:HttpClient , private fb:FormBuilder ,
             private notifier : NotifierService ,
            public _permService : PermissionService){
    this.pageData = {
      title: 'Login timeline',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Login timeline'
        }
      ]
    };

  }
  ngOnInit(){
    let that = this ;
  }
  ngAfterViewInit() : void {
  }
  ngOnDestroy(): void {
  }

  rerender(): void {
  }

}
