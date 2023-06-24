import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class orderService{
  createInstallmentOrder(data: any) {
    return this.http.post<any>(this.uri+"/create-installment-order" , data);
  }
  uri =  environment.apiUrl+"order";

  constructor(private http:HttpClient){}
  create(orderData)
  {
    return this.http.post<any>(this.uri+"/create" , orderData);
  }
  createCash(orderData)
  {
    let data = Object.keys(orderData).length ? (orderData.data || '') : ''
    return this.http.post<any>(this.uri+"/createCash" , data );
  }
  update(_id , formData)
  {
    return this.http.post<any>(this.uri+"/update/"+_id , formData);
  }
  get(filters){
    return this.http.post<any>(this.uri+""  , filters);
  }
  getAll(){
    return this.http.get<any>(this.uri+"");
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  addBatch(batchData){
    return this.http.post<any>(this.uri+"/addBatch" , batchData);
  }
  getAllWaivers(id){
    return this.http.get<any>(this.uri+"/waivers/"+id); //get all waivers of order
  }
  createWaiver(waiverData)
  {
    return this.http.post<any>(this.uri+"/waiver/create" , waiverData);
  }
  fetchCashOrders(){
    return this.http.get<any>(this.uri+"/cashOrders");
  }

  assignOrder (_id , formData)
  {
    return this.http.post<any>(this.uri+"/assignOrder/"+_id , formData);
  }
  deleteOrder(_id)
  {
    return this.http.delete<any>(this.uri+"/deleteOrder/"+_id );
  }
  markCompleteOrder(_id){
    return this.http.get<any>(this.uri+"/orderComplete/"+_id );
  }
  
}
