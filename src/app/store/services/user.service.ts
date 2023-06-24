import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

import { User } from '@models/user';

@Injectable({
  providedIn : 'root'
})
export class UserService{
  uri =  environment.apiUrl+"users";

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
  updateMyProfile(formData)
  {
    return this.http.post<any>(this.uri+"/update-my-profile" , formData);
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
  getProfileInfo(){
    return this.http.get<any>(this.uri+"/my-profile");
  }
  assignRole(data){
    return this.http.post<any>(this.uri+"/assign", data);
  }

  getAllNames(){
    return this.http.get<any>(this.uri+"/name");
  }
  logUserOut(id){
    return this.http.post<any>(this.uri+"/force-loguserout", {id : id });
  }
  toggleUserStatus(id){
    return this.http.post<any>(this.uri+"/toggle-user-status", {id : id });
  }
  updatePreference(data : any) {
    return this.http.post<any>(this.uri+"/update-preference", data);

  }
  updatePassword(data : any) {
    return this.http.post<any>(this.uri+"/update-password", data);

  }
  search(query){
    query = query && query.trim().length ? query :  '-' ;
    return this.http.get<any>(this.uri+"/search/"+query);
  }

}
