import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input, OnChanges, SimpleChanges} from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from '@services/user.service';
import { RoleService } from '@services/role.service';
import { NotifierService } from "angular-notifier";
import { environment } from '@environments/environment';
import { AuthenticationService } from '@services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { ResourceService } from '@store/services/resource.service';
declare var $: any;

@Component({
  selector : 'resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})

export class ResourceComponent implements AfterViewInit , OnInit {
  serverImagesPath : any = environment.cloudinary;
  @Input() _id : string = '';
  rsrcTitle : String = "";
  requestInProgress : Boolean = false;
  fileUploadUrl : string = environment.apiUrl + "users/addImage";
  defaultProfilePic : string = 'store/t6w1rih2h59t5qxhj3md.jpg';
  resourceLst: any = [];

  constructor(private _userService:UserService  , private _resourceService:ResourceService , private _authService: AuthenticationService ,
    private http:HttpClient , private _notifier : NotifierService  ){
  }
  

  ngOnInit(){
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
    this.fetchResources();
  }
  
  ngOnDestroy(): void {

  }
}
