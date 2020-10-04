import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { BookService } from "app/services/book.service";
import { InvoiceService } from "app/services/invoice.service";
import { SnackbarService } from "app/services/snackbar.service";
import { SkuIdDialogComponent } from "app/sku-id-dialog/sku-id-dialog.component";
import PrintJs from "print-js";

export interface bookData {
  name: string;
  skuId: string;
  quantity: number;
  costPrice: number;
  discount: number;
  discountedPrice: number;
  publisher: string;
}

@Component({
  selector: "app-invoice-dialog",
  templateUrl: "./invoice-dialog.component.html",
  styleUrls: ["./invoice-dialog.component.scss"],
})
export class InvoiceDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private bookService: BookService,
    private invoiceService: InvoiceService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<InvoiceDialogComponent>
  ) {
    this.totalPrice = this.data.price;
  }
  booksArray: bookData[] = [];
  elementType: "url" | "canvas" | "img" = "url";
  skuIdObj: any = {};
  stockObj: any = {};
  cols: string[] = [
    "name",
    "skuId",
    "quantity",
    "costPrice",
    "discount",
    "discountedPrice",
    "publisher",
  ];
  invoiceForm: FormGroup;
  dataSource: MatTableDataSource<bookData>;
  invoiceNumber: string;
  hideAddSpinner: boolean = true;
  totalPrice: number = 0;
  @ViewChild("invoicefrom") invoiceFormDirective;
  ngOnInit(): void {
    this.invoiceService.latestInvoice().subscribe(
      (invoiceNumber) => {
        this.invoiceNumber = invoiceNumber.invoice;
        this.createForm();
      },
      (err) => {
        this.snackbarService.openSnackBar(
          "Some Error Occured try again later",
          "cancel"
        );
      }
    );
  }
  get invoiceItems(): FormArray {
    return this.invoiceForm.get("invoiceItems") as FormArray;
  }
  updateForm(data) {
    const items = data.invoiceItems;
    let totalPrice = 0;
    for (let i of items) {
      if (
        i.quantity > 0 &&
        i.costPrice > 0 &&
        i.discount >= 0 &&
        i.discount <= 100
      ) {
        this.skuIdObj[i.sku_Id] = -Math.abs(i.quantity);
        i.discountedPrice =
          (i.costPrice - (i.costPrice * i.discount) / 100) * i.quantity;
        totalPrice += i.discountedPrice;
      }
    }
    this.totalPrice = totalPrice;
    this.invoiceForm.value.totalPrice = totalPrice;
  }
  createForm() {
    this.invoiceForm = this.fb.group({
      customerName: ["", Validators.required],
      customerPhone: [
        0,
        [Validators.required, Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)],
      ],
      customerAddress: ["", Validators.required],
      customerPincode: [
        "",
        [Validators.required, Validators.pattern("^[1-9][0-9]{5}$")],
      ],
      invoiceNumber: [this.invoiceNumber, Validators.required],
      invoiceDate: [new Date(), Validators.required],
      sellingPlatform: ["", Validators.required],
      totalPrice: [this.totalPrice, Validators.required],
      invoiceItems: this.fb.array(
        [this.createFormArrayGroup()],
        [Validators.required]
      ),
    });
    this.dataSource = new MatTableDataSource(this.booksArray);
    this.invoiceForm.valueChanges.subscribe((data) => this.updateForm(data));
  }
  createFormArrayGroup(skuIdData?: any) {
    if (!skuIdData) {
      this.booksArray.push({
        name: this.data.name,
        skuId: this.data.skuId,
        quantity: 1,
        costPrice: this.data.price,
        discount: 0,
        discountedPrice: this.data.price,
        publisher: this.data.publisher,
      });
      this.skuIdObj[this.data.skuId] = -1;
      this.stockObj[this.data.skuId] = this.data.stocks;
      return this.fb.group({
        name: [this.data.name, Validators.required],
        sku_Id: [this.data.skuId, Validators.required],
        quantity: [
          1,
          [
            Validators.required,
            Validators.max(this.data.stocks),
            Validators.min(1),
          ],
        ],
        costPrice: [this.data.price, [Validators.required, Validators.min(1)]],
        discount: [
          0,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        discountedPrice: [this.data.price, Validators.required],
        publisher: [this.data.publisher, Validators.required],
      });
    } else {
      this.booksArray.push({
        name: skuIdData.name,
        skuId: skuIdData.skuId,
        quantity: 1,
        costPrice: skuIdData.price,
        discount: 0,
        discountedPrice: skuIdData.price,
        publisher: skuIdData.publisher,
      });
      this.skuIdObj[skuIdData.skuId] = -1;
      this.stockObj[skuIdData.skuId] = skuIdData.stocks;
      return this.fb.group({
        name: [skuIdData.name, Validators.required],
        sku_Id: [skuIdData.skuId, Validators.required],
        quantity: [
          1,
          [
            Validators.required,
            Validators.max(skuIdData.stocks),
            Validators.min(1),
          ],
        ],
        costPrice: [skuIdData.price, [Validators.required, Validators.min(1)]],
        discount: [
          0,
          [Validators.required, Validators.min(1), Validators.max(100)],
        ],
        discountedPrice: [skuIdData.price, Validators.required],
        publisher: [skuIdData.publisher, Validators.required],
      });
    }
  }
  addFormGroup(skuId: string) {
    this.bookService.getBook(skuId).subscribe(
      (skuIdData) => {
        let bookData = this.createFormArrayGroup(skuIdData);
        this.invoiceItems.push(bookData);
        this.dataSource = new MatTableDataSource(this.booksArray);
      },
      (err) => {
        this.snackbarService.openSnackBar(
          "Some error occured kindly check skuId/logged in status",
          "cancel"
        );
      }
    );
  }
  addFormGroupClicked() {
    let dialogRef = this.dialog.open(SkuIdDialogComponent, {
      width: "300px",
    });
    dialogRef.afterClosed().subscribe((results) => {
      if (results) {
        this.addFormGroup(results);
      }
    });
  }
  onSubmit() {
    this.bookService.bookUpdateManyStocks(this.skuIdObj).subscribe(
      (data) => {
        this.invoiceService.postInvoice(this.invoiceForm.value).subscribe(
          (data) => {
            this.dialogRef.close(this.invoiceItems);
          },
          (err) => {
            if (err.indexOf("401") !== -1) {
              this.snackbarService.openSnackBar(
                "Kindly Login to continue",
                "cancel"
              );
            } else {
              this.snackbarService.openSnackBar("Some Error Ocurred", "cancel");
            }
          }
        );
      },
      (err) => {
        if (err.indexOf("401") !== -1) {
          this.snackbarService.openSnackBar(
            "Kindly Login to continue",
            "cancel"
          );
        } else {
          this.snackbarService.openSnackBar(
            "Check out the quantity and skuId of the items! No invoice was made..",
            "cancel"
          );
        }
      }
    );
  }
  printQrCode() {
    PrintJs("printingQRCode", "html");
  }
  printInvoice() {
    let printContents, popupWin;
    printContents = document.getElementById("container").innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>
          @import url("https://fonts.googleapis.com/css?family=Open+Sans:400italic,400,700&subset=cyrillic,cyrillic-ext,latin,greek-ext,greek,latin-ext,vietnamese");
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font: inherit;
  font-size: 100%;
  vertical-align: baseline;
}

html {
  line-height: 1;
}

ol, ul {
  list-style: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

caption, th, td {
  text-align: left;
  font-weight: normal;
  vertical-align: middle;
}

q, blockquote {
  quotes: none;
}
q:before, q:after, blockquote:before, blockquote:after {
  content: "";
  content: none;
}

a img {
  border: none;
}

article, aside, details, figcaption, figure, footer, header, hgroup, main, menu, nav, section, summary {
  display: block;
}

/* Invoice styles */
/**
 * DON'T override any styles for the <html> and <body> tags, as this may break the layout.
 * Instead wrap everything in one main <div id="container"> element where you may change
 * something like the font or the background of the invoice
 */
html, body {
  /* MOVE ALONG, NOTHING TO CHANGE HERE! */
}

/**
 * IMPORTANT NOTICE: DON'T USE '!important' otherwise this may lead to broken print layout.
 * Some browsers may require '!important' in oder to work properly but be careful with it.
 */
.clearfix {
  display: block;
  clear: both;
}

.hidden {
  display: none;
}

b, strong, .bold {
  font-weight: bold;
}

#container {
  font: normal 13px/1.4em 'Open Sans', Sans-serif;
  margin: 0 auto;
  min-height: 1078px;
}

.invoice-top {
  background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIxMCUiIHN0b3AtY29sb3I9IiMzMzMzMzMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMDAwMDAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPiA=');
  background: -moz-radial-gradient(center center, circle farthest-corner, #333333 10%, #000000);
  background: -webkit-radial-gradient(center center, circle farthest-corner, #333333 10%, #000000);
  background: radial-gradient(circle farthest-corner at center center, #333333 10%, #000000);
  background: black;
  color: #fff;
  padding: 40px 40px 30px 40px;
}

.invoice-body {
  padding: 50px 40px 40px 40px;
}

#memo .logo {
  float: left;
  margin-right: 20px;
  width:150px;
  height:150px;
  background-image: url('https://www.genquare.com/pub/media/logo/stores/1/logo.png');
  background-repeat: no-repeat;
  background-size: contain;
}
#memo .logo img {
  width: 150px;
  height: 150px;
}
#memo .company-info {
  float: right;
  text-align: right;
}
#memo .company-info .company-name {
  color: #F8ED31;
  font-weight: bold;
  font-size: 32px;
}
#memo .company-info .spacer1 {
  height: 15px;
  display: block;
}
#memo .company-info div {
  font-size: 12px;
  float: right;
  margin: 0 3px 3px 0;
}
#memo:after {
  content: '';
  display: block;
  clear: both;
}

