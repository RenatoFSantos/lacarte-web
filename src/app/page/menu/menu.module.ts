import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuRoutingModule } from './menu-routing.module';
import { MenuListComponent } from './menu-list/menu-list.component';
import { MenuFormComponent } from './menu-form/menu-form.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    MenuListComponent,
    MenuFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MenuRoutingModule
  ]
})
export class MenuModule { }
