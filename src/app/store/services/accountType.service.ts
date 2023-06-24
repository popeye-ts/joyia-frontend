import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class AccountTypeService{
  uri =  environment.apiUrl+"accounttype";

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
  deleteAccountType(_ids ){
    return this.http.post<any>(this.uri+"/delete/", {ids: _ids} );
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
  search(_id){
    return this.http.get<any>(this.uri+"/previous/"+_id);
  }
}
