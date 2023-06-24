import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class reportService{
  uri =  environment.apiUrl+"reports";

  constructor(private http:HttpClient){}
  
  getAllWaivers(id){
    return this.http.get<any>(this.uri+"/waivers/"+id); //get all waivers of order
  }
  assignedOrdersReport(filters )
  {
    return this.http.post<any>(this.uri+"/assigned-order-report" , {filters : filters});
  }

}
