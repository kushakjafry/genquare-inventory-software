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
  get books(): FormArray {
    return this.invoiceForm.get("books") as FormArray;
  }
  updateForm(data) {
    const items = data.books;
    let totalPrice = 0;
    for (let i of items) {
      i.discountedPrice =
        (i.costPrice - (i.costPrice * i.discount) / 100) * i.quantity;
      totalPrice += i.discountedPrice;
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
      invoiceNumber: [this.invoiceNumber, Validators.required],
      invoiceDate: [new Date(), Validators.required],
      sellingPlatform: ["", Validators.required],
      totalPrice: [this.totalPrice, Validators.required],
      books: this.fb.array(
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
      return this.fb.group({
        name: [this.data.name, Validators.required],
        skuId: [this.data.skuId, Validators.required],
        quantity: [1, Validators.required],
        costPrice: [this.data.price, Validators.required],
        discount: [0, Validators.required],
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
      return this.fb.group({
        name: [skuIdData.name, Validators.required],
        skuId: [skuIdData.skuId, Validators.required],
        quantity: [1, Validators.required],
        costPrice: [skuIdData.price, Validators.required],
        discount: [0, Validators.required],
        discountedPrice: [skuIdData.price, Validators.required],
        publisher: [skuIdData.publisher, Validators.required],
      });
    }
  }
  addFormGroup(skuId: string) {
    this.bookService.getBook(skuId).subscribe(
      (skuIdData) => {
        let bookData = this.createFormArrayGroup(skuIdData);
        this.books.push(bookData);
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
    this.invoiceService
      .postInvoice(this.invoiceForm.value)
      .subscribe((data) => {
        this.dialogRef.close();
      });
  }
}
