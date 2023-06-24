import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  } from '@angular/core';
import { Subject } from 'rxjs';
import { productService } from './../../services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";
import { statsService } from '@store/services/stats.service';
import * as ProgressBar  from "progressbar.js";


@Component({
  selector : 'cardStatsSortable',
  templateUrl: './cardStatsSortable.component.html',
  styleUrls: ['./cardStatsSortable.component.scss']
})
export class cardStatsSortableComponent implements AfterViewInit , OnInit{
  serverImagesPath : string = environment.apiUrl+"uploads/";
  messagesCount : string = '0';
  beingLoaded : boolean = true;
  constructor(private _statsService : statsService){

  }
  ngOnInit(){
    let that = this ;
    console.log("Gonna subscribe for message response ");
    this._statsService.getBalance().subscribe(resp=>{
      that.beingLoaded = false;
      console.log("Message count response " , resp );
      that.messagesCount = ~~resp.sms+'';
      setTimeout(() => {
        that.initProgress();
      }, 2000); 
    })

  }
  ngAfterViewInit() : void {

  }
  initProgress(){
    var rootStyle = getComputedStyle(document.body);
    var themeColor1 = rootStyle.getPropertyValue("--theme-color-1").trim()
    $(".progress-bar").each(function () {
      $(this).css("width", $(this).attr("aria-valuenow") + "%");
    });
    console.log("Whats the type of progress bar" ,  ProgressBar );
    if (typeof ProgressBar !== "undefined") {
      $(".progress-bar-circle").each(function () {
        var val : any = $(this).attr("aria-valuenow");
        var color = $(this).data("color") || themeColor1;
        var trailColor = $(this).data("trailColor") || "#d7d7d7";
        var max : any = $(this).attr("aria-valuemax") || 100;
        console.log("Value , Max " , val , "::", max )
        var showPercent = $(this).data("showPercent");
        var circle = new ProgressBar.Circle(this, {
          color: color,
          duration: 20,
          easing: "easeInOut",
          strokeWidth: 4,
          trailColor: trailColor,
          trailWidth: 4,
          text: {
            autoStyleContainer: false
          },
          step: function (state, bar) {
            if (showPercent) {
              bar.setText(Math.round(bar.value() * 100) + "%");
            } else {
              bar.setText(val + "/" + max);
            }
          }
        }).animate(val / max);
      });
    }
  }
  ngOnDestroy(): void {

  }

}
