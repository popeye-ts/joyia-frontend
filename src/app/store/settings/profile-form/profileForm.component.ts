import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input, OnChanges, SimpleChanges} from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from '@services/user.service';
import { RoleService } from '@services/role.service';
import { NotifierService } from "angular-notifier";
import { environment } from '@environments/environment';
import { AuthenticationService } from '@services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { ResourceService } from '@store/services/resource.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;

@Component({
  selector : 'profile',
  templateUrl: './profileForm.component.html',
  styleUrls:  ['./profileForm.component.scss']
})

export class ProfileFormComponent implements AfterViewInit , OnInit {
  serverImagesPath : any = environment.cloudinary;
  rsrcTitle : String = "";
  requestInProgress : Boolean = false;
  fileUploadUrl : string = environment.apiUrl + "users/addImage";
  defaultProfilePic : string = 'store/t6w1rih2h59t5qxhj3md.jpg';
  resourceLst: any = [];
  userForm : FormGroup ;

  constructor(private _userService:UserService  , private _resourceService:ResourceService , private _authService: AuthenticationService ,
    private http:HttpClient , private _notifier : NotifierService ,  private fb:FormBuilder ){
      this.userForm = this.fb.group({
        firstname: [''  , [Validators.required , Validators.minLength(3) ]],
        lastname : [''  , [Validators.required , Validators.minLength(3) ]],
        email : [{value : '' , disabled : true}  , [Validators.required , Validators.email ]],
        phone : [''  , [Validators.required , Validators.minLength(12),Validators.maxLength(12) ]],
        username: [{value : '' , disabled : true}  , [Validators.required , Validators.minLength(3) ]],
      });
  }
  

  ngOnInit(){
  }
  fetchUserDetail(){
    let that = this;
    this._userService.getProfileInfo().subscribe(response=>{
      console.log("Get my profile " , response );
      this.userForm.patchValue(response);
    } , error=>{
      console.log("we have some error in user data fetch component" , error)
    })
  }
  fetchResources(){
    let that = this;
    this._resourceService.getAll().subscribe(response=>{
      console.log("We have some response in fetch all resources:" , response)
      that.resourceLst = response;
    } , error=>{
      console.log("we have some error in all resources users component" , error)
    })
  }
  ngAfterViewInit() : void {

    //Fetching all the resources
    this.fetchUserDetail();
  }
  
  ngOnDestroy(): void {

  }
  async updateUser(){
    try{
      if(this.userForm.invalid || this.requestInProgress)
      {
        return ;
      }
      this.requestInProgress = true;
  
      let _self = this;
      let { firstname , lastname , phone , ...other } =  this.userForm.getRawValue();
      let userUpdated = await this._userService.updateMyProfile({ firstname , lastname , phone }).toPromise();

      this._notifier.notify("success" , "User updated");
    }catch(error){
      this._notifier.notify("error" , error);
    }finally{
      this.requestInProgress = false;
    }
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
