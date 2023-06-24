import { Injectable } from '@angular/core';
import { Socket , SocketIoConfig } from 'ngx-socket-io';
import { AuthenticationService } from '@services/authentication.service';
import { environment } from '@environments/environment';
import * as jwt_decode from "jwt-decode";

class SocketNameSpace extends Socket{
  constructor(socketConfig : SocketIoConfig){
    super (socketConfig);
  }
}
const config: SocketIoConfig = {  url: environment.socketOptions.url, options: environment.socketOptions.options };

@Injectable({
  providedIn : 'root'
})
export class SocketService {
    defautltSocket : SocketNameSpace;
    public permissionsNS : SocketNameSpace;
    currentUser : any = {};
    notifications : SocketNameSpace;
    constructor(private _authService : AuthenticationService ) {
      this.defautltSocket=  new SocketNameSpace( config );
      this._authService.currentUserSubject.subscribe(userInfo =>{
        this.currentUser = userInfo ;
      })

    }
    init(deviceInfo){
      let error = null;
      let that = this;
      console.log("SOCKET: INIT METHOD CALLED");
      this.defautltSocket.on('connect' , ()=>{
        console.log('SOCKET: Connected to socket server' , (<any>this.defautltSocket).activity_id , " Only socket ::" , this.defautltSocket , "TToken :" , (this._authService.token || "null").substring(0 , 20 )+"..." )
        $<any>("#notificationArea").hide();        
        //Its time to authenticate
        let session = sessionStorage.getItem('session');
        this.defautltSocket.emit('authenticate' , {
          token : this._authService.token ,
          session 
        } , (authCallBackData)=>{
          if(authCallBackData.data){
            this.connectPermissionsNS( authCallBackData.data.session );
          }
          console.log("SOCKET: Auth response " , authCallBackData );
        })
      })

      
      //On authentication
      this.defautltSocket.on('authenticated', function() {
        // use the socket as usual
        console.log("SOCKET: Socket is now authenticated")
      });
 
      //If the user is unauthorized
      this.defautltSocket.on('unauthorized' , (reason) => {
        console.log("SOCKET: Unauthorized" , reason)
        error = reason.message ;
        that.disconnect();
      })

      //When user is disconnected
      this.defautltSocket.on('disconnect' , (reason)=>{
        //Client disconnected
        if(!reason.includes("client disconnect") ){
          $<any>("#notificationArea").show("slow");
        }else{
          console.log("SOCKET: Socket disconnected reason unknown" ,reason)
        }

        // console.log("disconnected ::REally" , reason)
      })

      //When activity is logged
      this.defautltSocket.on('activityLogged' , (data) => {
        console.log("SOCKET: A new activity is added" , data);
        this.defautltSocket.emit("deviceInfo" , { userAgent : deviceInfo , activity : data.activity })
      })
    }
    connectPermissionsNS(session_id){
      //Initiating permissions socket
      let permConfig : any =  { ...config, url : config.url +'/permissions'} ;
      permConfig.options.query = "token="+this._authService.token+"&session="+session_id; 
      if(!this.permissionsNS)
        {
          this.permissionsNS = new SocketNameSpace( permConfig )
          console.log("SOCKET: Connecting to Permissions NS" , permConfig )
          //When user is disconnected
          this.permissionsNS.on('connect' , ()=>{
            console.log("SOCKET: Connected to permissions namespace");

            this.permissionsNS.emit('verify' , {session_id : session_id})
            // sessionStorage.setItem("session" , session_id);
          })
          this.permissionsNS.on('permissionsChanged' , (data)=>{
            //Now we have to referesh the token
            console.log("SOCKET: New permissions :" , data.role_id );
            let currentUserInfo = jwt_decode(this.currentUser) || {};
            if(currentUserInfo && currentUserInfo.role){
              let roleIdOfCurrentUser = currentUserInfo.role.role_id
              if(roleIdOfCurrentUser == data.role_id){
                this._authService.requestNewToken();
              }
            }

          })
        }
    }
    sendMessage(msg: string){
        this.defautltSocket.emit("message", msg);
    }
    disconnect(){
      console.log("SOCKET: gonna disconnect socket")
      this.defautltSocket.disconnect();
      this.permissionsNS.disconnect();
    }
     getMessage() {
        return (<any>this.defautltSocket
            .fromEvent("message")
          ).map( data => data.msg );
    }
}
