import { Component, OnInit } from "@angular/core";
import { ElectronService } from "./core/services";
import { TranslateService } from "@ngx-translate/core";
import { AppConfig } from "../environments/environment";
// import { InternetService } from "./services/internet.service";

declare let csv: any;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  // internetConnection: boolean = true;
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService // private connectionService: InternetService
  ) {
    this.translate.setDefaultLang("en");
    console.log("AppConfig", AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log("Run in electron");
      console.log("Electron ipcRenderer", this.electronService.ipcRenderer);
      console.log("NodeJS childProcess", this.electronService.childProcess);
      // this.electronService.ipcRenderer.on(
      //   "Internet:Status",
      //   (event, status) => {
      //     this.internetConnection = status;
      //   }
      // );
    } else {
      console.log("Run in browser");
    }
  }
  // ngOnInit() {
  //   console.log("hi called");
  //   // console.log(this.connectionService);
  //   // this.connectionService.checkInternet().subscribe((isConnected) => {
  //   //   console.log(isConnected);
  //   //   this.internetConnection = isConnected;
  //   // });
  // }
}
