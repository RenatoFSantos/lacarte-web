import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FidelityFormComponent } from './fidelity-form/fidelity-form.component';
import { FidelityListComponent } from './fidelity-list/fidelity-list.component';

const routes: Routes = [
  { path: '', component: FidelityListComponent },
  { path: 'new', component: FidelityFormComponent },
  { path: ':id/edit', component: FidelityFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FidelityRoutingModule { }
