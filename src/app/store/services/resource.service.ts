import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

import { User } from '@models/user';

@Injectable({
  providedIn : 'root'
})
export class ResourceService{
  uri =  environment.apiUrl+"resource";

  constructor( private http:HttpClient){

  }
  create(formData)
  {
    return this.http.post<any>(this.uri+"/create" , formData);
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
  getById(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
}
