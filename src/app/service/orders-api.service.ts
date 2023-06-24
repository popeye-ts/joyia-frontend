import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersApiService {
  url = "http://localhost:3000/api/data";

  constructor(private http:HttpClient) { }

  getOrders():Observable<any>{

    return this.http.get(this.url);
    
  }
}
