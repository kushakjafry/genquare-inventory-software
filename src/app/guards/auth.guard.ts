import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { SnackbarService } from "app/services/snackbar.service";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: AuthService,
    private snackbarService: SnackbarService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const JSONUser = JSON.parse(localStorage.getItem("JWT"));
    if (navigator.onLine) {
      if (JSONUser) {
        return true;
      } else {
        this.snackbarService.openSnackBar(
          `Kindly login to open the page`,
          "cancel"
        );
        this.router.navigate(["/login"]);
        return false;
      }
    } else {
      return true;
    }
  }
}
