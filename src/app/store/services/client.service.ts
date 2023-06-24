import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class clientService{
  uri =  environment.apiUrl+"client";

  constructor(private http:HttpClient){}
  create(formData)
  {
    console.log("Sending Data" , formData);
    return this.http.post<any>(this.uri+"/create" , formData);
  }
  update(_id , formData)
  {
    console.log("Updating " , _id , formData);
    return this.http.post<any>(this.uri+"/update/"+_id , formData);
  }
  get(search)
  {
    return this.http.post<any>(this.uri+"/search",search);
  }
  getAll(){
    return this.http.get<any>(this.uri+"/");
  }
  getMultiple(ids){
    return this.http.post<any>(this.uri+"/multiple" , ids)
  }

  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  remove(_id){
    return this.http.post<any>(this.uri+"/delete" , {id :_id} )
  }
}
