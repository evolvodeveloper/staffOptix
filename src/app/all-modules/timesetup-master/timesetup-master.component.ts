import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-timesetup-master',
  templateUrl: './timesetup-master.component.html',
  styleUrls: ['./timesetup-master.component.scss']
})
export class TimesetupMasterComponent implements OnInit {
  pages = [];
  data = [];
  constructor(
    private router: Router,
    private globalVariables: GlobalvariablesService,
    private utilServ: UtilService
  ) {

  }

  ngOnInit(): void {
    if (this.utilServ.menuData.length > 0) {
      this.getMenuAccessForPage(this.utilServ.menuData);
    } else {
      this.globalVariables.menuDataSubject.subscribe((res: any) => {
        this.getMenuAccessForPage(res);
      })
    }
  }
  goto(route) {
    this.router.navigate([`${route}`]);
  }

  getMenuAccessForPage(menuData) {
    this.utilServ.menuData = menuData;
    menuData.forEach((d) => {
      if (d.menuType == 'PAGE') {
        this.data.push(d);
      }
    });
    const arrayUniqueByKey = [
      ...new Set(this.data.map((item) => item.category)),
    ];

    arrayUniqueByKey.forEach((u) => {
      const arr = [];
      this.data.forEach((d, j) => {
        if (u == d.category) {
          arr.push(d);
        }
        if (j == this.data.length - 1) {
          this.pages.push({
            header: u,
            subPages: arr.sort((a, b) => {
              return a.priority - b.priority;
            }),
          });
        }
      });
    });
  }
}
