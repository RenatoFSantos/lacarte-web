import { PhonePipe } from './../../shared/pipe/phone.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyFormComponent } from './company-form/company-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CnpjPipe } from 'src/app/shared/pipe/cnpj.pipe';

@NgModule({
  declarations: [
    CompanyListComponent,
    CompanyFormComponent,
    PhonePipe,
    CnpjPipe,
  ],
  imports: [CommonModule, SharedModule, CompanyRoutingModule],
})
export class CompanyModule {}
