import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BookListComponent } from "./book-list/book-list.component";
import { LoginComponent } from "./login/login.component";
import { AuthGuard } from "./guards/auth.guard";
import { AddBookComponent } from "./add-book/add-book.component";
import { BarcodeScanComponent } from "./barcode-scan/barcode-scan.component";
import { SyncBookComponent } from "./sync-book/sync-book.component";

const routes: Routes = [
  { path: "book", component: BookListComponent, canActivate: [AuthGuard] },
  { path: "addbook", component: AddBookComponent, canActivate: [AuthGuard] },
  { path: "scan", component: BarcodeScanComponent, canActivate: [AuthGuard] },
  { path: "sync", component: SyncBookComponent, canActivate: [AuthGuard] },
  { path: "login", component: LoginComponent },
  { path: "", redirectTo: "/scan", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
