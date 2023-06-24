import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class medicineService{
  uri =  environment.apiUrl+"inventory";

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
  getAll(){
    return this.http.get<any>(this.uri+"/");
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
}
