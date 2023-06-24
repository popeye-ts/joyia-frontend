import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from './../UI/ToolTip/tooltip';
import { ReactiveFormsModule  } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { Select2Module , Select2OptionData } from 'ng2-select2';
import { RoutingModule } from './../routing/routing.module';
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { customNotifierOptions } from "./../UI/Toaster/notifier";
import { MomentModule } from "angular2-moment";
import { DataTablesModule } from 'angular-datatables';
import {ProgressBarModule} from "angular-progress-bar";
import { UIModule } from "@ui/ui.module";

import { UsersComponent } from "./users/users.component";
import { RolesComponent } from "./roles/roles.component";
import { UsersListComponent } from './users-list/usersLst.component';
import { UserDetailModalComponent } from './user-detail-modal/userDetailModal.component';
import { UserFormComponent } from './user-form/userForm.component';
import { ResourceComponent } from './resource/resource.component';
import { ProfileFormComponent } from './profile-form/profileForm.component';

@NgModule({
  declarations: [ UsersComponent , ResourceComponent , UsersListComponent , UserDetailModalComponent , RolesComponent , UserFormComponent , ProfileFormComponent ],
  imports: [
    NotifierModule.withConfig(customNotifierOptions) ,
    FormsModule ,
    CommonModule,
    ReactiveFormsModule ,
    Select2Module ,
    RoutingModule,
    TooltipModule ,
    MomentModule,
    DataTablesModule,
    ProgressBarModule,
    UIModule
  ],
  exports : [
    UsersComponent ,
    ProfileFormComponent
  ]
})
export class SettingsModule { }
