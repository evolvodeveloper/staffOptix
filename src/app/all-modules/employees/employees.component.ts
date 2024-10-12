import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  rows = [];
  temp = [];
  dateFormat: string;
  config: any;
  value: string
  hasPermission = false;
  constructor(
    private router: Router,
    private httpGetService: HttpGetService,
    private UtilServ: UtilService,
    public global: GlobalvariablesService,
    private spinner: NgxSpinnerService

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length
    };
  }

  ngOnInit(): void {
    this.spinner.show();
    // this.temp = [...this.rows];
    this.httpGetService.getMasterList('employees').subscribe(
      (res: any) => {
        res.response.sort((a, b) => {
          return a.employeeid - b.employeeid;
        });
        this.rows = res.response;
        this.dateFormat = this.global.dateFormat;
        // this.value = 'prasad'
        this.temp = [...this.rows];
        // this.updateFilter('prasad')
        this.spinner.hide();
      },
      (err) => {
        console.error(err.error.status.message);
        this.spinner.hide();
      }
    );
  }

  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.employeeName.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }


  viewData(row) {
    this.UtilServ.viewData = row;
    this.router.navigateByUrl('employees-list/create-employee');
  }

  editData(row) {
    this.UtilServ.editData = row;
    this.router.navigateByUrl('employees-list/create-employee');
  }

  create() {
    this.router.navigateByUrl('employees-list/create-employee')
  }
}