#invoice-info {
  float: left;
  margin-top: 50px;
}
#invoice-info > div {
  float: left;
}
#invoice-info > div > span {
  display: block;
  min-width: 100px;
  min-height: 18px;
  margin-bottom: 3px;
}
#invoice-info > div:last-of-type {
  margin-left: 10px;
  text-align: right;
}
#invoice-info:after {
  content: '';
  display: block;
  clear: both;
}

#client-info {
  float: right;
  margin-top: 50px;
  margin-right: 30px;
  min-width: 220px;
}
#client-info > div {
  margin-bottom: 3px;
}
#client-info span {
  display: block;
}
#client-info > span {
  margin-bottom: 3px;
}

#invoice-title-number {
  margin-top: 30px;
}
#invoice-title-number #title {
  margin-right: 5px;
  text-align: right;
  font-size: 35px;
}
#invoice-title-number #number {
  margin-left: 5px;
  text-align: left;
  font-size: 20px;
}

table {
  table-layout: fixed;
}
table th, table td {
  vertical-align: top;
  word-break: keep-all;
  word-wrap: break-word;
}

#items .first-cell, #items table th:first-child, #items table td:first-child {
  width: 18px;
  text-align: right;
}
#items table {
  border-collapse: separate;
  width: 100%;
}
#items table th {
  font-weight: bold;
  padding: 12px 10px;
  text-align: right;
  border-bottom: 1px solid #444;
  text-transform: uppercase;
}
#items table th:nth-child(2) {
  width: 30%;
  text-align: left;
}
#items table th:last-child {
  text-align: right;
}
#items table td {
  border-right: 1px solid #b6b6b6;
  padding: 15px 10px;
  text-align: right;
}
#items table td:first-child {
  text-align: left;
  border-right: none !important;
}
#items table td:nth-child(2) {
  text-align: left;
}
#items table td:last-child {
  border-right: none !important;
}

