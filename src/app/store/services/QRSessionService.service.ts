import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class QRSessionService{
  uri =  environment.apiUrl+"qr-session";

  constructor(private http:HttpClient){}
  create(formData)
  {
    return this.http.post<any>(this.uri+"/create" , formData);
  }
  createForm(formData)
  {
    return this.http.post<any>(this.uri+"/create-form" , formData);
  }
  update(_id , formData)
  {
    return this.http.post<any>(this.uri+"/update/"+_id , formData);
  }
  get(filters){
    console.log("GET METHOD " , filters );
    return this.http.post<any>(this.uri+"/getFiltered"  , filters);
  }
  getList(){
    return this.http.get<any>(this.uri+"/getlist");
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
  // Get inventory form from session id
  getForm(id: string) {
    return this.http.post<any>(this.uri+"/get-form" ,{id : id})
  }
  getInventoryForm(id : string ){
    return this.http.get<any>(this.uri+"/getInventoryForm/" +id )
  }

  // getFiltered(filters){
  //   return this.http.post<any>(this.uri+""  , filters);
  // } for backup
}
