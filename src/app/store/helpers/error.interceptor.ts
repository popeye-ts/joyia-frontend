import { Injectable } from '@angular/core';
import { HttpRequest , HttpHandler , HttpEvent , HttpInterceptor } from '@angular/common/http';
import { Observable , throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '@services/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor{
  constructor(private _authService : AuthenticationService ){

  }
  intercept(request : HttpRequest<any> , next : HttpHandler) : Observable<HttpEvent<any>>{
    return next.handle(request).pipe(catchError(err => {
      if([401,403].indexOf(err.status) !== -1 )
      {
        //Auto logout if the response from api is 401 Un-Authorized or 403 Forbidden
        this._authService.logout()
        location.reload()
      }

      const error = err.error.message || err.statusText
      return throwError(error)
    }))

  }
}
