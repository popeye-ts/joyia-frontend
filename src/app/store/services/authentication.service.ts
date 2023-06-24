import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject , Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RootAuthenticationService } from '@/services/rootauthentication.service'
import { environment}  from '@environments/environment';
import * as jwt_decode from "jwt-decode";

@Injectable({providedIn : 'root'})
export class AuthenticationService {
  public currentUserSubject : BehaviorSubject<any> =  new BehaviorSubject<any> (null);
  public currentUser : Observable<any>;
  uri =  environment.apiUrl+"auth";

  constructor(private http : HttpClient , private _rootAuthService : RootAuthenticationService){
    this._rootAuthService.currentUser.subscribe(token=>{
      try{
        let tokenLocal = localStorage.getItem('access_token')
        console.log("Root auth changed" , (token || "null").substring(0 , 20 )+"..."  , "---" , (tokenLocal || "null").substring(0 , 20 )+"..." )

        // console.log("In store auth service access constructor ::" , jwt_decode(token) )
        this.currentUserSubject.next(tokenLocal)
        this.currentUser = this.currentUserSubject.asObservable()
      }catch(err){

      }
    })
  }
  validateToken(){
    return this.http.post<any>(`${this.uri}/validate` , { token : this.token})
  }
  public get token()  {
    return this.currentUserSubject.value;
  }

  refreshToken(){
    try{
      let token = localStorage.getItem('access_token')
      console.log("In store new token in auth service refresh ::"   , token )
      console.log("Refresh token " , jwt_decode(token) )
      this.currentUserSubject.next(token)
      this._rootAuthService.refreshToken();
    }catch(err){

    }
  }
  requestNewToken(){
    let that = this;
    this.http.post<any>(`${this.uri}/requestNewToken` , {})
      .subscribe(
        resp=>{
            if(resp && resp.token)
              {
                console.log("GONNA_SET_TOKEN What i have in reposinse.code#248@#$ " , resp )
                that.currentUserSubject.next(resp.token); 
                localStorage.setItem('access_token' , resp.token)
                this._rootAuthService.refreshToken();
              }
            console.log("New token recieved" , jwt_decode(that.currentUserSubject.value) )
        } ,
        err=>{
          console.log("While requesting error" , err)

        })
  }
  logout(){
    try{
    console.log("GONNA_SET_TOKEN logout.code#253346#@#$ "  )
      
      //remove user from local storage to log user out
      localStorage.clear();
      sessionStorage.clear();

      this.currentUserSubject.next(null);
    }catch(err){

    }
  }

}
