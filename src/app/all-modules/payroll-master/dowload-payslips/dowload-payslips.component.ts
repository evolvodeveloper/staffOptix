import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dowload-payslips',
  templateUrl: './dowload-payslips.component.html',
  styleUrls: ['./dowload-payslips.component.scss']
})
export class DowloadPayslipsComponent implements OnInit {
  reportObj = {
    empCode: 'ALL',
    payrollCode: '',
    year: '',
    month: '',
    date: '01'
  }
  salaryFrequency: string;
  maxDt = moment().format('YYYY-MM-DD');
  pdfSrc: string;
  payrollsetups = [];
  stopSpinner = false;
  employee = [];
  fulldate;
  displayPayslipCount = false;
  constructor(private httpGet: HttpGetService,
    private http: HttpClient,
    private global: GlobalvariablesService,
    private spinner: NgxSpinnerService) { }
  ngOnInit() {
    this.displayPayslipCount = this.global.showSinglePayslipPerPage === 'Y' ? true : false
    this.getPayrollCodes();
  }

  getPayrollCodes() {
    this.httpGet.getMasterList('payrollsetups').subscribe(
      (res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({
            payrollCode: 'ALL',
          })

        }
        this.payrollsetups = res.response;
        const hasDefault = res.response.find(x => x.isDefault == true)
        if (hasDefault) {
          this.reportObj.payrollCode = (hasDefault.payrollCode)
        }
        else {
          this.reportObj.payrollCode = (res.response[0]?.payrollCode)
        }
        this.empByPayrollCode()
      },
      (err) => {
        console.error(err.error.status.message);
      }
    );
  }
  empByPayrollCode() {
    const foundRecord = this.payrollsetups.find(x => x.payrollCode == this.reportObj.payrollCode)
    this.salaryFrequency = foundRecord.salaryFrequency;
    if (foundRecord.salaryFrequency === 'Month' || this.reportObj.payrollCode == 'ALL') {
      this.fulldate = moment().format('YYYY-MM');
      this.maxDt = moment().format('YYYY-MM');
    } else {
      this.fulldate = moment().format('YYYY-MM-DD');
      this.maxDt = moment().format('YYYY-MM-DD');
    }
    this.stopSpinner = false;
    this.httpGet.getMasterList('empByPayrollCode?payrollCode=' + this.reportObj.payrollCode).subscribe((res: any) => {
      if (res.response.length > 0) {
        res.response.unshift({
          employeeCode: 'ALL',
          employeeName: 'ALL',
        })
      }
      this.employee = res.response;
      this.stopSpinner = true;
    },
      (err) => {
        this.stopSpinner = true;
        console.error(err.error.status.message);
      }
    );
  }
  submit() {
    const dateSplit = this.fulldate.split('-');
    if (dateSplit.length > 2) {
      this.reportObj.date = dateSplit[2];
      this.reportObj.month = dateSplit[1];
      this.reportObj.year = dateSplit[0];
    } else {
      this.reportObj.date = '01';
      this.reportObj.month = dateSplit[1];
      this.reportObj.year = dateSplit[0];
    }
    this.spinner.show();
    this.httpGet.getPdf('reports/payslip/pdf?empCode=' + this.reportObj.empCode +
      '&payrollCode=' + this.reportObj.payrollCode +
      '&year=' + this.reportObj.year + '&month=' + this.reportObj.month + '&date=' + this.reportObj.date + '&forTenant=' + this.displayPayslipCount).subscribe((res: any) => {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        this.pdfSrc = fileURL;
        this.spinner.hide();
        // window.open(this.pdfSrc);
        this.global.showSuccessPopUp('Pdf', 'success');
        // window.open(fileURL);
      },
        (err) => {
          this.spinner.hide();
          console.error(err);
          Swal.fire({
            title: 'Error!',
            icon: 'error',
          });
        }
      );
  }

  savePdf() {
    this.spinner.show();
    window.open(this.pdfSrc);
    this.spinner.hide();
  }
}
