import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , SkipSelf} from '@angular/core';
import { Subject } from 'rxjs';
import { NotifierService } from "angular-notifier";

import { RoleService } from '@services/role.service';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup  } from '@angular/forms';

import { orderService } from '@services/order.service';
import * as Glide from "@assets/js/vendor/glide.min.js";

@Component({
  selector : 'roleSettings',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})

export class RolesComponent implements AfterViewInit , OnInit{
  pageData : any;
  RoleForm : FormGroup ;
  active : Number ;
  serverImagesPath : any = environment.cloudinary;
  rsrcTitle : String = "";
  roleData : any;
  constructor(@SkipSelf() private _roleService:RoleService  ,
   private fb:FormBuilder , private _orderService : orderService ,
   private _notifier : NotifierService){
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
  ngOnInit(){
    let that = this ;
    this.fetchRoles();
      // this.ProductForm = this.fb.group({
    //   name: ['check'],
    //   strengths: ['ok']
    //   , type: ['']
    //   , description:['']
    // });
  }
  fetchRoles(){
    let that = this;
    this._roleService.getAll().subscribe(response=>{
      console.log("We have some response in fetch all roles compoennt:" , response)
      that.roleData = response;

    } , error=>{
      console.log("we have some error in all roles fetch component" , error)
    })
  }
  ngAfterViewInit() : void {


  }
  ngOnDestroy(): void {

  }
  permChange(event , type)
  {
    let that = this;
    let isPermitted = event.target.checked;
    let id = event.target.attributes.data.nodeValue;
    let data = { type : type , isPermitted : isPermitted };

    this._roleService.update(id , data )
      .subscribe(response=>{
        that._notifier.notify("success" , response.message )
      } , err=>{
        that._notifier.notify("danger" , err.error )
      })
  }
  //This method makes sure the type of permissions
  //If it is type of approval then return true
  //Other wise reqturn false
  isApprovalType(obj){
    if(Object.keys(obj).includes('can_approve_reject')){
      return true;
    }
    return false;
  }
  isAssignForwardType(obj){
    if(Object.keys(obj).includes('can_assign_forward')){
      return true;
    }
    return false;
  }
}
