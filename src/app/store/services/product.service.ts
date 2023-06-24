import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class productService{
  uri =  environment.apiUrl+"product";

  constructor(private http:HttpClient){}
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
    return this.http.get<any>(this.uri+"/all");
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  viewDetailMultiple(ids)
  {
    return this.http.post<any>(this.uri+"/multiple/" , ids)
  }
  search(search){
    return this.http.post<any>(this.uri+"/search"  , search);
  }
  //fetch stock and quantity etc with product info
  searchStock(search){
    return this.http.post<any>(this.uri+"/searchstock"  , search);
  }

  fetchLatest(){
    return this.http.get<any>(this.uri+"/latest");
  }
  fetchSimilar(categories){
    return this.http.post<any>(this.uri+"/similar" , categories);
  }
  getImages(filters){
    return this.http.post<any>(this.uri+"/viewImg" , filters);
  }
  getCategories(id)
  {
    return this.http.post<any>(this.uri+"/categories/" ,{id : id})
  }
  removeImage(_id , imgLabel){
    return this.http.post<any>(this.uri+"/image/"+_id , {label : imgLabel});
  }
  remove(id)
  {
    return this.http.post<any>(this.uri+"/delete" , {id : id });
  }
  getFiltered(filters){
    return this.http.post<any>(this.uri+"/cash-order-products"  , filters);
  }
  
  // getFiltered(filters){
  //   return this.http.post<any>(this.uri+""  , filters);
  // } for backup
}
