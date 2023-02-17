import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guard/auth-guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home'},
  {
    path: 'home',
    loadChildren: () => import('./page/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./page/user/user.module').then(m => m.UserModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'address',
    loadChildren: () => import('./page/address/address.module').then(m => m.AddressModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'segments',
    loadChildren: () => import('./page/segment/segment.module').then(m => m.SegmentModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'companies',
    loadChildren: () => import('./page/company/company.module').then(m => m.CompanyModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    loadChildren: () => import('./page/category/category.module').then(m => m.CategoryModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./page/product/product.module').then(m => m.ProductModule),
    // canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
