import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FidelityRoutingModule } from './fidelity-routing.module';
import { FidelityListComponent } from './fidelity-list/fidelity-list.component';
import { FidelityFormComponent } from './fidelity-form/fidelity-form.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    FidelityListComponent,
    FidelityFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FidelityRoutingModule
  ]
})
export class FidelityModule { }
