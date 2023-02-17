import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddressRoutingModule } from './address-routing.module';
import { AddressListComponent } from './address-list/address-list.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    AddressListComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AddressRoutingModule
  ]
})
export class AddressModule { }
