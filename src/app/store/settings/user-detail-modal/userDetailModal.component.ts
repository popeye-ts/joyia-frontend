import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input, OnChanges, SimpleChanges} from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from '@services/user.service';
import { RoleService } from '@services/role.service';
import { NotifierService } from "angular-notifier";
import { RolesComponent } from './../roles/roles.component';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
import { orderService } from '@services/order.service';
import * as Glide from "@assets/js/vendor/glide.min.js";
import { AuthenticationService } from '@services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { PermissionService } from '@store/services/permissions.service';
declare var $: any;

@Component({
  selector : 'users-detail-modal',
  templateUrl: './userDetailModal.component.html',
  styleUrls: ['./userDetailModal.component.scss']
})

export class UserDetailModalComponent implements AfterViewInit , OnInit , OnChanges{
  serverImagesPath : any = environment.cloudinary;
  @Input() _id : string = '';
  userForm : FormGroup ;
  rsrcTitle : String = "";
  userData : any;
  requestInProgress : Boolean = false;
  fileUploadUrl : string = environment.apiUrl + "users/addImage";
  defaultProfilePic : string = 'store/t6w1rih2h59t5qxhj3md.jpg';
  assigningRole : boolean = false;
  updatingPassword : boolean = false;
  updatingPreference : boolean = false;
  enforcingLogingOut : boolean = false;
  rolesLst: any;
  dropZone : any;
  permsLst : any = [];
  isUserFormShown: boolean = false;
  selectedColor: string = "";
  password : string = "";
  currentlySelectedRole : string = "";

