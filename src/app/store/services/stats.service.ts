import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class statsService{
  uri =  environment.apiUrl+"stats";

  constructor(private http:HttpClient){}

  get(search)
  {
    return this.http.post<any>(this.uri+"/search",search);
  }
  getAll(){
    return this.http.get<any>(this.uri+"/default");
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  getBalance(){
    return this.http.get<any>(this.uri+"/balance");
  }
  getCardStats(){
    return this.http.get<any>(this.uri+"/card-stats");
  }
  getRecentOrders(filters){
    return this.http.post<any>(this.uri+"/recent-orders" , filters);
  }
  getSales(){
    return this.http.get<any>(this.uri+"/sales");
  }
  getCategories(){
    return this.http.get<any>(this.uri+"/categories");
  }
  getLogs(filters){
    return this.http.post<any>(this.uri+"/logs" , filters);
  }

  getPendingPayments(filters){
    return this.http.post<any>(this.uri+"/pending-payments" , filters);
  }
  getSummaryStats(){
    return this.http.get<any>(this.uri+"/summary-stats" );
  }
  getLatestProducts(){
    return this.http.get<any>(this.uri+"/latest-products" );
  }
  getBestSeller(){
    return this.http.get<any>(this.uri+"/best-sellers" );
  }
  getOrderStats(){
    return this.http.get<any>(this.uri+"/orders-statistics" );
  }
  
  
}
