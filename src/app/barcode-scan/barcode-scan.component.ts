import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BOOK } from "app/model/book";
import { BookService } from "app/services/book.service";
import { SnackbarService } from "app/services/snackbar.service";
import { InternetService } from "../services/internet.service";

@Component({
  selector: "app-barcode-scan",
  templateUrl: "./barcode-scan.component.html",
  styleUrls: ["./barcode-scan.component.scss"],
})
export class BarcodeScanComponent implements OnInit {
  @ViewChild("addSku") addSkuInput: ElementRef;
  @ViewChild("removeSku") removeSkuInput: ElementRef;
  @ViewChild("addform") AddFormDirective;
  @ViewChild("removeform") RemoveFormDirective;
  constructor(
    public fb: FormBuilder,
    private bookService: BookService,
    private snackbarService: SnackbarService,
    private connectionService: InternetService
  ) {}

  selectedIndex: number = 0;
  addForm: FormGroup;
  removeForm: FormGroup;
  formErrors = {
    skuIdAdd: "",
    skuIdRemove: "",
  };
  validationMessages = {
    skuIdAdd: {
      required: "skuId is required.",
    },
    skuIdRemove: {
      required: "skuId is required",
    },
  };
  showAddForm: boolean = true;
  showRemoveForm: boolean = true;
  booksAdded: any = {};
  booksRemoved: any = {};
  booksUpdatedAdded: any[] = [];
  booksUpdatedRemoved: any[] = [];
  addDataSource;
  removeDataSource;
  internetConnection: boolean = true;
  displayedColumns = ["skuId", "stocks"];

  ngOnInit(): void {
    this.createAddForm();
    this.createRemoveForm();
    this.connectionService.checkInternet().subscribe((isConnected) => {
      console.log(isConnected);
      this.internetConnection = isConnected;
    });
  }

