import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class orderDetailService{
  uri =  environment.apiUrl+"orderDetail";
constructor(private http:HttpClient){}

  getClient(_id){

    return this.http.get<any>(this.uri+"/clientDetail/"+_id);
  }

  getGuarantors(_id)
  {
    return this.http.get<any>(this.uri+"/guarantorsDetail/"+_id);
  }
  // getProducts(_id)
  // {
  //   return this.http.get<any>(this.uri+"/productsDetail/"+_id);
  // }
  getProductsMultiple(ids)
  {
    return this.http.post<any>(this.uri+"/productsDetailMultiple/",ids);
  }
  fetchClientOrders(id){
    return this.http.get<any>(this.uri+"/clientOrders/"+id);
  }
  fetchOrderBatches(id){
    return this.http.get<any>(this.uri+"/batches/"+id);    
  }
  submitRating(_id , formData){
    return this.http.post<any>(this.uri+"/rateOrder/"+_id , formData);

    
  }
}
