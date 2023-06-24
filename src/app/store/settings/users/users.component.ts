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
import { v4 as uuidv4 } from 'uuid';
import { AuthenticationService } from '@services/authentication.service';
import { HttpClient } from '@angular/common/http';
declare var $: any;

@Component({
  selector : 'userSettings',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent implements AfterViewInit , OnInit{
  @ViewChild(RolesComponent , {static :false}) rolesChild  : RolesComponent;
  pageData : any;
  RoleForm : FormGroup ;
  active : Number ;
  serverImagesPath : any = environment.cloudinary;
  rsrcTitle : String = "";
  usersData : any;
  currentlySelected : String = "User";
  requestInProgress : Boolean = false;
  roleData : any;
  fileUploadUrl : string =environment.apiUrl+"users/addImage";
  defaultProfilePic : string = 'store/t6w1rih2h59t5qxhj3md.jpg';

  assigningRole : boolean = false;
  enforcingLogingOut : boolean = false;
  dropZone: any;
  userForm: FormGroup;
  fileKey: any;

  constructor(private _userService:UserService  , private fb:FormBuilder , private http:HttpClient ,
    private _orderService : orderService , private _roleService:RoleService ,
    private _notifier : NotifierService ,  private _authService: AuthenticationService , private notifier: NotifierService ){
    this.pageData = {
      title: 'User Settings',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Users'
        },
        {
          title: 'Roles'
        }
      ]
    };
    this.active = 1;

  }

  showModal(){
    $("#FormModal").modal("show");
    let that = this ;
    let access_token ;
    //Taking care of authorization
    access_token = this._authService.token;
    let session = sessionStorage.getItem('session') || '';

    console.log("Dropzone " , (<any>$()).dropzone  , " ---  " ,  $.dropzone );
    if (this.currentlySelected=='User' && !$(".dropzone").hasClass("disabled") ) {
      console.log("Dropzone " , (<any>$(".dropzone").length) );
      let dropzone = (<any>$(".dropzone").length);

      if(!dropzone){
        that.dropZone = (<any>$(".dropzone")).dropzone({
          url: that.fileUploadUrl ,
          maxFiles:1,
          headers : { "Authorization" : "Bearer "+access_token , session },
          init: function () {
            this.on("maxfilesexceeded", function(file) {
              this.removeAllFiles();
              this.addFile(file);
            });
            this.on("addedfile" , function(file){
              that.requestInProgress = true;
            });
            this.on("success", function (file, responseText) {
              that.notifier.notify("success", "File Uploaded." );
              let count = that.dropZone[0].dropzone.files.length;
              for(let i=0; i < count ; i++)
              {
                if(that.dropZone[0].dropzone.files[i].name == file.name){
                  that.dropZone[0].dropzone.files[i].uniqueId = responseText.id;
                }
              }
              that.requestInProgress = false;

            });
            this.on("error", function (file, error) {
              that.notifier.notify("error", error );
              that.requestInProgress = false;

            });
          },
          thumbnailWidth: 160,
          previewTemplate: '<div class="dz-preview dz-file-preview mb-3" id="dzPreview"><div class="d-flex flex-row "><div class="p-0 w-30 position-relative"><div class="dz-error-mark"><span><i></i></span></div><div class="dz-success-mark"><span><i></i></span></div><div class="preview-container"><img data-dz-thumbnail class="img-thumbnail border-0" /><i class="simple-icon-doc preview-icon" ></i></div></div><div class="pl-3 pt-2 pr-2 pb-1 w-70 dz-details position-relative"><div><span data-dz-name></span></div><div class="text-primary text-extra-small" data-dz-size /><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div><div class="dz-error-message"><span data-dz-errormessage></span></div></div></div><a href="#/" class="remove removeFileIcon" data-dz-remove><i class="glyph-icon simple-icon-trash"></i></a></div>'
        });
      }
    }
  }
  ngOnInit(){
    let that = this ;
    let access_token ;
    //Taking care of authorization
      access_token = this._authService.token;
    this.fetchUserDetail();
    this.userForm = this.fb.group({
      img : ['' ],
      firstname: [''  , [Validators.required , Validators.minLength(3) ]],
      lastname : [''  , [Validators.required , Validators.minLength(3) ]],
      email : [''  , [Validators.required , Validators.email ]],
      phone : [''  , [Validators.required , Validators.minLength(12),Validators.maxLength(12) ]],
      username: [''  , [Validators.required , Validators.minLength(3) ]],
      password: [''  , [Validators.required , Validators.minLength(4) ]]
    });

    this.RoleForm = this.fb.group({
      name: ['' , [Validators.required , Validators.minLength(3) ] ],
      description : ['' , [Validators.required , Validators.minLength(10)] ]
    });


  }
  fetchUserDetail(){
    let that = this;
    this._userService.getAll().subscribe(response=>{
      console.log("We have some response in fetch all users compoennt:" , response)
      that.usersData = response;

    } , error=>{
      console.log("we have some error in all users fetch component" , error)
    })
  }
  fetchRoles(){
    let that = this;
    this._roleService.getAll().subscribe(response=>{
      console.log("We have some response in fetch all roles users component:" , response)
      that.roleData = response;

    } , error=>{
      console.log("we have some error in all roles users component" , error)
    })
  }
  setSelected(str){
      switch (str) {
        case 'users':
          this.currentlySelected = "User";
          break;
        case 'roles':
          this.currentlySelected = "Role";
            break;
        case 'resources':
          this.currentlySelected = "Resource";
              break;
      }
  }
  ngAfterViewInit() : void {
    let that = this;

    //Fetching all the roles
    this.fetchRoles();
  }
  ngOnDestroy(): void {

  }
  addRole(){
      //getting the dropzone files
      // let dropzoneFiles = this.dropZone[0].dropzone.files
      // let tmpDrp = dropzoneFiles.map(img => img.uniqueId )
      // console.log("Files selected :::" , tmpDrp);
      if(this.RoleForm.invalid)
      {
        return ;
      }
      this.requestInProgress = true;
      let that = this;
      console.log("The role that will be added is " , this.RoleForm.value)
        this._roleService.create(this.RoleForm.value)
          .subscribe(response => {
            that.rolesChild.fetchRoles();
            this.requestInProgress = false;
            that._notifier.notify("success" , response.message);
            that.RoleForm.reset();

            $(".close").click();
          } , err=>{
            this.requestInProgress = false;
            that._notifier.notify("error" , err.error )
            console.error("Error from server in role" , err)
          })
  }
  addUser(){
    if(this.userForm.invalid)
    {
      return ;
    }
    this.requestInProgress = true;

    let that = this;
    //Extracting image
    if(!this.fileKey){
      that._notifier.notify("error" , "Please select an image");
      return;
    }
    let image = this.fileKey;
    
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
    loadFile(event : any) {

      let _self = this;
      let uniqueId = uuidv4();
      var output : any = document.getElementById('profile-image-new');
      console.log("FYI output file div " , output );
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
      // fd.append('user_id' , uniqueId );
      fd.append('file' , file );
      this.http.post( _self.fileUploadUrl , fd , {
        headers : { "Authorization" : "Bearer "+access_token , session },
      } ).subscribe( (resp : any)=>{
        console.log("Response while uploading file " , resp )
        _self.fileKey = resp.data.id;
        _self._notifier.notify("success" , "File has been uploaded" )
      } , err=>{
        console.log("An error occured while uploading file" , err );
      });

    };
}
