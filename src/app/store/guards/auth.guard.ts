import { Injectable } from '@angular/core';
import { Router , CanActivate , ActivatedRouteSnapshot , RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '@services/authentication.service';

@Injectable({ providedIn : 'root' })
export class AuthGuard implements CanActivate{
  constructor(private router : Router , private _authService : AuthenticationService ){

  }
  canActivate(route : ActivatedRouteSnapshot , state : RouterStateSnapshot){
    const currentUser  = this._authService.token
    if(currentUser){
      //check if the route is restricted by role
      if(route.data.roles && route.data.roles.indexOf(currentUser.role) === -1){
          //Role nnot authorized so redirect to home page
          this.router.navigate(['/'])
          return false
      }

      //Authorized so return true
      return true
    }

    //Not logged in so redirect to login page with the return url
    this.router.navigate(['/login'] , { queryParams : { returnUrl : state.url} })
    return false
  }
}
