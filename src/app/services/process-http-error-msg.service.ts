import { Injectable } from "@angular/core";
import { throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProcessHttpErrorMsgService {
  constructor() {}
  handleError(error) {
    console.log(error);
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}\n`;
    }
    console.log(errorMessage);
    if (error.error) {
      return throwError(error.error.err);
    }
    return throwError(errorMessage);
  }
}