  constructor(private _userService:UserService  , private _roleService:RoleService , 
    private _authService: AuthenticationService , private http:HttpClient , 
    private _notifier : NotifierService ,  public _permService : PermissionService  ){
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes._id && changes._id.currentValue){
      let newId = changes._id.currentValue;
      this._id = newId;
      this.fetchUserDetail();
    }
  }

  ngOnInit(){
    this.fetchUserDetail();
  }
  fetchUserDetail(){
    let that = this;
    this._userService.getById(this._id).subscribe(response=>{
      console.log("User Info modal component :" , response)
      that.userData = response;
      //Extracting pemissions if any
      if(response && response.role && response.role.length){
        this.permsLst = response.role[0].resource || [];
      }
    } , error=>{
      console.log("we have some error in user data fetch component" , error)
    })
  }
  fetchRoles(){
    let that = this;
    this._roleService.getAll().subscribe(response=>{
      console.log("We have some response in fetch all roles users component:" , response)
      that.rolesLst = response;
    } , error=>{
      console.log("we have some error in all roles users component" , error)
    })
  }
  ngAfterViewInit() : void {

    //Fetching all the roles
    this.fetchRoles();
  }
  
  ngOnDestroy(): void {

  }
  async forceLogout(){
      try{
        this.enforcingLogingOut = true;
        let response = await this._userService.logUserOut(this._id).toPromise();
        console.log("While logging out repsonse " , response);
        
        this._notifier.notify("success" , response.message);
      }catch(err){
        console.log("An error occured in user component " , err )
        let errorMsg = err.error? err.error.error : "Something went wrong";
        this._notifier.notify("error" , errorMsg);
      }
      finally{
        this.enforcingLogingOut = false;
      }

    }
    async toggleStatus(user){
      try{
        this.assigningRole = true;
        let response = await this._userService.toggleUserStatus(user._id).toPromise();
        console.log("While toggling user repsonse " , response);
        
        this._notifier.notify("success" , response.message);
        this.fetchUserDetail();
      }catch(err){
        console.log("An error occured in user component toggling " , err )
        let errorMsg = err.error? err.error.error : "Something went wrong";
        this._notifier.notify("error" , errorMsg);
      }
      finally{
        this.assigningRole = false;
      }
    }
    addUser(){
      if(this.userForm.invalid)
      {
        return ;
      }
      this.requestInProgress = true;
  
      let that = this;
      //Extracting image
      let count = that.dropZone[0].dropzone.files.length;
      let image = '';
      for(let i=0; i < count ; i++)
      {
          image  = that.dropZone[0].dropzone.files[i].uniqueId;
      }
      //End of extraction
      let formValue = { profile_pic :  image , ...this.userForm.value};
      console.log("The user that will be added is " , this.userForm.value)
        this._userService.create(formValue)
          .subscribe(response => {
            //Taking care of after effects
            that.fetchUserDetail();
            $('.close').click();
            that.userForm.reset();
  
            //Informing user all good
            this.requestInProgress = false;
            that._notifier.notify("success" , response.message )
  
          } , err=>{
            this.requestInProgress = false;
            that._notifier.notify("error" , err.error )
          })
    }
    inpPhone(event)
    {
      let keyCode  = event.which;
      let str = event.target.value;

      if(str.length > 11 && keyCode !=8)
        {
          event.preventDefault();
          return ;
        }

      //If its not a number prvenet from writing
      if( keyCode < 48 || keyCode > 57)
        event.preventDefault();

      if(str.length == 4)
        event.target.value = str+="-";
      // console.log(event ,  , "Key code phone")
    }
    getPermString(perm : any ){
      let unWantedKeys = ["resource_id","resource_name","_id" , "resource_desc"];
      let wantedKeys = Object.keys(perm).filter(k=>!unWantedKeys.includes(k));
      let allowedPerms = wantedKeys.filter(k=>perm[k]);
      if(allowedPerms.join(" , ").trim().length == 0){
        return 'No access';
      }
      let strToReturn = `User `+allowedPerms.join(" , ");
      return strToReturn;
    }
    toggleUserForm(){
      this.isUserFormShown = !this.isUserFormShown;
    }
    loadFile(event : any) {

      let _self = this;
      var output : any = document.getElementById('profile-image');
      let file = event.target.files[0];
      output.src = URL.createObjectURL(file);
      output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
      }
      //Upload the file to the server while taking care of updation
      let access_token ;
      //Taking care of authorization
      access_token = this._authService.token;
      let session = sessionStorage.getItem('session') || '';
  
      let fd = new FormData();
      fd.append('user_id' , _self._id );
      fd.append('file' , file );
      this.http.post( _self.fileUploadUrl , fd , {
        headers : { "Authorization" : "Bearer "+access_token , session },
      } ).subscribe( (resp : any)=>{
        console.log("Response while uploading file " , resp )
        _self._notifier.notify("success" , "Image uploaded" )

      } , err=>{
        console.log("An error occured while uploading file" , err );
      });

    };
    changeRole(evt : any ){
      console.log("Change role method called" , evt.target.value )
      this.currentlySelectedRole = evt.target.value;
    }
    assignRole(){
      if(this.assigningRole){
        return ;
      }
      let role_id = this.currentlySelectedRole;
      let user_id = this._id;
      if(!role_id){
        this._notifier.notify("error" , "Please select a role to assign");
        return ;
      }
      let that = this;
      this.assigningRole = true;
      console.log("Assign role method is called" , {userid : user_id , roleid : role_id } )
      this._userService
        .assignRole({userid : user_id , roleid : role_id })
        .subscribe(resp=>{
            this._notifier.notify("success" , resp.message);
            console.log("Response in assignment role in users component", resp  );
            that.assigningRole = false;
          },err=>{
            console.log("What is err object" ,err )
            this._notifier.notify("error" , err.error ? err.error.error: "Something went wrong while assignment");
            that.assigningRole = false;
          })
    }
    async updatePreference(key : string ){
      let _self = this;
      let user_id = this._id;

      try{
        _self.updatingPreference = true;
        if(key == 'color'){
          let color = _self.selectedColor;
          let colorUpdated = await _self._userService.updatePreference({ type: key , user_id , color}).toPromise();

        }
      }catch(error){
        console.log("An error occured while updating color" , error )
      }finally{
        _self.updatingPreference = false;
      }
    }
    updateSelectedColor(evt : any) {
      console.log("Color Changed" , evt.target.value );
      this.selectedColor = evt.target.value;
    }
    async changePassword(){
      try{
        let _self = this;
        if(this.updatingPassword){
          return ;
        }
        this.updatingPassword = true ;
        let user_id = this._id;
        let userUpdated = await _self._userService.updatePassword({ password : _self.password  , user_id }).toPromise();
        console.log("User updated response "  , userUpdated );
        this._notifier.notify("success" , userUpdated.message );
      }catch(err){
        if(err && err.error && err.error.error){
          this._notifier.notify("error" , err.error.error);
        }
        console.log("An error occured"  , err );
      }
      this.updatingPassword = false ;
    }
    isAdministrator(){

    }
}
