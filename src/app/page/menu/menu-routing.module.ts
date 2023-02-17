import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuFormComponent } from './menu-form/menu-form.component';
import { MenuListComponent } from './menu-list/menu-list.component';

const routes: Routes = [
  { path: '', component: MenuListComponent },
  { path: 'new', component: MenuFormComponent },
  { path: ':id/edit', component: MenuFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuRoutingModule { }
