import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthGuard } from './guard/auth-guard';
import { getPaginatorIntl } from './config/paginator.intl';
import { ErrorMessageComponent } from './component/error-message/error-message.component';
import { FormDebugComponent } from './component/form-debug/form-debug.component';
import { InputFileComponent } from './component/input-file/input-file.component';
import { BreadCrumbComponent } from './component/bread-crumb/bread-crumb.component';
import { RouterModule } from '@angular/router';
import { AuthInterceptor } from './service/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    ErrorMessageComponent,
    FormDebugComponent,
    InputFileComponent,
    BreadCrumbComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatButtonModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatSnackBarModule,
    MatSortModule,
    MatSelectModule,
    MatDatepickerModule,
    MatBadgeModule,
    MatDialogModule,
    NgxMaskModule.forChild(),
  ],
  exports: [
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatButtonModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatSnackBarModule,
    MatSortModule,
    MatSelectModule,
    MatDatepickerModule,
    MatBadgeModule,
    ErrorMessageComponent,
    FormDebugComponent,
    InputFileComponent,
    BreadCrumbComponent,
    NgxMaskModule,
    MatDialogModule,
  ],
  providers: [
    AuthGuard,
    {
      provide: MatPaginatorIntl,
      useValue: getPaginatorIntl(),
    },
    AuthInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})
export class SharedModule {}