#sums {
  float: right;
  margin-top: 30px;
}
#sums table tr th, #sums table tr td {
  min-width: 100px;
  padding: 10px;
  text-align: right;
  font-weight: bold;
  font-size: 14px;
}
#sums table tr th {
  text-align: left;
  padding-right: 25px;
  color: #707070;
}
#sums table tr td:last-child {
  min-width: 0 !important;
  max-width: 0 !important;
  width: 0 !important;
  padding: 0 !important;
  overflow: visible;
}
#sums table tr.amount-total th {
  color: black;
}
#sums table tr.amount-total th, #sums table tr.amount-total td {
  font-weight: bold;
}
#sums table tr.amount-total td:last-child {
  position: relative;
}
#sums table tr.amount-total td:last-child .currency {
  position: absolute;
  top: 3px;
  left: -740px;
  font-weight: normal;
  font-style: italic;
  font-size: 12px;
  color: #707070;
}
#sums table tr.amount-total td:last-child:before {
  display: block;
  content: '';
  border-top: 1px solid #444;
  position: absolute;
  top: 0;
  left: -740px;
  right: 0;
}
#sums table tr:last-child th, #sums table tr:last-child td {
  color: black;
}

#terms {
  margin: 100px 0 15px 0;
}
#terms > div {
  min-height: 70px;
}

.payment-info {
  color: #707070;
  font-size: 12px;
}
.payment-info div {
  display: inline-block;
  min-width: 10px;
}

.ib_drop_zone {
  color: #F8ED31 !important;
  border-color: #F8ED31 !important;
}

/**
 * If the printed invoice is not looking as expected you may tune up
 * the print styles (you can use !important to override styles)
 */
@media print {
  /* Here goes your print styles */
}
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`);
    popupWin.document.close();
  }
}
