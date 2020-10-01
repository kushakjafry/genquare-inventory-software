import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { baseURL } from "../shared/baseUrl";
import { ProcessHttpErrorMsgService } from "./process-http-error-msg.service";

@Injectable({
  providedIn: "root",
})
export class InvoiceService {
  constructor(
    private http: HttpClient,
    private httpErrMsgService: ProcessHttpErrorMsgService
  ) {}

  getAllInvoice(): Observable<any> {
    return this.http
      .get(`${baseURL}invoice`)
      .pipe(catchError(this.httpErrMsgService.handleError));
  }
  getInvoice(invoiceNumber: string): Observable<any> {
    return this.http
      .get(`${baseURL}invoice/${invoiceNumber}`)
      .pipe(catchError(this.httpErrMsgService.handleError));
  }
  postInvoice(data: any): Observable<any> {
    return this.http
      .post(`${baseURL}invoice`, data)
      .pipe(catchError(this.httpErrMsgService.handleError));
  }
  updateInvoice(data: any, skuId: string): Observable<any> {
    return this.http
      .put(`${baseURL}invoice/skuId`, data)
      .pipe(catchError(this.httpErrMsgService.handleError));
  }
  deleteInvoice(skuId: string): Observable<any> {
    return this.http
      .delete(`${baseURL}invoice/skuId`)
      .pipe(this.httpErrMsgService.handleError);
  }
  latestInvoice(): Observable<any> {
    return this.http
      .get(`${baseURL}invoice/latest_invoice`)
      .pipe(catchError(this.httpErrMsgService.handleError));
  }
}
