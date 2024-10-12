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
  sidebarMenus = {
    default: true,
    chat: false,
    settings: false,
  };

  constructor(
    private router: Router,
    private httpGet: HttpGetService,
    private UtilServ: UtilService,
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

  ngOnInit() {
    const container =
      document.querySelector('#container');
    // or just with selector string
    const ps = new PerfectScrollbar('#container');
    container.scrollTop = 0;

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
}
