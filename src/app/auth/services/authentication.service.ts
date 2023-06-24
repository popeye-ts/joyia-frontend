import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject , Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '@models/user';
import { environment}  from '@environments/environment';

@Injectable({providedIn : 'root'})
export class AuthenticationService {
  private currentUserSubject : BehaviorSubject<User>;
  public currentUser : Observable<User>;
  uri =  environment.apiUrl+"auth";

  constructor(private http : HttpClient ){
    try{
      this.currentUserSubject = new BehaviorSubject<User> (JSON.parse(localStorage.getItem('currentUser')))
      this.currentUser = this.currentUserSubject.asObservable()
    }catch(err)
      {
        console.log("An error occure while instantiating the authentication service " , err)
      }
  }

  public get currentUserValue() : User {
    return this.currentUserSubject.value
  }

  login(username : string, password : string ){
    return this.http.post<any>(`${this.uri}/authenticate` , { username , password })
    .pipe(map( user => {
      //Login successfull if there's a jwt token in the response
      if(user && user.token)
        {
          //store user details and jwt token in local storage to keep user logged in between page refreshes
          console.log("GONNA_SET_TOKEN Auth service login.code#732342@#$ " , user )

          localStorage.setItem('access_token' , user.token );
          sessionStorage.setItem('session' , user.session );
          this.currentUserSubject.next(user)
        }

      return user;
    }))
  }
  public refreshToken(){
    try{

      // console.trace();
      console.log("GONNA_SET_TOKEN refreshToken.code#893435@#$ "  )

      let access_token =<any> localStorage.getItem('access_token') || "Bearer "
      this.currentUserSubject.next(access_token)
    }catch(exc){
      console.log("In root auth service error set Token method" , exc)
    }

  }
  logout(){
      console.log("GONNA_SET_TOKEN logout.code#72432@#$ "  )
    
      //remove user from local storage to log user out
      localStorage.clear();
      sessionStorage.clear();
      this.currentUserSubject.next(null)
  }

}
