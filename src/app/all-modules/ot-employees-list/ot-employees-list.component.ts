import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ot-employees-list',
  templateUrl: './ot-employees-list.component.html',
  styleUrls: ['./ot-employees-list.component.scss']
})
export class OtEmployeesListComponent implements OnInit {
  config: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  dateFormat: string;
  otAssignedEmps = [];
  payrollCode: string;
  searhedFor: string;
  temp = [];
  payrollCodesList = [];
  startdate = new Date().toISOString().substr(0, 10);
  constructor(
    private httpGet: HttpGetService,
    private router: Router,
    private httpPost: HttpPostService,
    private acRoute: ActivatedRoute,
    private utilServ: UtilService,
    private global: GlobalvariablesService,
    private httPut: HttpPutService,
    private spinner: NgxSpinnerService,
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.otAssignedEmps.length,
    };
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.otAssignedEmps = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.otAssignedEmps = temp;
    }
  }
  ngOnInit() {
    this.dateFormat = this.global.dateFormat;
    this.getPayrollCodes();
    // this.acRoute.data.subscribe(data => {
    //   const permission = data.condition
    //   this.hasPermissionToUpdate = permission.hasPermissionToUpdate
    //   this.hasPermissionToApprove = permission.hasPermissionToApprove
    // });
  }
  getPayrollCodes() {
    this.httpGet.getMasterList('payrollsetups').subscribe((res: any) => {
      this.payrollCodesList = res.response;
      const row = res.response.find(x => x.isDefault == true);
      if (row) {
        this.payrollCode = row.payrollCode
        this.getOtAssignedEmps();
      } else {
        if (res.response.length === 1) {
          this.payrollCode = res.response[0].payrollCode;
          this.getOtAssignedEmps();
        }
      }
    })
  }


  deleteRow(row) {
    const obj = {
      branchCode: row.branchCode,
      companyCode: row.companyCode,
      createdby: row.createdby,
      createddate: row.createddate,
      dateCode: row.dateCode,
      employeeCode: row.employeeCode,
      employeeName: row.employeeName,
      id: row.id,
      payrollCode: row.payrollCode,
      status: 'Deleted'
    }
    this.httPut.doPut('manualOtByPayroll', obj).subscribe((res: any) => {
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Record Deleted',
          icon: 'success'
        })
        row.status = 'Deleted';
      }
      else {
        Swal.fire({
          text: res.status.message,
          icon: 'warning'
        })
      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error'
        })
      })
  }
  getOtAssignedEmps() {
    this.spinner.show();
    this.httpGet.getMasterList('manualOtByPayroll?payrollCode=' + this.payrollCode + '&date=' + this.startdate).subscribe((res: any) => {
      this.otAssignedEmps = res.response;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err);

      })
  }
  back() {
    this.router.navigateByUrl('/dashboard');
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  openOtAssignment() {
    this.router.navigateByUrl('/OtEmployees/otEmp')
  }
}
