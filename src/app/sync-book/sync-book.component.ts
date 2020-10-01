// import { DataSource } from "@angular/cdk/table";
// import { Component, OnInit } from "@angular/core";
// import { MatTableDataSource } from "@angular/material/table";
// import { BookService } from "app/services/book.service";
// // import { InternetService } from "app/services/internet.service";
// import { SnackbarService } from "app/services/snackbar.service";

// interface tableData {
//   skuId: string;
//   stocks: number;
// }

// @Component({
//   selector: "app-sync-book",
//   templateUrl: "./sync-book.component.html",
//   styleUrls: ["./sync-book.component.scss"],
// })
// export class SyncBookComponent implements OnInit {
//   displayedColumns: string[] = ["skuId", "stocks", "delete"];
//   dataSource;
//   showForm: boolean = true;
//   books: any[];
//   errorInSkuId: boolean = false;
//   isOnline: boolean = true;
//   booksDataForTable: tableData[] = [];
//   constructor(
//     private bookService: BookService,
//     private snackbarService: SnackbarService,
//     // private connectionService: InternetService
//   ) {}

//   ngOnInit(): void {
//     // this.connectionService.checkInternet().subscribe((isConnected) => {
//     //   this.isOnline = isConnected;
//     // });
//     this.books = JSON.parse(localStorage.getItem("book"));
//     if (this.books) {
//       this.books.forEach((book) => {
//         console.log(book);
//         let stock = parseInt(JSON.parse(localStorage.getItem(book)));
//         let bookFromStorage: tableData = {
//           skuId: book,
//           stocks: stock,
//         };
//         this.booksDataForTable.push(bookFromStorage);
//       });
//     }
//     this.dataSource = this.booksDataForTable || [];
//   }
//   syncAll() {
//     this.showForm = false;
//     let requestObject: any = {};
//     let length = this.books.length;
//     for (var i = 0; i < this.books.length; i++) {
//       requestObject[this.books[i]] = localStorage.getItem(this.books[i]);
//     }
//     console.log(requestObject);
//     this.bookService.bookSync(requestObject).subscribe(
//       (data) => {
//         if (data.nModified === length) {
//           for (var i = 0; i < this.books.length; i++) {
//             localStorage.removeItem(this.books[i]);
//           }
//           localStorage.removeItem("book");
//           this.books = [];
//           this.booksDataForTable = [];
//           this.dataSource = this.booksDataForTable;
//           this.snackbarService.openSnackBar("All books where synced", "cancel");
//         } else {
//           let requestChecking = {
//             skuId: JSON.stringify(this.books),
//           };
//           console.log(requestChecking);
//           this.bookService.checkBookSkuId(requestChecking).subscribe((data) => {
//             var returnArray: any[] = [];
//             for (var i = 0; i < data.length; i++) {
//               returnArray.push(data[i].skuId);
//             }
//             var wrongSkuId = this.books.filter(function (n) {
//               return returnArray.indexOf(n) === -1;
//             });
//             var rigthSkuId = this.books.filter(function (n) {
//               return returnArray.indexOf(n) !== -1;
//             });
//             rigthSkuId.forEach((skuID) => localStorage.removeItem(skuID));
//             localStorage.setItem("book", JSON.stringify(wrongSkuId));
//             this.books = wrongSkuId;
//             this.booksDataForTable = [];
//             this.errorInSkuId = true;
//             this.books.forEach((book) => {
//               console.log(book);
//               let stock = parseInt(JSON.parse(localStorage.getItem(book)));
//               let bookFromStorage: tableData = {
//                 skuId: book,
//                 stocks: stock,
//               };
//               this.booksDataForTable.push(bookFromStorage);
//             });
//             this.dataSource = this.booksDataForTable;
//             this.snackbarService.openSnackBar(
//               "Some skuIds where incorrect they are shown in red",
//               "cancel"
//             );
//           });
//         }
//         this.showForm = true;
//       },
//       (err) => {
//         this.snackbarService.openSnackBar(
//           "Some error kindly check wheter you are looged in",
//           "cancel"
//         );
//         this.showForm = true;
//       }
//     );
//   }
//   delete(row: any) {
//     let index = this.books.indexOf(row.skuId);
//     this.books.splice(index, 1);
//     this.booksDataForTable = [];
//     if (this.books) {
//       this.books.forEach((book) => {
//         let stock = parseInt(JSON.parse(localStorage.getItem(book)));
//         let bookFromStorage: tableData = {
//           skuId: book,
//           stocks: stock,
//         };
//         this.booksDataForTable.push(bookFromStorage);
//       });
//     }
//     this.dataSource = this.booksDataForTable;
//     localStorage.removeItem("book");
//     localStorage.removeItem(row.skuId);
//     if (this.books) {
//       localStorage.setItem("book", JSON.stringify(this.books));
//     }
//   }
//   deleteAll() {
//     this.books.forEach((book) => {
//       localStorage.removeItem(book);
//     });
//     this.books = [];
//     this.booksDataForTable = [];
//     this.dataSource = this.booksDataForTable;
//     localStorage.removeItem("book");
//     this.errorInSkuId = false;
//   }
// }
