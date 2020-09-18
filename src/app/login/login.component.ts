import { Component, OnInit, ViewChild } from "@angular/core";
import { SnackbarService } from "../services/snackbar.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  constructor(
    private snackBarService: SnackbarService,
    public fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  @ViewChild("loginform") loginFormDirective;
  loginForm: FormGroup;
  hideForm: boolean = false;
  formErrors = {
    username: "",
    password: "",
  };
  validationMessages = {
    username: {
      required: "Username is required.",
    },
    password: {
      required: "Password is required",
    },
  };

  ngOnInit(): void {
    this.createForm();
  }
  createForm() {
    this.loginForm = this.fb.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
    this.loginForm.valueChanges.subscribe((data) => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    console.log(this.loginForm.value);
    if (!this.loginForm) {
      return;
    }
    const form = this.loginForm;
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
  onSubmit() {
    this.hideForm = true;
    this.authService.logIn(this.loginForm.value).subscribe(
      (res) => {
        this.hideForm = false;
        this.router.navigateByUrl("/scan");
      },
      (error) => {
        this.hideForm = false;
        if (error.indexOf("401") !== -1) {
          this.snackBarService.openSnackBar(
            "Oops! Incorrect Password/Username",
            "cancel"
          );
        } else {
          this.snackBarService.openSnackBar(
            "Oops! Server Error please login after sometime",
            "cancel"
          );
        }
      }
    );
    this.loginFormDirective.resetForm();
    this.loginForm.reset({
      username: "",
      password: "",
    });
  }
}
