import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ClientComponent } from './Client/client.component';
import { ClientFormComponent } from './ClientForm/clientform.component';
import { DataTablesModule } from 'angular-datatables';
import { UIModule } from '@ui/ui.module';

@NgModule({
  declarations: [
    ClientComponent,
    ClientFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
    UIModule
  ]
})
export class ClientsModule { }
