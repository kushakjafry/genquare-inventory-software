import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { baseURL } from "../shared/baseUrl";
import { ProcessHttpErrorMsgService } from "./process-http-error-msg.service";
import { catchError } from "rxjs/operators";
import { Observable } from "rxjs";
import { BOOK } from "../model/book";

@Injectable({
  providedIn: "root",
})
export class BookService {
  constructor(
    private http: HttpClient,
    private processHttpErrorMsgService: ProcessHttpErrorMsgService
  ) {}

  getBooks(): Observable<BOOK[]> {
    return this.http
      .get<BOOK[]>(`${baseURL}books`)
      .pipe(catchError(this.processHttpErrorMsgService.handleError));
  }
  updateBook(skuId: string, bookObject: any): Observable<BOOK> {
    return this.http
      .put<BOOK>(`${baseURL}books/${skuId}`, bookObject)
      .pipe(catchError(this.processHttpErrorMsgService.handleError));
  }
  postBook(book: BOOK): Observable<BOOK> {
    return this.http
      .post<BOOK>(`${baseURL}books`, book)
      .pipe(catchError(this.processHttpErrorMsgService.handleError));
  }
  addBook(skuId): Observable<any> {
    return this.http
      .post(`${baseURL}books/${skuId}/addOneToStock`, { skuId: skuId })
      .pipe(catchError(this.processHttpErrorMsgService.handleError));
  }

  removeBook(skuId): Observable<any> {
    return this.http
      .post(`${baseURL}books/${skuId}/removeOneFromStock`, { skuId: skuId })
      .pipe(catchError(this.processHttpErrorMsgService.handleError));
  }
  deleteBook(skuId): Observable<any> {
    return this.http
      .delete(`${baseURL}books/${skuId}`)
      .pipe(catchError(this.processHttpErrorMsgService.handleError));
  }
  bookSync(skuIds: any): Observable<any> {
    return this.http
      .post(`${baseURL}books/updateMany`, skuIds)
      .pipe(catchError(this.processHttpErrorMsgService.handleError));
  }
  checkBookSkuId(skuIds: any): Observable<any> {
    return this.http
      .post(`${baseURL}books/checking`, skuIds)
      .pipe(catchError(this.processHttpErrorMsgService.handleError));
  }
  insertManyBooks(books: any[]): Observable<any> {
    return this.http
      .post(`${baseURL}books/insertMany`, books)
      .pipe(catchError(this.processHttpErrorMsgService.handleError));
  }
}
