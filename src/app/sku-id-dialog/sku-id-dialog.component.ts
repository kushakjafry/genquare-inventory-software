import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-sku-id-dialog",
  templateUrl: "./sku-id-dialog.component.html",
  styleUrls: ["./sku-id-dialog.component.scss"],
})
export class SkuIdDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<SkuIdDialogComponent>) {}

  ngOnInit(): void {}
  data: any = {
    skuId: "",
  };

  onNoClick() {
    this.dialogRef.close();
  }
}
