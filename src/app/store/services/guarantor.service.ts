import { Injectable } from '@angular/core';
import { HttpClient , HttpParams } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class guarantorsService {
  uri =  environment.apiUrl+"guarantor";

  constructor(private http:HttpClient)
  {

  }
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
  viewDetailMultiple(_ids){
      return this.http.post<any>(this.uri+"/multiple", _ids);
  }
  search(search){
    return this.http.post<any>(this.uri+"/search" , search)
  }
  remove(_id){
    return this.http.post<any>(this.uri+"/delete" , {id :_id} )
  }
 }
