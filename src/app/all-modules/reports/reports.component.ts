import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
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
    let pages = [];
    this.utilServ.menuData = menuData;
    menuData.forEach((d) => {
      if (d.menuType == 'PAGE' && d.header == 'Reports') {
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
          pages.push({
            header: u,
            subPages: arr.sort((a, b) => {
              return a.priority - b.priority;
            }),
          });
        }
      });
    });
    this.pages = pages.sort((a, b) => {
      return b.header.localeCompare(a.header);
    })

  }
}