import { BR_FORMATS } from './utils/moment_date';
import { MaxLengthDirective } from './directives/maxLength.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule,
  MatProgressSpinnerModule, MatCardModule, MatDialogModule, MatTooltipModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule
} from '@angular/material';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AlertComponent } from './components/alert/alert.component';

import { AuthInterceptor } from './helpers/auth.interceptor';
import { EditformComponent } from './components/editform/editform.component';
import { SemAcessoComponent } from './components/sem-acesso/sem-acesso.component';

import { CurrencyMaskModule } from 'ng2-currency-mask';
import { NgxMaskModule } from 'ngx-mask';
import { DicasComponent } from './components/dicas/dicas.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    AlertComponent,
    EditformComponent,
    SemAcessoComponent,
    MaxLengthDirective,
    DicasComponent
  ],
  entryComponents: [
    EditformComponent,
    DicasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    FormsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    CurrencyMaskModule,
    NgxMaskModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {provide: MAT_DATE_LOCALE, useValue: 'pt-br'},
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: BR_FORMATS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
