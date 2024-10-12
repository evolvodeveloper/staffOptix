import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalvariablesService } from '../services/globalvariables.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-all-modules',
  templateUrl: './all-modules.component.html',
  styleUrls: ['./all-modules.component.scss']
})
export class AllModulesComponent {
  public innerHeight: any;
  isSpecialRoute: boolean;
  remainingdays: number;
  showGif: boolean;
  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef, private global: GlobalvariablesService, private router: Router, private utilService: UtilService) {
    this.showGif = this.utilService.showGif;
    this.router.events.subscribe(() => {
      this.isSpecialRoute = this.router.url == '/dashboard'; // Adjust the condition based on your route structure
    });
    window.onresize = () => {
      this.ngZone.run(() => {
        this.innerHeight = window.innerHeight + "px";
      });
    };
    this.getScreenHeight();
    if (this.utilService.planStatus !== undefined) {
      this.remainingdays = this.utilService.planStatus?.remaimingDays
    }

    this.utilService?.isTokenExpired();

    this.callme.call(this);
    // function checkDevTools() {
    //   const widthThreshold = 160;
    //   const heightThreshold = 160;

    //   const isDevToolsOpened = window.outerWidth - window.innerWidth > widthThreshold
    //     || window.outerHeight - window.innerHeight > heightThreshold;

    //   if (isDevToolsOpened) {
    //     // Here you can take some action, like showing a message or disabling functionality
    //   }
    // }

    // // Call the checkDevTools function periodically to check
    // setInterval(checkDevTools, 1000);

  }

  getScreenHeight() {
    this.innerHeight = window.innerHeight + "px";
  }

  onResize(event) {
    this.innerHeight = event.target.innerHeight + "px";
  }

  callme() {
    if (this.global.menu_listJSON.length > 0) {
      this.showGif = this.utilService.showGif;
    } else {
      setTimeout(() => {
        this.callme.call(this)
      })
    }
  }
}
