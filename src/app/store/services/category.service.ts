import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class categoryService{
  uri =  environment.apiUrl+"category";
  allCatUri = "assets/data/categories.json";

  constructor(private http:HttpClient){}
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
  //fetch all labels and icons
  fetchIcons(){
    return this.http.get<any>(this.allCatUri);
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  search(query){
    return this.http.post<any>(this.uri+"/search" , {search : query});
  }
  deleteCategory(ids){
    return this.http.post<any>(this.uri+"/delete" , {ids : ids })
  }
}
