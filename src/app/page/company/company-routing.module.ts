import { CompanyListComponent } from './company-list/company-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyFormComponent } from './company-form/company-form.component';

const routes: Routes = [
  { path: '', component: CompanyListComponent },
  { path: 'new', component: CompanyFormComponent },
  { path: ':id/edit', component: CompanyFormComponent },
  { path: ':id/menu',
    loadChildren: () => import('../menu/menu.module').then(m => m.MenuModule),
  },
  { path: ':id/promotion',
    loadChildren: () => import('../promotion/promotion.module').then(m => m.PromotionModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
