import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';

//***********::Charts pluggin::**************//
import * as Chart  from "chart.js";
import ChartDataLabels  from "chartjs-plugin-datalabels";
import { Store } from '@ngrx/store';
import { State } from '@/Redux/state';
import { getInstallmentOrdersChart } from '@/Redux/selectors/dashboard.selector';

@Component({
  selector : 'installmentOrdersChart',
  templateUrl: './installmentOrdersChart.component.html',
  styleUrls: ['./installmentOrdersChart.component.scss']
})
export class installmentOrdersChartComponent implements AfterViewInit{
  cashOrdersData : any  ;
  weeklyOrders : any = { labels : [] , values  : []};
  monthlyOrders : any = { labels : [] , values  : []};
  currentlySelected : string  = "weekly";
  arr : Array<number> = [ ];

  sales$ : Observable<any>;
  beingLoaded : Boolean = true;

  constructor(private store: Store<State>  ){
    this.sales$ = this.store.select(getInstallmentOrdersChart );
    let that = this;
    [1,2,3,4,5,6,7,8].map(n=>{
      that.arr.push(that.randomInt(90 , 280))
    })
  } 
  ngAfterViewInit(): void {
    let that = this ;
    this.sales$.subscribe(sales=>{
      // console.log("I am sales component data " , sales );
      that.beingLoaded = sales.beingLoaded;
      that.weeklyOrders = sales.weekly || { labels : [] , values : [] };
      that.monthlyOrders = sales.monthly || { labels : [] , values : [] };
      that.currentlySelected = sales.currentlySelected || 'weekly';
      // console.log("I am sales component data after" , that.weeklyOrders , that.monthlyOrders );
      setTimeout(()=> that.makeChart() , 100) ;
    })

  }

  makeChart( ){
    console.log("installment orders chart component" , this.cashOrdersData , this.currentlySelected );
    let instanceObj = this;
    let labels=[] , values =[];
    if( this.currentlySelected == "weekly")
    {
      labels = this.weeklyOrders.labels
      values = this.weeklyOrders.values
    }else{
      // labels =
      labels = this.monthlyOrders.labels
      values = this.monthlyOrders.values
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

      if ( document.getElementById("installmentOrdersChart")) {
        var installmentOrdersChart = (<HTMLCanvasElement>document.getElementById("installmentOrdersChart")).getContext("2d");

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

        var myChart = new Chart(installmentOrdersChart, {
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
