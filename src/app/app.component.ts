import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { GlobalvariablesService } from './services/globalvariables.service';
import { UtilService } from './services/util.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'attendance';

  constructor(private globalServ: GlobalvariablesService,
    private authenticationService: AuthenticationService, public uilSer: UtilService) { }
  getIPAdress(): void {
    this.authenticationService.getIPAdress().subscribe((res: any) => {
      localStorage.setItem('Ipaddress', res.ip)
    });
  }
  ngOnInit(): void {
    this.getIPAdress();
    if (localStorage.getItem('user-data')) {
      this.globalServ.setAppvariables(null);
    }

    $(document).on('click', '#toggle_btn', () => {
      if ($('body').hasClass('mini-sidebar')) {
        $('body').removeClass('mini-sidebar');
        $('.subdrop + ul').slideDown();
      } else {
        $('body').addClass('mini-sidebar');
        $('.subdrop + ul').slideUp();
      }
      return false;
    });

    $(document).on('mouseover', (e) => {
      e.stopPropagation();
      if (
        $('body').hasClass('mini-sidebar') &&
        $('#toggle_btn').is(':visible')
      ) {
        const targ = $(e.target).closest('.sidebar').length;
        if (targ) {
          $('body').addClass('expand-menu');
          $('.subdrop + ul').slideDown();
        } else {
          $('body').removeClass('expand-menu');
          $('.subdrop + ul').slideUp();
        }
        return false;
      }
    });

    $('body').append('<div class="sidebar-overlay"></div>');
    $(document).on('click', '#mobile_btn', function () {
      const $wrapper = $('.main-wrapper');
      $wrapper.toggleClass('slide-nav');
      $('.sidebar-overlay').toggleClass('opened');
      $('html').addClass('menu-opened');
      $('#task_window').removeClass('opened');
      return false;
    });

    $('.sidebar-overlay').on('click', function () {
      const $wrapper = $('.main-wrapper');
      $('html').removeClass('menu-opened');
      $(this).removeClass('opened');
      $wrapper.removeClass('slide-nav');
      $('.sidebar-overlay').removeClass('opened');
      $('#task_window').removeClass('opened');
    });
  }
}
