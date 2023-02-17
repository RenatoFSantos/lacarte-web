import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromotionFormComponent } from './promotion-form/promotion-form.component';
import { PromotionListComponent } from './promotion-list/promotion-list.component';

const routes: Routes = [
  { path: '', component: PromotionListComponent },
  { path: 'new', component: PromotionFormComponent },
  { path: ':id/edit', component: PromotionFormComponent },
  { path: ':id/fidelity',
    loadChildren: () => import('../fidelity/fidelity.module').then(m => m.FidelityModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromotionRoutingModule { }
