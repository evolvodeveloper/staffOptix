import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import $ from 'jquery';
import PerfectScrollbar from 'perfect-scrollbar';
import { HttpGetService } from 'src/app/services/http-get.service';
import { GlobalvariablesService } from '../services/globalvariables.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menu_listJSON = [];
  // sorted_menu = [];
  urlComplete = {
    mainUrl: "",
    subUrl: "",
    childUrl: "",
  };
  branchName: string;
  onlyoneBranch = false;

  companyName: string;
  sidebarMenus = {
    default: true,
    chat: false,
    settings: false,
  };
  displayBranch = false;
  branchCode: string;
  branchs: any;
  constructor(
    private router: Router,
    private httpGet: HttpGetService,
    private utilServ: UtilService,
    private globalServ: GlobalvariablesService
  ) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        $(".main-wrapper").removeClass('slide-nav');
        $(".sidebar-overlay").removeClass('opened');
        const url = event.url.split("/");
        this.urlComplete.mainUrl = url[1];
        this.urlComplete.subUrl = url[2];
        this.urlComplete.childUrl = url[3];
        if (url[1] === "") {
          this.urlComplete.mainUrl = "dashboard";
          this.urlComplete.subUrl = "admin";
        }

        if (url[2] === "chat" || url[2] === "calls") {
          this.sidebarMenus.chat = true;
          this.sidebarMenus.default = false;
        } else {
          this.sidebarMenus.chat = false;
          this.sidebarMenus.default = true;
        }
      }
    });
    // this.getSortedMenu();
  }


  checkLocalStorage() {
    const branch = localStorage.getItem('branch');
    if (branch !== null) {
      // branchCode
      this.branchs = JSON.parse(branch);
      this.branchSetting();
    }

    else {
      setTimeout(() => {
        this.checkLocalStorage.call(this);
      }, 1000);
    }
  }

  ngOnInit() {
    this.companyName = localStorage.getItem('companyName');
    const container =
      document.querySelector('#container');
    // or just with selector string
    const ps = new PerfectScrollbar('#container');
    container.scrollTop = 0;
    this.checkLocalStorage.call(this);

    $(document).on("click", "#sidebar-menu li", function (e) {
      e.stopImmediatePropagation();
      if ($(this).parent().hasClass("mainsub")) {
        e.preventDefault();
      }
      if (!$(this).hasClass("subdrop")) {
        $("ul", $(this).parents(".mainsub:first")).slideUp(350);
        $("li", $(this).parents(".mainsub:first")).removeClass("subdrop");
        $(this).next("div").slideDown(350);
        $(this).addClass("subdrop");
      } else if ($(this).hasClass("subdrop")) {
        $(this).removeClass("subdrop");
        $(this).next("div").slideUp(350);
      }
    });
    $(document).on('click', '#sidebar-menu a', function (e) {
      e.stopImmediatePropagation();
      if ($(this).parent().hasClass('submenu')) {
        e.preventDefault();
      }
      if (!$(this).hasClass('subdrop')) {
        $('ul', $(this).parents('ul:first')).slideUp(350);
        $('a', $(this).parents('ul:first')).removeClass('subdrop');
        $(this).next('ul').slideDown(350);
        $(this).addClass('subdrop');
      } else if ($(this).hasClass('subdrop')) {
        $(this).removeClass('subdrop');
        $(this).next('ul').slideUp(350);
      }
    });
    this.menu_listJSON = this.globalServ.menu_listJSON;
  }
  getBranchCategory(code) {
    this.branchCode = code;
    console.warn('branchCode', this.branchCode);
    this.httpGet
      .getMasterList('switchtoken?branch=' + this.branchCode)
      .subscribe(
        (res: any) => {
          if (res.status.message === 'SUCCESS') {
            location.reload();
            this.globalServ.setAppvariables(res.response);
          }
        },
        (err) => {
          console.error(err);
        }
      );
  }
  branchSetting() {
    if (this.branchs.length > 0) {
      this.displayBranch = true;
      // if (this.branchs.length == 1) {
      //   this.onlyoneBranch = true;
      // }
      console.log('branchs', this.branchs, this.onlyoneBranch, localStorage.getItem('branchCode'));
      this.onlyoneBranch = this.utilServ.userProfileData ? this.utilServ.userProfileData.isMultibranch:false;

      if (localStorage.getItem('branchCode')) {
        const row = this.branchs.find(x => x.branchCode === localStorage.getItem('branchCode'));
        if (row) {
          this.branchCode = row.branchCode;
          this.branchName = row.branchName;
        } else {
          this.branchs.forEach((x) => {
            if (x.headoffice == true) {
              localStorage.setItem('branchCode', x.branchCode)
              this.branchCode = x.branchCode;
              this.branchName = x.branchName;
            }
          })
        }
      } else {
        this.branchs.forEach((x) => {
          if (x.headoffice == true) {
            localStorage.setItem('branchCode', x.branchCode)
            this.branchCode = x.branchCode;
            this.branchName = x.branchName;
          }
        });
      }
    }
  }
}
