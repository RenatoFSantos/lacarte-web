import { SegmentFormComponent } from './segment-form/segment-form.component';
import { SegmentListComponent } from './segment-list/segment-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: SegmentListComponent},
  { path: 'new', component: SegmentFormComponent},
  { path: ':id/edit', component: SegmentFormComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SegmentRoutingModule { }
