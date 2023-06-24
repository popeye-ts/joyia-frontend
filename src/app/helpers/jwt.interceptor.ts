import { Injectable } from '@angular/core';
import { HttpRequest , HttpHandler , HttpEvent , HttpInterceptor } from '@angular/common/http';
import { Observable, timer, throwError, of } from 'rxjs';
import { retryWhen, tap, mergeMap } from 'rxjs/operators';

import * as jwt_decode from "jwt-decode";

import { RootAuthenticationService } from '@/services/rootauthentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  retryDelay = 2000;
  retryMaxAttempts = 6;
  customErrorsRange =  ['401-402',  '500-510','510-520'];
  constructor (private _authService : RootAuthenticationService ){
  }

  intercept( request : HttpRequest <any> , next : HttpHandler ): Observable <HttpEvent<any>> {
    //add authorization header with jwt token if available
    // console.log("In interceptor")
    try {
      let token = this._authService.token
      // console.log("In interceptor token ::" , token )
      // console.log("In interceptor token value ::" , jwt_decode(token) , token )

      if(token)
      {
        request = request.clone({
          setHeaders : {
            Authorization : `Bearer ${token}`
          }
        })
      }
      let session =  (sessionStorage.getItem("session") || false );
      if(session)
      {
        request = request.clone({
          setHeaders : {
            session : session
          }
        })
      }
    } catch (error) {
      console.log("Error occured in interceptor" , error)
    }

    return next.handle(request)
      .pipe(
        this.retryAfterDelay(),
      );
  }
  retryAfterDelay(): any {
    let that = this;
    return retryWhen(errors => {
      return errors.pipe(
        mergeMap((err, count) => {
          let customErrorOccured = false;
          //In case error is occured because of user
          if(err.url.includes("auth/validate")  || err.url.includes("auth/authenticate")){
            customErrorOccured = true;
          }
          //defined errors from server then don't try again
          this.customErrorsRange.forEach(errRange => {
              //Since custom error range has two counterparts
              let rangeArrIncomplete = errRange.split("-");

              //Make sure thayt each element is casted to integer
              rangeArrIncomplete = rangeArrIncomplete.map(errorStatus => (errorStatus));

              //Using helper to fill in the missing elements
              let rangeArrFilled = this.range(parseInt(rangeArrIncomplete[0]) , parseInt(rangeArrIncomplete[1]) );
              if(err.status == 402){
                console.log("GONNA_SET_TOKEN interceptor.code#264#@#$ "  )

                localStorage.removeItem('currenUser');
                localStorage.removeItem('access_token');
                window.location.reload()
              }
              if ( rangeArrFilled.includes(err.status) )
                customErrorOccured = true;
          })
          // throw error when we've retried ${retryMaxAttempts} number of times and still get an error

          if (count === this.retryMaxAttempts || customErrorOccured) {
            return throwError(err);
          }
          return of(err).pipe(
            tap(error => console.log(`Retrying ${error.url}. Retry count ${count + 1}`)),
            mergeMap(() => timer(this.retryDelay))
          );
        })
      );
    });
  }
  //A helper method which creates a range/array between two numbers
  range(start, end) {
    if(start === end) return [start];
    return [start, ...this.range(start + 1, end)];
  }

}
