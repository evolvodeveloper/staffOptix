import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';

import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
// import { NgxOrgChartModule } from 'ngx-org-chart';
import { NgxPaginationModule } from 'ngx-pagination';
import { QuillModule } from 'ngx-quill';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './authentication/guards/auth.guard';
import { CheckPermissionResolver } from './authentication/guards/check-permission.resolver';
import { LoginGuard } from './authentication/guards/login.guard';
import { RoutingGuardGuard } from './authentication/guards/routing-guard.guard';
import { MyHttpInterceptor } from './services/http.interceptor';
import { SharedModule } from './shared/shared.module';
@NgModule({
    declarations: [AppComponent],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
    imports: [BrowserModule,
        NgScrollbarModule,
        NgSelectModule,
        AppRoutingModule,
        NgxPaginationModule,
        SharedModule,
        QuillModule.forRoot(),
        MatDialogModule,
        MatMomentDateModule,
        MatDatepickerModule,
        NgxDaterangepickerMd.forRoot(),
        NgbModule,
        BrowserAnimationsModule,
        NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' })], providers: [AuthGuard, LoginGuard, MatDatepicker, CheckPermissionResolver, RoutingGuardGuard,
            { provide: HTTP_INTERCEPTORS, useClass: MyHttpInterceptor, multi: true }, provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule {}
