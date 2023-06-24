import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class CommentsService{
  uri =  environment.apiUrl+"comments";
  //Each component will pass collection variable 
  //So to proceed further we need this variable as collection reference
  constructor(private http:HttpClient){

  }
  create( collection , formData)
  {
    return this.http.post<any>(this.uri+"/create/"+collection , formData);
  }
  update( collection , _id , formData )
  {
    return this.http.post<any>(this.uri+"/update/"+collection+"/"+_id , formData);
  }
  deleteComment(collection , _id   ){
    return this.http.post<any>(this.uri+"/delete" , {id :_id} );
  }
  getAll(collection , _id){
    //Fetch all comments of particular collection/table from particular collection
    return this.http.post<any>(this.uri+"/"+collection , { _id : _id });
  }
}
