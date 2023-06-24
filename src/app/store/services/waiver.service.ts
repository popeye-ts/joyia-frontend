import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class WaiverService{
  uri =  environment.apiUrl+"waivers";

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

  deleteWaiver(_id , formData){
    return this.http.post<any>(this.uri+"/delete/"+_id , formData );
  }
  get(filters){
    return this.http.post<any>(this.uri+""  , filters);
  }
  getOrderWaivers(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  viewWaiverDetail(_id){
    return this.http.get<any>(this.uri+"/single/"+_id);
  }
  getPrevious(_id){
    return this.http.get<any>(this.uri+"/previous/"+_id);
  }
  updateWaiverStatus( formData){
    return this.http.post<any>(this.uri+"/updateWaiverStatus", formData );
  }
  getAllApprovalAuthorities(){
      return this.http.get<any>(this.uri+"/approvalAuthorties");
  }
}
