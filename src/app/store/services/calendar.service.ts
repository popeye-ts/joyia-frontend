import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class CalendarService{
  uri =  environment.apiUrl+"calendar";

  constructor(private http:HttpClient){

  }
  create(formData)
  {
    return this.http.post<any>(this.uri+"/create" , formData);
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
