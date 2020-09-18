import { AfterViewInit, Component, ViewChild, OnInit } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BOOK } from "../model/book";
import { BookService } from "../services/book.service";
import { SnackbarService } from "../services/snackbar.service";
import { Router } from "@angular/router";
import printJS from "print-js";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
})
export class TableComponent implements OnInit, AfterViewInit {
  showStartingSpinner: boolean = true;
  displayedColumns: string[] = [
    "skuId",
    "name",
    "stocks",
    "publisher",
    "price",
    "edit",
    "print",
    "delete",
  ];
  dataSource: MatTableDataSource<BOOK>;
  Books: BOOK[];
  value: string;
  skuIdOfQr: string;
  elementType: "url" | "canvas" | "img" = "url";

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  qrShown: boolean = false;

  constructor(
    private bookService: BookService,
    private snackBarService: SnackbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe(
      (books: BOOK[]) => {
        this.Books = books;
        this.showStartingSpinner = false;
        // Assign the data to the data source for the table to render
        this.dataSource = new MatTableDataSource(books);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (err) => {
        this.showStartingSpinner = false;
        if (err.indexOf("401") !== -1) {
          this.snackBarService.openSnackBar(
            "Kindly Login to continue",
            "cancel"
          );
          this.router.navigateByUrl("/login");
        } else {
          this.dataSource = new MatTableDataSource([]);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.snackBarService.openSnackBar(
            "Some error occured kindly try after sometimes",
            "cancel"
          );
        }
      }
    );
  }

  ngAfterViewInit() {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // intialization searching of certain element on dom
  documentSearching(skuId: string): any {
    let firstChar = skuId.charAt(0);
    let remainingChar = skuId.substring(1);
    let searchingClass = `.\\3${firstChar} ${remainingChar}`;
    let data = document.querySelectorAll(`${searchingClass} input`);
    let checkButton = document.querySelector(`${searchingClass} .check_button`);
    let editButton = document.querySelector(`${searchingClass} .edit_button`);
    return {
      searchString: searchingClass,
      searchClass: data,
      checkButton: checkButton,
      editButton: editButton,
    };
  }

  // editing a book
  edit(row: any) {
    let skuId: string = row.skuId;
    let search = this.documentSearching(skuId);
    search.searchClass.forEach((inputs) => {
      inputs.removeAttribute("disabled");
    });
    search.checkButton.classList.remove("hidden");
    search.editButton.classList.add("hidden");
  }

  // updating a book
  save(row: any) {
    let skuId: string = row.skuId;
    let search = this.documentSearching(skuId);
    let spinner = document.querySelector(`${search.searchString} .mat-spinner`);
    search.checkButton.classList.add("hidden");
    spinner.classList.remove("hidden");
    let name = document.querySelector<any>(
      `${search.searchString} input[name=name]`
    ).value;
    let stocks = document.querySelector<any>(
      `${search.searchString} input[name="stocks"]`
    ).value;
    let publisher = document.querySelector<any>(
      `${search.searchString} input[name="publisher"]`
    ).value;
    let price = document.querySelector<any>(
      `${search.searchString} input[name="price"]`
    ).value;
    let bookObject = {
      name: name,
      stocks: stocks,
      publisher: publisher,
      price: price,
    };
    let index = this.Books.indexOf(row);
    this.bookService.updateBook(skuId, bookObject).subscribe(
      (book: BOOK) => {
        this.Books[index] = book;
        this.dataSource = new MatTableDataSource(this.Books);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.snackBarService.openSnackBar(`updated ${book.name}`, "cancel");
        spinner.classList.add("hidden");
        search.editButton.classList.remove("hidden");
      },
      (err) => {
        this.snackBarService.openSnackBar("some error occured", "cancel");
        search.searchClass.forEach((inputs) => {
          inputs.setAttribute("disabled", "");
          spinner.classList.add("hidden");
          search.editButton.classList.remove("hidden");
        });
      }
    );
  }

  // show Barcode
  show(row: any) {
    this.skuIdOfQr = row.skuId;
    this.value = row.skuId;
    this.qrShown = true;
  }

  //close Barcode
  closeQrCode() {
    this.qrShown = false;
    setTimeout(() => {
      this.value = "";
      this.skuIdOfQr = "";
    }, 500);
  }

  // print QrCode
  print() {
    printJS("printingQRCode", "html");
  }

  // delete
  delete(row: any) {
    if (confirm(`Are you sure you want to delete ${row.name}`)) {
      this.showStartingSpinner = true;
      this.bookService.deleteBook(row.skuId).subscribe(
        (data) => {
          this.Books.splice(this.Books.indexOf(row), 1);
          this.dataSource = new MatTableDataSource(this.Books);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.showStartingSpinner = false;
          this.snackBarService.openSnackBar(
            `${row.name} book successfully deleted`,
            "cancel"
          );
        },
        (err) => {
          this.showStartingSpinner = false;
          if (err.indexOf("401") !== -1) {
            this.snackBarService.openSnackBar(
              `Kindly login to continue`,
              `cancel`
            );
          } else {
            this.snackBarService.openSnackBar(
              `Some error occured on the server kindly try after sometime`,
              "cancel"
            );
          }
        }
      );
    }
  }
}
