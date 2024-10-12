import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-department-wise-report',
  templateUrl: './department-wise-report.component.html',
  styleUrls: ['./department-wise-report.component.scss']
})
export class DepartmentWiseReportComponent implements OnInit {
  config: any;
  TotalQty: string;
  rows: any = [];
  temp = [];
  departments = [];
  message = 'clickOnsubmit';
  date = moment().format('YYYY-MM-DD');
  department = 'ALL';

  searchedFor: string;

  constructor(
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private global: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private router: Router
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }


  ngOnInit(): void {
    this.getDepartments();
  }

  getDepartments() {
    this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
      if (res.response.length > 0) {
        res.response.unshift({
          deptCode: 'ALL',
          deptName: 'ALL'
        })
      }
      this.departments = res.response;
    })
  }

 

  pageChanged(event) {
    this.config.currentPage = event;
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  modified() {
    this.rows = [];
    this.message = 'clickOnsubmit'
  }

  back() {
    this.router.navigateByUrl('/rpt');
  }

  submit(): void {
    this.spinner.show();   
    this.httpGetService.
      getMasterList('reports/pesentRptCountByDept?date=' + this.date )
      .subscribe(
        (res: any) => {
          this.rows = res.response;         
          this.spinner.hide();
          this.message = 'modified'
          if (this.rows.length == 0) {
            Swal.fire({
              icon: 'info',
              title: 'NO RECORD FOUND!',
              // text: 'ON SELECTED DATA',
            });
          }
          this.temp = [...this.rows];
        },
        (err) => {
          this.message = 'error'

          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
        }
      );
  }

  savePDF(): void {
    this.spinner.show();
    this.httpGetService.getPdf('reports/pesentRptCountByDept/pdf?date=' + this.date).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      FileSaver.saveAs(file, 'Department-wise-report' + new Date().getTime() + '.pdf');
      this.global.showSuccessPopUp('Pdf', 'success');
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }
  saveExcel() {
    this.spinner.show();
    this.httpGetService.getExcel('reports/pesentRptCountByDept/xls?date=' + this.date).subscribe((res: any) => {
      this.spinner.hide();
      const data: Blob = new Blob([res], { type: EXCEL_TYPE });
      FileSaver.saveAs(
        data,
        'Department-wise-report' + new Date().getTime() + EXCEL_EXTENSION);
      this.global.showSuccessPopUp('Excel', 'success');
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        })
      });
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.deptCode.toLowerCase().indexOf(val) !== -1;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }
}
