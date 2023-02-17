import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PromotionRoutingModule } from './promotion-routing.module';
import { PromotionListComponent } from './promotion-list/promotion-list.component';
import { PromotionFormComponent } from './promotion-form/promotion-form.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    PromotionListComponent,
    PromotionFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PromotionRoutingModule
  ]
})
export class PromotionModule { }
