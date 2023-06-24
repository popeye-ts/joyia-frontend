import { Action } from '@ngrx/store';
import { 
  LOAD_DASHBOARD_CARD_STATS,LOADED_DASHBOARD_CARD_STATS,
  LOAD_DASHBOARD_RECENT_ORDERS,LOADED_DASHBOARD_RECENT_ORDERS,CHANGE_DASHBOARD_FILTERS_RECENT_ORDERS,
  LOAD_DASHBOARD_CATEGORIES,LOADED_DASHBOARD_CATEGORIES,
  LOAD_DASHBOARD_LOGS,LOADED_DASHBOARD_LOGS,CHANGE_DASHBOARD_FILTERS_LOGS ,
  LOAD_DASHBOARD_PENDING_PAYMENTS,LOADED_DASHBOARD_PENDING_PAYMENTS, CHANGE_DASHBOARD_FILTERS_PENDING_PAYMENTS,
  LOAD_DASHBOARD_BEST_SELLERS,LOADED_DASHBOARD_BEST_SELLERS, CHANGE_DASHBOARD_FILTERS_BEST_SELLERS,
  LOAD_DASHBOARD_SUMMARY_STATS,LOADED_DASHBOARD_SUMMARY_STATS,
  LOAD_DASHBOARD_PRODUCTS,LOADED_DASHBOARD_PRODUCTS,
  LOAD_DASHBOARD_CARD_STATS_SORTABLE,LOADED_DASHBOARD_CARD_STATS_SORTABLE,
  LOAD_DASHBOARD_OTHER_STATS_LEFT,LOADED_DASHBOARD_OTHER_STATS_LEFT, LOADED_DASHBOARD_SALES, LOADED_DASHBOARD_ORDERS_COUNT,
} from "@actionTypes";
import { inititalDashboardState, DashboardState } from "@stateInterface";
import { DashboardActions } from '../actions/dashboard.actions';

export function dashboardReducer(state = inititalDashboardState , action: DashboardActions): DashboardState {
  switch (action.type) {
    case LOAD_DASHBOARD_CARD_STATS :
      return  {...state , cardStats : { ...state.cardStats , beingLoaded : true } };
    case LOADED_DASHBOARD_CARD_STATS :
      return  {...state , cardStats : { data : action.payload , beingLoaded : false } };
    case LOAD_DASHBOARD_RECENT_ORDERS :
      return { ...state , recentOrders : { ...state.recentOrders , beingLoaded : true }}
    case LOADED_DASHBOARD_RECENT_ORDERS : 
      return { ...state , recentOrders : { ...state.recentOrders , beingLoaded : false , data : action.payload } }
    case CHANGE_DASHBOARD_FILTERS_RECENT_ORDERS :    
      return {...state};
    case LOADED_DASHBOARD_SALES : 
      return salesData(state , action.payload);
    case LOADED_DASHBOARD_CATEGORIES : 
      return {...state , categories : { beingLoaded : false , data : action.payload }}
    case LOADED_DASHBOARD_LOGS : 
      return {...state , logs : {...state.logs , beingLoaded : false , data : action.payload  }}
    case LOADED_DASHBOARD_PENDING_PAYMENTS :
      return {...state , pendingPayments : {...state.pendingPayments , beingLoaded : false , data : action.payload } }
    case LOADED_DASHBOARD_SUMMARY_STATS :
      return {...state , summaryStats : { beingLoaded : false , data : action.payload } }
    case LOADED_DASHBOARD_PRODUCTS :
      return {...state , products : { beingLoaded : false , data : action.payload } }
    case LOADED_DASHBOARD_BEST_SELLERS : 
      return {...state , bestSellers : { ...state.bestSellers , beingLoaded : false , data : action.payload } }
    case LOADED_DASHBOARD_ORDERS_COUNT : 
      return orderData(state , action.payload);

    default:
      return state;
  }
}

const salesData = (state : any , data : any )=>{
  let obj = Object.assign({} , state.sales );
  console.log("Whats in sales data " ,state ,  data );
  var date = new Date();
  var thirtyDaysBack = new Date(date.getFullYear(), date.getMonth(), date.getDate()-30);
  let ordersArr = [];
  const mapDateString = (d)=>{
    var date = new Date(d);
    return date.getDate()  + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
  }


  Object.keys(data).sort(function(a, b) {
    var c = new Date(a);
    var d = new Date(b);
    return (<any>c)-(<any>d);
  })
  .forEach(k=>ordersArr.push({date : k , label : mapDateString(k) , amount : data[k] } ) );
  console.log("Orders arr " , ordersArr );
  // monthly
  obj.monthly = {}
  obj.monthly.labels = ordersArr.map(o=>o.label);
  obj.monthly.values = ordersArr.map(o=>o.amount);
  // weekly 
  obj.weekly = {}
  obj.weekly.labels = ordersArr.slice(-7).map(o=>getDayName( o.date) );
  obj.weekly.values = ordersArr.slice(-7).map(o=>o.amount);

  obj.beingLoaded = false;
  return {...state , sales : obj};
}
const orderData = (state : any , data : any )=>{
  let cashOrdersChart =  Object.assign({} , state.cashOrdersChart );
  let installmentOrdersChart = Object.assign({} , state.installmentOrdersChart );
  console.log("Whats in orders stats data " ,state ,  data );
  var date = new Date();
  var thirtyDaysBack = new Date(date.getFullYear(), date.getMonth(), date.getDate()-30);
  let cashOrdersArr = [];
  let installmentOrdersArr = [];
  const mapDateString = (d)=>{
    var date = new Date(d);
    return date.getDate()  + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
  }


  Object.keys(data).sort(function(a, b) {
    var c = new Date(a);
    var d = new Date(b);
    return (<any>c)-(<any>d);
  })
  .forEach(k=>{
    cashOrdersArr.push({date : k , label : mapDateString(k) , amount : data[k].cash } ) 
    installmentOrdersArr.push({date : k , label : mapDateString(k) , amount : data[k].installment } ) 
  });
  console.log("Orders array " , cashOrdersArr , " ----  " , installmentOrdersArr );
  let cashObj : any = { monthly : {} , weekly : {} };
  let installmentObj : any = { monthly : {} , weekly : {} };
  // monthly
  cashObj.monthly = { labels : [] , values : []}
  cashObj.monthly.labels = cashOrdersArr.map(o=>o.label);
  cashObj.monthly.values = cashOrdersArr.map(o=>o.amount);

  installmentObj.monthly = {}
  installmentObj.monthly.labels = installmentOrdersArr.map(o=>o.label);
  installmentObj.monthly.values = installmentOrdersArr.map(o=>o.amount);

  // weekly 
  cashObj.weekly = {}
  cashObj.weekly.labels = cashOrdersArr.slice(-7).map(o=>getDayName( o.date) );
  cashObj.weekly.values = cashOrdersArr.slice(-7).map(o=>o.amount);

  installmentObj.weekly = {}
  installmentObj.weekly.labels = installmentOrdersArr.slice(-7).map(o=>getDayName( o.date) );
  installmentObj.weekly.values = installmentOrdersArr.slice(-7).map(o=>o.amount);

  cashObj.beingLoaded = false;
  installmentObj.beingLoaded = false;
  return {...state , cashOrdersChart : cashObj , installmentOrdersChart : installmentObj  };
}
const getDayName = (dateStr)=>{
  let date = new Date(dateStr);
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  // console.log("Whats date " , date );
  return days[date.getDay()];
}