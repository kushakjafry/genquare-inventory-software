import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { BOOK } from "app/model/book";
import { BookService } from "app/services/book.service";
import { SnackbarService } from "app/services/snackbar.service";

declare let csv: any;
@Component({
  selector: "app-file-upload-books",
  templateUrl: "./file-upload-books.component.html",
  styleUrls: ["./file-upload-books.component.scss"],
})
export class FileUploadBooksComponent implements OnInit {
  constructor(
    private bookService: BookService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {}
  srcResult: any;
  file: any;
  error: string;
  hideAddSpinner: boolean = true;
  ErrorBooks: any[] = [];
  UploadBooks: any[] = [];
  failedDataSource;
  uploadedDataSource;
  booksUploaded: boolean = false;
  booksFailed: boolean = false;
  displayedColumns: string[] = ["skuId"];

  onFileSelected(e: any) {
    if (e.target.files[0].name.endsWith(".csv")) {
      this.error = "";
      this.file = e.target.files[0];
    } else {
      this.file = null;
      this.error = "Plz upload file with csv format";
    }
  }

  uploadFile() {
    this.ErrorBooks = [];
    this.UploadBooks = [];
    this.booksUploaded = false;
    this.booksFailed = false;
    this.failedDataSource = null;
    this.uploadedDataSource = null;
    this.hideAddSpinner = false;
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      csv()
        .fromString(fileReader.result)
        .then((json: any[]) => {
          let bookSkuId = [];
          json.forEach((book: any) => {
            bookSkuId.push(book.skuId);
            book.price = parseInt(book.price) || 0;
            book.stocks = parseInt(book.stocks) || 0;
          });
          this.bookService.insertManyBooks(json).subscribe(
            (data) => {
              this.hideAddSpinner = true;
              this.UploadBooks = data;
              this.uploadedDataSource = this.UploadBooks;
              this.booksUploaded = true;
            },
            (err) => {
              if (Array.isArray(err)) {
                this.ErrorBooks = bookSkuId
                  .filter(function (n) {
                    return err.indexOf(n) !== -1;
                  })
                  .map((q) => {
                    return { skuId: q };
                  });
                this.UploadBooks = bookSkuId
                  .filter(function (n) {
                    return err.indexOf(n) === -1;
                  })
                  .map((q) => {
                    return { skuId: q };
                  });
                if (this.UploadBooks.length) {
                  this.uploadedDataSource = this.UploadBooks;
                  this.booksUploaded = true;
                }
                this.failedDataSource = this.ErrorBooks;
                this.booksFailed = true;
                this.snackbarService.openSnackBar(
                  `some books failed due to same skuId`,
                  "cancel"
                );
              } else {
                this.snackbarService.openSnackBar(
                  "Kindly try after sometimes error occured on the server",
                  "cancel"
                );
              }
              this.hideAddSpinner = true;
            }
          );
        });
      this.file = null;
    };
    fileReader.readAsText(this.file);
  }
}
