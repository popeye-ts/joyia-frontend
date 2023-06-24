import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class AccountService{
  uri =  environment.apiUrl+"account";

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
  deleteAccount(_id ){
    return this.http.post<any>(this.uri+"/delete" , {id :_id} );
  }
  get(filters){
    console.trace();
    return this.http.post<any>(this.uri+""  , filters);
  }
  getByParent(filters){
    return this.http.post<any>(this.uri+"/getbyparent" , filters)
  }
  getAll(){
    console.trace();

    return this.http.get<any>(this.uri+"");
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  getPrevious(_id){
    return this.http.get<any>(this.uri+"/previous/"+_id);
  }
  remove(_id){
    return this.http.post<any>(this.uri+"/delete" , {id :_id} )
  }
}
