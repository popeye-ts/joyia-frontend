import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as jwt_decode from "jwt-decode";
import { AuthenticationService } from '@services/authentication.service';

@Injectable({providedIn : 'root'})
export class PermissionService {

  token : String ;
  resources : any[]  = [];
  actions : String[] = ["add" , "view" , "edit" , "delete" , "approve_reject" , "assign_forward" ];
  constructor(private _authService : AuthenticationService){
    this.refreshToken()
  }
  //refresh token
  refreshToken(token = null){
    if(token == null )
      {
        this._authService.currentUser.subscribe(token=>{
        this.token = token;
        if(this.token)
          {
            let decodedToken =  jwt_decode(this.token)
            console.log("gonna set the new token in permission service" , decodedToken);
            //Now we have all the resources permitted for this user
            this.resources = decodedToken.resources || [];
          }
        })
      }else{
        let decodedToken =  jwt_decode(token)
        // console.log("gonna set the new token in permission service" , decodedToken);
        //Now we have all the resources permitted for this user
        this.resources = decodedToken.resources || [];
      }
  }
  validResource(rsrcString){
    // console.log("In Valid resource nethod" , this.resources);

    return this.resources.some(rsrc => rsrc.name == rsrcString )
  }

  public hasPermission(resource : String , type : String) : Boolean
  {
    let isPermitted = false ;
    //for multiple types
    // we will have something like add|view|edit|delete
    let permissionsRequested = type.split("|")
    if(permissionsRequested.length  && this.validResource(resource) )
    {
      //check valid permission types passed
      let isInvalidType = permissionsRequested.some(type => this.actions.indexOf(type) == -1)
      if(isInvalidType)
      {
        console.error("Invalid type passed as string in perm file " , type ,resource)
      }else{
        //Valid type passed and valid resource string passed So
        this.resources.forEach(rsrc => {
          if(rsrc.name === resource )
            {
              //We have to check this resource against permission types
              isPermitted = permissionsRequested.some(type => rsrc.perm[this.actions.indexOf(type)] )
            }
          }
        )
      }
    }else{
      console.error("Invalid type passed as string in perm file " , permissionsRequested , "or resource issue " , resource )
    }
    // console.log("permission requested " , permissionsRequested  , "Resource" , resource , " result" , isPermitted)

    return isPermitted;
  }

}
