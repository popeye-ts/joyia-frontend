import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input, SimpleChanges, OnChanges} from '@angular/core';
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
  selector : 'user-form',
  templateUrl: './userForm.component.html',
  styleUrls: ['./userForm.component.scss']
})

export class UserFormComponent implements AfterViewInit , OnInit , OnChanges{
  serverImagesPath : any = environment.cloudinary;
  @Input() _id : string = '';
  userForm : FormGroup ;
  rsrcTitle : String = "";
  @Input() userData : any;
  requestInProgress : Boolean = false;
  fileUploadUrl : string = environment.apiUrl + "users/addImage";
  defaultProfilePic : string = 'store/t6w1rih2h59t5qxhj3md.jpg';
  assigningRole : boolean = false;
  enforcingLogingOut : boolean = false;
  rolesLst: any;
  dropZone : any;
  isAddForm : boolean = true;

  constructor(private _userService:UserService  , private _roleService:RoleService , private fb:FormBuilder ,
    private _notifier : NotifierService  ){
      this.userForm = this.fb.group({
        firstname: [''  , [Validators.required , Validators.minLength(3) ]],
        lastname : [''  , [Validators.required , Validators.minLength(3) ]],
        email : [{value : '' , disabled : true}  , [Validators.required , Validators.email ]],
        phone : [''  , [Validators.required , Validators.minLength(12),Validators.maxLength(12) ]],
        username: [{value : '' , disabled : true}  , [Validators.required , Validators.minLength(3) ]],
        activation_status : ['Enabled'  , [ Validators.required ]]
      });
  }

  ngOnInit(){
    if(this._id){
      this.fetchUserDetail();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes._id && changes._id.currentValue){
      let newId = changes._id.currentValue;
      this._id = newId;
      this.isAddForm = false;
      this.fetchUserDetail();
    }
    if(changes && changes.userData && changes.userData.currentValue){
      this.userData = changes.userData.currentValue;
      this.userForm.patchValue(this.userData);
      this.isAddForm = false;
    }
    console.log("got some data " , changes );
  }
  fetchUserDetail(){
    let that = this;
    this._userService.getById(this._id).subscribe(response=>{
      console.log("User Info modal component :" , response)
      that.userData = response;
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
    async updateUser(){
      try{
        if(this.userForm.invalid || this.requestInProgress)
        {
          return ;
        }
        this.requestInProgress = true;
    
        let _self = this;
        let { activation_status , firstname , lastname , phone , ...other } =  this.userForm.getRawValue();
        let userUpdated = await this._userService.update(this.userData._id , { activation_status  , firstname , lastname , phone }).toPromise();

        this._notifier.notify("success" , "User updated");
      }catch(error){
        this._notifier.notify("error" , error);
      }finally{
        this.requestInProgress = false;
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

}
