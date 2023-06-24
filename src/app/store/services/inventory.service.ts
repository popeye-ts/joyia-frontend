import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class inventoryService{

  uri =  environment.apiUrl+"inventory";

  constructor(private http:HttpClient){}
  add(formData)
  {
    console.log("Sending Data" , formData);
    return this.http.post<any>(this.uri+"/add" , formData);
  }
  update(_id , formData)
  {
    console.log("Updating " , _id , formData);
    return this.http.post<any>(this.uri+"/update/"+_id , formData);
  }
  getAll(){
    return this.http.get<any>(this.uri+"/");
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  viewDetailByProduct(_id){
    return this.http.get<any>(this.uri+"/by-prodduct/"+_id);
  }

  dumpStock(_id , formData)
  {
    console.log("Updating " , _id , formData);
    return this.http.post<any>(this.uri+"/dump/"+_id , formData);
  }
  submitInventoryForm(formData ){
    console.log("Sending Data" , formData);
    return this.http.post<any>(this.uri+"/submit-inventory-form" , formData);
  }
  updateInventoryStatus(_id , formData) {
    return this.http.post<any>(this.uri+"/dump/"+_id , formData);
  }
  searchInventory(query : string ){
    return this.http.post<any>(this.uri+"/search-available" , {query : query });
  }
  getStockInfo(){
    return this.http.get<any>(this.uri+"/get-stockreport");
  }
}
