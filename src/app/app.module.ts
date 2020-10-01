import "reflect-metadata";
import "../polyfills";

//modules
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LayoutModule } from "@angular/cdk/layout";
import { MaterialModule } from "./material.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxQRCodeModule } from "@techiediaries/ngx-qrcode";
import {
  HttpClientModule,
  HttpClient,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { CoreModule } from "./core/core.module";
import { AppRoutingModule } from "./app-routing.module";

// NG Translate
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

//components
import { AppComponent } from "./app.component";
import { BookListComponent } from "./book-list/book-list.component";
import { LoginComponent } from "./login/login.component";
import { NavComponent } from "./nav/nav.component";

// services
import { BookService } from "./services/book.service";
import { AuthService } from "./services/auth.service";
import { ProcessHttpErrorMsgService } from "./services/process-http-error-msg.service";
import { SnackbarService } from "./services/snackbar.service";
import { TableComponent } from "./table/table.component";
import { AddBookComponent } from "./add-book/add-book.component";
import {
  AuthInterceptor,
  UnauthorizedInterceptor,
} from "./services/auth.interceptor";
import { BarcodeScanComponent } from "./barcode-scan/barcode-scan.component";
import { InvoiceService } from "./services/invoice.service";

//Directive
import { AutofocusDirective } from "./directives/autofocus.directive";
// import { SyncBookComponent } from "./sync-book/sync-book.component";
import { FileUploadBooksComponent } from "./file-upload-books/file-upload-books.component";
import { InvoiceDialogComponent } from "./invoice-dialog/invoice-dialog.component";
import { SkuIdDialogComponent } from './sku-id-dialog/sku-id-dialog.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    BookListComponent,
    LoginComponent,
    TableComponent,
    AddBookComponent,
    BarcodeScanComponent,
    AutofocusDirective,
    // SyncBookComponent,
    FileUploadBooksComponent,
    InvoiceDialogComponent,
    SkuIdDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BrowserAnimationsModule,
    MaterialModule,
    LayoutModule,
    ReactiveFormsModule,
    NgxQRCodeModule,
  ],
  providers: [
    BookService,
    AuthService,
    ProcessHttpErrorMsgService,
    SnackbarService,
    InvoiceService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
