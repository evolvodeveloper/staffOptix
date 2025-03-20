import { AfterViewInit, Component, OnInit } from '@angular/core';
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
  selector: 'app-ot-report',
  templateUrl: './ot-report.component.html',
  styleUrls: ['./ot-report.component.scss']
})
export class OtReportComponent implements OnInit, AfterViewInit {

  config: any;
  TotalQty: string;
  rows = [];
  temp = [];
  message: string;

  selectedDateRange = {
    startDate: moment().startOf('week'),
    endDate: moment().endOf('week'),
  };

  stopSpinner = true;
  employees_list = [];

  reportObj = {
    category: 'ALL',
    employeeCode: 'ALL',
    from: '',
    to: '',
  };
  categorys = [];

  constructor(
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private router: Router,
    private httpGet: HttpGetService,

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }

  ngOnInit(): void {
    this.globalServ.getMyCompLabels('otReport');
    this.globalServ.getMyCompPlaceHolders('otReport');
    this.getPayrollList();
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  getPayrollList() {
    this.httpGetService.getMasterList('empcategorys').subscribe(
      (res: any) => {
        res.response.unshift({ categoryCode: 'ALL' })
        this.categorys = res.response;
        this.getEmpByCategory(this.reportObj.category)
      }
    );
  }
  getEmpByCategory(value) {
    this.stopSpinner = false;
    this.rows = [];
    this.httpGetService.getMasterList('payrolls?category=' + value).subscribe(
      (res: any) => {
        const val = res.response.map(x => {
          x.mergeName = `${x.employeeName} - ${x.employeeCode}`;
          return x
        })
        if (res.response.length > 0) {
          val.unshift({
            employeeCode: 'ALL',
            employeeName: 'ALL',
            mergeName: 'ALL'
          })
        }
        this.employees_list = val;
        this.stopSpinner = true;
      }
    );
  }

  getEmployees() {
    this.spinner.show();
    this.httpGet.getMasterList('empbydepart').subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.response.length > 0) {
          res.response.unshift({
            employeeCode: 'ALL',
            employeeName: 'ALL'
          })
        }
        this.employees_list = res.response;
        // this.temp = [...this.employees_list];
      },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
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

  submit(): void {
    this.spinner.show();
    this.config.currentPage = 1;
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getMasterList('reports/getOtHrs?from=' +
      this.reportObj.from +
      '&to=' +
      this.reportObj.to +
      '&empCode=' +
      this.reportObj.employeeCode).subscribe(
        (res: any) => {
          res.response.forEach(element => {
            element.totalHours1 = this.modifyTime(element.totalHours);
            element.regularhours1 = this.modifyTime(element.regularhours);
            element.otHours1 = this.modifyTime(element.otHours);
          });
          this.rows = res.response;
          this.message = 'modified';
        this.spinner.hide();
          if (this.rows.length == 0) {
          Swal.fire({
            icon: 'info',
            title: 'NO RECORD FOUND!',
          });
          }
        this.temp = [...this.rows];
        // this.getTotal()
      },
      (err) => {
        this.spinner.hide();
        this.message = 'error'
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }
  modifyTime(time) {
    const resultInEXHMinutes = time ? time * 60 : 0;
    const exh = Math.floor(resultInEXHMinutes / 60);
    const exhours = exh < 10 ? '0' + exh : exh
    const exm = Math.floor(resultInEXHMinutes % 60);
    const exminutes = exm < 10 ? '0' + exm : exm
    return exhours + ':' + exminutes
  }
  saveExcel() {
    this.spinner.show();
    const obj = {
      employee_id: this.reportObj.employeeCode,
      start_date: this.reportObj.from,
      end_date: this.reportObj.to,
    };
    this.httpGetService
      .getExcel(
        'reports/OtHrsXlsx?employeeCode=' +
        obj.employee_id +
        '&from=' +
        obj.start_date +
        '&to=' +
        obj.end_date
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        const fileName = 'OT_Report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_');
        FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
        this.globalServ.showSuccessPopUp('Excel', 'success', fileName);
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
  savePDF(): void {
    this.spinner.show();
    this.httpGetService.getPdf('reports/OtHrs/pdf?employeeCode=' + this.reportObj.employeeCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      const fileName = 'OT_Report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_');
      FileSaver.saveAs(file, fileName + '.pdf');
      this.globalServ.showSuccessPopUp('Pdf', 'success', fileName);
      // const fileURL = URL.createObjectURL(file);
      // window.open(fileURL);
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
  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }

  back() {
    this.router.navigateByUrl('/rpt');
  }


}
