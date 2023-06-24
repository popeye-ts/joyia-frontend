import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input} from '@angular/core';
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
declare var $: any;

@Component({
  selector : 'users-list',
  templateUrl: './usersLst.component.html',
  styleUrls: ['./usersLst.component.scss']
})

export class UsersListComponent implements AfterViewInit , OnInit{
  serverImagesPath : any = environment.cloudinary;
  rsrcTitle : String = "";
  usersLst : any;
  requestInProgress : Boolean = false;
  fileUploadUrl : string = environment.apiUrl + "users/addImage";
  defaultProfilePic : string = 'store/t6w1rih2h59t5qxhj3md.jpg';
  assigningRole : boolean = false;
  enforcingLogingOut : boolean = false;
  rolesLst: any;
  selectedUserId: string = null;

  constructor(private _userService:UserService  , private _roleService:RoleService ,
    private _notifier : NotifierService  ){
  }

  ngOnInit(){
    this.fetchUserDetail();
  }
  fetchUserDetail(){
    let that = this;
    this._userService.getAll().subscribe(response=>{
      console.log("We have some response in fetch all users compoennt:" , response)
      that.usersLst = response;

    } , error=>{
      console.log("we have some error in all users fetch component" , error)
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

  
  
    
    async forceLogout(id){
      try{
        this.enforcingLogingOut = true;
        let response = await this._userService.logUserOut(id).toPromise();
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
    async viewDetail(_id : string){
      try{
        this.selectedUserId = _id;
        $("#UserDetailModal").modal("show");
      }catch(error){
        console.log("An error occured while fetching details" , error );
      }
    }
}
