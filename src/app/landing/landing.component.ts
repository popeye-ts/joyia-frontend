import { Component , AfterViewInit} from "@angular/core";
import { StateService } from '@uirouter/angular';
import {RootAuthenticationService } from './../services/rootauthentication.service'

@Component ({
  selector : 'app-root',
  templateUrl : './landing.component.html',
  styleUrls : ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit{
  constructor(private $state : StateService , private _authService : RootAuthenticationService ){
    let token = localStorage.getItem('access_token');
    console.log("Landing component Access token i have " , (token || "null").substring(0,20)+"..." );
    window.onstorage = () => {
      console.log("WINDOW_ONSTORAGE Token changed:::\r\n" , localStorage.getItem("access_token") );      
    }
    const queryString = window.location.hash;
    let urlParts = queryString.split("#/");

    //validate the token from the server
    this._authService.validateToken().subscribe(resp => {
        //Check if we have token in response

        //if so then we can set the new token in  auth service
        if(resp && resp.token )
          {
            try{
              console.log("GONNA_SET_TOKEN landing component.code#264#@#$ " , resp )

              localStorage.removeItem('access_token')

              // this.toastr.success("Login success" , '')
              localStorage.setItem('access_token' , resp.token );
              sessionStorage.setItem('session' , resp.session );
            }catch(exc){
              console.log("An exception occured in landing component" ,exc);
            }
            //requesting auth service to refreshToken
            this._authService.refreshToken()
          }
        //Getting the browser

        this.$state.go('store.dashboard')
        setTimeout(()=>{
          if(urlParts.length > 1){
            let route = urlParts[1] || "";
            if(route.trim().length> 4){
              window.location.href = window.location.origin+'/#/'+route;
            }
          }
          console.log("URL ON PAGE LOAD " , queryString  , urlParts);  
        } , 1000)
    
    } , err => {
        console.log("Error occured while validating" , err)
        this.$state.go('login')
    })
    // console.log(this.getBrowserName()," :  :browser name")

  }
  ngAfterViewInit(){

  }
    public getBrowserName() {
      const agent = window.navigator.userAgent.toLowerCase()
      switch (true) {
        case agent.indexOf('edge') > -1:
          return 'edge';
        case agent.indexOf('opr') > -1 && !!(<any>window).opr:
          return 'opera';
        case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
          return 'chrome';
        case agent.indexOf('trident') > -1:
          return 'ie';
        case agent.indexOf('firefox') > -1:
          return 'firefox';
        case agent.indexOf('safari') > -1:
          return 'safari';
        default:
          return 'other';
      }
  }
}
