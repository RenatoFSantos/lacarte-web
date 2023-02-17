import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SegmentRoutingModule } from './segment-routing.module';
import { SegmentListComponent } from './segment-list/segment-list.component';
import { SegmentFormComponent } from './segment-form/segment-form.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    SegmentListComponent,
    SegmentFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SegmentRoutingModule
  ]
})
export class SegmentModule { }
