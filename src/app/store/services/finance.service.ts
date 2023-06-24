import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class financeService{
  uri =  environment.apiUrl+"finance";
  
  constructor(private http:HttpClient){
    
  }
  create(formData)
  {
    return this.http.post<any>(this.uri+"/create" , formData);
  }
  // Used to create an account row
  createAccount(formData)
  {
    return this.http.post<any>(this.uri+"/createAcc" , formData);
  }
  updateMarked(markedList: string[]) {
    return this.http.post<any>(this.uri+"/update-marked" , markedList);
  }
  update(_id , formData)
  {
    return this.http.post<any>(this.uri+"/update/"+_id , formData);
  }
  deleteInstlmnt(_id , formData){
    return this.http.post<any>(this.uri+"/delete/"+_id , formData );
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
  getPrevious(_id){
    return this.http.get<any>(this.uri+"/previous/"+_id);
  }
}
