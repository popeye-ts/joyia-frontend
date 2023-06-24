import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy   , Input  , OnChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { productService } from '@services/product.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';
import { NotifierService } from "angular-notifier";

//***********::Charts pluggin::**************//
import * as Chart  from "chart.js";
import ChartDataLabels  from "chartjs-plugin-datalabels";
import { getCategories } from '@/Redux/selectors/dashboard.selector';
import { Store } from '@ngrx/store';
import { State } from '@/Redux/state';

@Component({
  selector : 'categories',
  templateUrl: './categories.component.html',
  
  styleUrls: ['./categories.component.scss']
})
export class categoriesComponent implements AfterViewInit{
  pageData : any;
  serverImagesPath : string = environment.apiUrl+"uploads/";
  categories$ : Observable<any>;
  beingLoaded : boolean = true;
  categories : Array<any> ;
  constructor(private store: Store<State>  ,){
    this.categories$ = this.store.select(getCategories );
 
  }
   
  initChart(){
    //getting the labels and their values
    let labels=[];
    let values =[];
    if(this.categories.length == 0){
      return ;
    }
    
    this.categories.forEach((category)=>{
      labels.push(category._id);
      values.push(category.TotalCount);
    })

    //initialize theme color
    let rootStyle = getComputedStyle(document.body);
    var themeColor1 = rootStyle.getPropertyValue("--theme-color-1").trim();
    var themeColor2 = rootStyle.getPropertyValue("--theme-color-2").trim();
    var themeColor3 = rootStyle.getPropertyValue("--theme-color-3").trim();

    var themeColor1_10 = rootStyle
      .getPropertyValue("--theme-color-1-10")
      .trim();
    var themeColor2_10 = rootStyle
      .getPropertyValue("--theme-color-2-10")
      .trim();
    var themeColor3_10 = rootStyle
      .getPropertyValue("--theme-color-3-10")
      .trim();

    //other colors
    var primaryColor = rootStyle.getPropertyValue("--primary-color").trim();
    var foregroundColor = rootStyle
      .getPropertyValue("--foreground-color")
      .trim();
    var separatorColor = rootStyle.getPropertyValue("--separator-color").trim();

    //charts tool tip
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
    //Adding particular chart type
    Chart.defaults.PolarWithShadow = Chart.defaults.polarArea;
    Chart.controllers.PolarWithShadow = Chart.controllers.polarArea.extend({
      draw: function (ease) {
        Chart.controllers.polarArea.prototype.draw.call(this, ease);
        let ctx = this.chart.chart.ctx;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 10;
        ctx.responsive = true;
        Chart.controllers.polarArea.prototype.draw.apply(this, arguments);
        ctx.restore();
      }
    });
     
    //initializing charts
    if (document.getElementById("polarChart")) {
      var polarChart = (<HTMLCanvasElement>document.getElementById("polarChart") ).getContext("2d");
      var myChart = new Chart(polarChart, {
        type: "PolarWithShadow",
        options: {
          plugins: {
            datalabels: {
              display: false
            }
          },
          responsive: true,
          maintainAspectRatio: false,
          scale: {
            ticks: {
              display: false
            }
          },
          legend: {
            position: "bottom",
            labels: {
              padding: 30,
              usePointStyle: true,
              fontSize: 12
            }
          },
          tooltips: chartTooltip
        },
        data: {
          datasets: [
            {
              label: "Stock",
              borderWidth: 2,
              pointBackgroundColor: themeColor1,
              borderColor: [themeColor1, themeColor2, themeColor3],
              backgroundColor: [
                themeColor1_10,
                themeColor2_10,
                themeColor3_10
              ],
              data: values
            }
          ],
          labels: labels
        }
      });
    }

  }
  ngAfterViewInit() : void {
    let that = this;
    this.categories$.subscribe(categoryData=>{
      that.beingLoaded = categoryData.beingLoaded && !categoryData.categories;
      that.categories = categoryData.data || [];
      if(that.categories){
        setTimeout(()=>that.initChart() , 400);
      }
    })
  }
  ngOnDestroy(): void {

  }

}
