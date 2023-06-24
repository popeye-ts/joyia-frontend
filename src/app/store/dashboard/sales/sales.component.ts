import {Component , Input , OnChanges, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

//***********::Charts pluggin::**************//
import * as Chart  from "chart.js";
import ChartDataLabels  from "chartjs-plugin-datalabels";
import { getSales } from '@/Redux/selectors/dashboard.selector';
import { State } from '@/Redux/state';
import { Store } from '@ngrx/store';
import { NotifierService } from 'angular-notifier';

@Component({
  selector : 'sales',
  templateUrl: './sales.component.html',
  
  styleUrls: ['./sales.component.scss']
})
export class salesComponent implements  OnInit{
  salesData : any  ;
  weeklySales : any = { labels : [] , values  : []};
  monthlySales : any = { labels : [] , values  : []};
  currentlySelected : string  = "weekly";
  arr : Array<number> = [ ];

  sales$ : Observable<any>;
  beingLoaded : Boolean = true;

  constructor(private store: Store<State>  , private notifier : NotifierService){
    this.sales$ = this.store.select(getSales );
    let that = this;
    [1,2,3,4,5,6,7,8].map(n=>{
      that.arr.push(that.randomInt(90 , 280))
    })
  } 
  ngOnInit(): void {
    let that = this ;
    this.sales$.subscribe(sales=>{
      // console.log("I am sales component data " , sales );
      that.beingLoaded = sales.beingLoaded;
      that.weeklySales = sales.weekly || { labels : [] , values : [] };
      that.monthlySales = sales.monthly || { labels : [] , values : [] };
      that.currentlySelected = sales.currentlySelected;
      // console.log("I am sales component data after" , that.weeklySales , that.monthlySales );
      setTimeout(()=> that.makeChart() , 100) ;
    })

  }

  makeChart( ){
    console.log("Sales chart component" , this.salesData);
    let instanceObj = this;
    let labels=[] , values =[];
    if( this.currentlySelected == "weekly")
    {
      labels = this.weeklySales.labels
      values = this.weeklySales.values
    }else{
      // labels =
      labels = this.monthlySales.labels
      values = this.monthlySales.values
    }
    //finding minimum and maximum
    let min = this.findMin(values)
    let max = this.findMax(values)

    let rootStyle = getComputedStyle(document.body);
    let themeColor1 = rootStyle.getPropertyValue("--theme-color-1").trim();

    //other colors
    var primaryColor = rootStyle.getPropertyValue("--primary-color").trim();
    var foregroundColor = rootStyle.getPropertyValue("--foreground-color").trim();
    var separatorColor = rootStyle.getPropertyValue("--separator-color").trim();

    //Chart tool tip
    let chartTooltip = {
       backgroundColor: foregroundColor,
       titleFontColor: primaryColor,
       borderColor: separatorColor,
       borderWidth: 0.5,
       bodyFontColor: primaryColor,
       bodySpacing: 10,
       xPadding: 15,
       yPadding: 15,
       cornerRadius: 0.15,
       displayColors: false
     };

      if ( document.getElementById("salesChart")) {
        var salesChart = (<HTMLCanvasElement>document.getElementById("salesChart")).getContext("2d");

        //Start of instantiating the library for chart
        Chart.defaults.LineWithShadow = Chart.defaults.line;
        Chart.controllers.LineWithShadow = Chart.controllers.line.extend({
          draw: function (ease) {
            Chart.controllers.line.prototype.draw.call(this, ease);
            var ctx = this.chart.ctx;
            ctx.save();
            ctx.shadowColor = "rgba(0,0,0,0.15)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 10;
            ctx.responsive = true;
            ctx.stroke();
            Chart.controllers.line.prototype.draw.apply(this, arguments);
            ctx.restore();
          }
        });

        //End of instantiating the library for chart

        var myChart = new Chart(salesChart, {
          type: "LineWithShadow",
          options: {
            plugins: {
              datalabels: {
                display: false
              }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              yAxes: [
                {
                  gridLines: {
                    display: true,
                    lineWidth: 1,
                    color: "rgba(0,0,0,0.1)",
                    drawBorder: false
                  },
                  ticks: {
                    callback: function(label, index, labels) {
                        return (<any>label)/1000+'k';
                    }
                },
                scaleLabel: {
                    display: true,
                    labelString: '1k = 1000'
                }
                }
              ],
              xAxes: [
                {
                  gridLines: {
                    display: false
                  }
                }
              ]
            },
            legend: {
              display: false
            },
            tooltips: chartTooltip
          },
          data: {
            labels: labels,
            datasets: [
              {
                label: "",
                data: values,
                borderColor: themeColor1,
                pointBackgroundColor: foregroundColor,
                pointBorderColor: themeColor1,
                pointHoverBackgroundColor: themeColor1,
                pointHoverBorderColor: foregroundColor,
                pointRadius: 6,
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                fill: false
              }
            ]
          }
        });
      }
  }
  redraw(str)
  {
    //Taking care of same options selected
    if(str == "weekly" && this.currentlySelected == "weekly")
      return ;
    if(str == "monthly" && this.currentlySelected == "monthly")
        return ;

    if(str == "weekly")
    {

      this.currentlySelected = "weekly";
      this.makeChart();
      //setting the currently active label
      $(".salesMenu").children().removeClass("active")
      $(".salesMenu").children().eq(0).addClass("active")
    }else{
      this.currentlySelected = "monthly";
      this.makeChart()
      //setting the currently active label
      $(".salesMenu").children().removeClass("active")
      $(".salesMenu").children().eq(1).addClass("active")

    }
  }
  //Making helper methods
  findMax(values)
  {
    let max= 10;
    values.forEach(no => {
      if(no > max)
        max = no;
    });
    return max;
  }
  findMin(values)
  {
    let min= 0;
    values.forEach(no => {
      if(no < min)
        min = no;
    });
    return min;
  }

  //for formating numbers
   shortenLargeNumber(num, digits) {
    var units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        decimal;

    for(var i=units.length-1; i>=0; i--) {
        decimal = Math.pow(1000, i+1);

        if(num <= -decimal || num >= decimal) {
            return +(num / decimal).toFixed(digits) + units[i];
        }
    }

    return num;
  }
  randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
}