  onTabClick(event) {
    this.selectedIndex = event;
    this.RemoveFormDirective.resetForm();
    this.AddFormDirective.resetForm();
  }
  afterTabOpen() {
    if (this.selectedIndex) {
      this.removeSkuInput.nativeElement.focus();
    } else {
      this.addSkuInput.nativeElement.focus();
    }
  }
  createAddForm() {
    this.addForm = this.fb.group({
      skuIdAdd: ["", Validators.required],
    });
    this.addForm.valueChanges.subscribe((data) =>
      this.onValueChanged(this.addForm, data)
    );

    this.onValueChanged(this.addForm); // (re)set validation messages now
  }
  createRemoveForm() {
    this.removeForm = this.fb.group({
      skuIdRemove: ["", Validators.required],
    });
    this.removeForm.valueChanges.subscribe((data) =>
      this.onValueChanged(this.removeForm, data)
    );

    this.onValueChanged(this.removeForm); // (re)set validation messages now
  }
  onValueChanged(skuForm: any, data?: any) {
    if (!skuForm) {
      return;
    }
    const form = skuForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = "";
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + " ";
            }
          }
        }
      }
    }
  }
  onAdd() {
    this.showAddForm = false;
    if (this.internetConnection) {
      this.bookService.addBook(this.addForm.value.skuIdAdd).subscribe(
        (data: BOOK) => {
          this.showAddForm = true;
          let skuId = data.skuId;
          if (!this.booksAdded[skuId]) {
            this.booksAdded[skuId] = 1;
          } else {
            this.booksAdded[skuId] = this.booksAdded[skuId] + 1;
          }
          console.log(this.booksAdded);
          this.snackbarService.openSnackBar(
            `${data.name} book was updated`,
            "cancel"
          );
          let updated: any = { skuId: skuId, stocks: this.booksAdded[skuId] };
          let obj = this.booksUpdatedAdded.find((obj) => obj.skuId === skuId);
          if (obj) {
            this.booksUpdatedAdded.splice(
              this.booksUpdatedAdded.indexOf(obj),
              1
            );
          }
          this.booksUpdatedAdded.unshift(updated);
          this.addDataSource = this.booksUpdatedAdded;
        },
        (err) => {
          this.showAddForm = true;
          if (err.indexOf("401") !== -1) {
            this.snackbarService.openSnackBar(
              "Please login to continue",
              "cancel"
            );
          } else if (err.indexOf("500") !== -1) {
            this.snackbarService.openSnackBar(
              "Wrong SkuId please check",
              "cancel"
            );
          } else {
            this.snackbarService.openSnackBar(
              "Error ocurred plz check your internet",
              "cancel"
            );
          }
        }
      );
    } else {
      let skuid = this.addForm.value.skuIdAdd;
      let bookSkuId = localStorage.getItem(skuid) || "";
      let book: any[] = JSON.parse(localStorage.getItem("book")) || [];
      if (bookSkuId) {
        if (parseInt(bookSkuId) === -1) {
          localStorage.removeItem(bookSkuId);
          book.splice(book.indexOf(skuid), 1);
          localStorage.setItem("book", JSON.stringify(book));
        } else {
          localStorage.setItem(
            skuid,
            (parseInt(localStorage.getItem(skuid)) + 1).toString()
          );
        }
      } else {
        book.push(skuid);
        localStorage.setItem(skuid, "1");
        localStorage.setItem("book", JSON.stringify(book));
      }
      this.showAddForm = true;
      this.snackbarService.openSnackBar(
        "You are not connected to internet books are stored locally kindly sync it",
        "cancel"
      );
      if (!this.booksAdded[skuid]) {
        this.booksAdded[skuid] = 1;
      } else {
        this.booksAdded[skuid] = this.booksAdded[skuid] + 1;
      }
      let updated: any = { skuId: skuid, stocks: this.booksAdded[skuid] };
      let obj = this.booksUpdatedAdded.find((obj) => obj.skuId === skuid);
      if (obj) {
        this.booksUpdatedAdded.splice(this.booksUpdatedAdded.indexOf(obj), 1);
      }
      this.booksUpdatedAdded.unshift(updated);
      this.addDataSource = this.booksUpdatedAdded;
    }
    this.addForm.reset({
      skuIdAdd: "",
    });
    this.AddFormDirective.resetForm();
    this.addSkuInput.nativeElement.focus();
  }
  onRemove() {
    this.showRemoveForm = false;
    if (this.internetConnection) {
      this.bookService.removeBook(this.removeForm.value.skuIdRemove).subscribe(
        (data) => {
          this.showRemoveForm = true;
          let skuId = data.skuId;
          if (!this.booksRemoved[skuId]) {
            this.booksRemoved[skuId] = -1;
          } else {
            this.booksRemoved[skuId] = this.booksRemoved[skuId] - 1;
          }
          this.snackbarService.openSnackBar(
            `${data.name} book was updated`,
            "cancel"
          );
          let updated: any = { skuId: skuId, stocks: this.booksRemoved[skuId] };
          let obj = this.booksUpdatedRemoved.find((obj) => obj.skuId === skuId);
          if (obj) {
            this.booksUpdatedRemoved.splice(
              this.booksUpdatedRemoved.indexOf(obj),
              1
            );
          }
          this.booksUpdatedRemoved.unshift(updated);
          this.removeDataSource = this.booksUpdatedRemoved;
        },
        (err) => {
          this.showRemoveForm = true;
          if (err.indexOf("401") !== -1) {
            this.snackbarService.openSnackBar(
              "Please login to continue",
              "cancel"
            );
          } else if (err.indexOf("500") !== -1) {
            this.snackbarService.openSnackBar(
              "Wrong SkuId please check",
              "cancel"
            );
          } else {
            this.snackbarService.openSnackBar(
              "Error ocurred plz check your internet",
              "cancel"
            );
          }
        }
      );
    } else {
      this.showRemoveForm = true;
      let skuid = this.removeForm.value.skuIdRemove;
      let bookSkuId = localStorage.getItem(skuid) || "";
      let book: any[] = JSON.parse(localStorage.getItem("book")) || [];
      if (bookSkuId) {
        if (parseInt(bookSkuId) === 1) {
          localStorage.removeItem(bookSkuId);
          book.splice(book.indexOf(skuid), 1);
          localStorage.setItem("book", JSON.stringify(book));
        } else {
          localStorage.setItem(
            skuid,
            (parseInt(localStorage.getItem(skuid)) - 1).toString()
          );
        }
      } else {
        book.push(skuid);
        localStorage.setItem(skuid, "-1");
        localStorage.setItem("book", JSON.stringify(book));
      }
      this.showAddForm = true;
      this.snackbarService.openSnackBar(
        "You are not connected to internet books are stored locally kindly sync it",
        "cancel"
      );
      if (!this.booksRemoved[skuid]) {
        this.booksRemoved[skuid] = -1;
      } else {
        this.booksRemoved[skuid] = this.booksRemoved[skuid] - 1;
      }
      let updated: any = { skuId: skuid, stocks: this.booksRemoved[skuid] };
      let obj = this.booksUpdatedRemoved.find((obj) => obj.skuId === skuid);
      if (obj) {
        this.booksUpdatedRemoved.splice(
          this.booksUpdatedRemoved.indexOf(obj),
          1
        );
      }
      this.booksUpdatedRemoved.unshift(updated);
      this.removeDataSource = this.booksUpdatedRemoved;
    }
    this.removeForm.reset({
      skuIdRemove: "",
    });
    this.RemoveFormDirective.resetForm();
    this.removeSkuInput.nativeElement.focus();
  }
}
