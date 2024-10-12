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
  selector: 'app-payroll-component-list',
  templateUrl: './payroll-component-list.component.html',
  styleUrls: ['./payroll-component-list.component.scss']
})
export class PayrollComponentListComponent implements OnInit {
  reportObj = {
    project: 'ALL',
    department: 'ALL',
    empCode: ''
  };

  message: string;
  stopSpinner = true;
  employees_list = [];
  payrollList = [];
  showComponentCode = false;
  departments = [];
  projects = [];

  reportObj2 = {
    payrollCode: null,
    salary: null
  }
  payrollSetupList = [];
  firstTab = true;
  secondTab = false;
  showSalaryBreakup = false;
  salaryBreakupList = [];
  constructor(
    private httpGet: HttpGetService,
    private acRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private router: Router,
    public globalServ: GlobalvariablesService,
    private httpPOst: HttpPostService,
    private httpPutServ: HttpPutService
  ) {
  }
  tab1() {
    this.firstTab = true;
    this.secondTab = false;
  }
  tab2() {
    this.firstTab = false;
    this.secondTab = true;
  }
  ngOnInit() {
    this.globalServ.getMyCompLabels('salaryMaster');
    this.globalServ.getMyCompPlaceHolders('salaryMaster');
    this.getProjects();
    this.getDepartments();
    this.employeesByDepartmentAndProject();
    this.getPayrollSetup();
  }

  getDepartments() {
    this.httpGet.getMasterList('depts/active').subscribe((res: any) => {
      res.response.unshift({
        deptCode: 'ALL',
        deptName: 'ALL'
      })
      this.departments = res.response
    })
  }
  getProjects() {
    this.httpGet.getMasterList('empcategorys').subscribe(
      (res: any) => {
        res.response.unshift({
          categoryCode: 'ALL',
        })
        this.projects = res.response;
      }
    );
  }
  getPayrollSetup() {
    this.httpGet.getMasterList('payrollsetups').subscribe(
      (res: any) => {
        this.payrollSetupList = res.response;
      }
    );
  }

  getSalaryBreakuo() {
    this.spinner.show();
    this.showSalaryBreakup = false;
    this.httpGet.getMasterList('getsalbreakup?payrollCode=' + this.reportObj2.payrollCode + '&sal=' + this.reportObj2.salary).subscribe((res: any) => {
      this.showSalaryBreakup = true;
      this.salaryBreakupList = res.response;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.error.status.message,
        });
        console.error(err.error.status.message);
      })
  }


  getPayroll() {
    this.payrollList = []; this.spinner.show();
    this.httpGet.getMasterList('componentsforemp?empCode=' + this.reportObj.empCode).subscribe(
      (res: any) => {
        const a = res.response.sort((a, b) => a.sortOrder - b.sortOrder)
        a.forEach(element => {
          element.amountStr = null;
        });
        this.payrollList = a;
        this.showComponentCode = true;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);
      });
  }
  modified() {
    this.payrollList = [];
    this.message = 'clickOnsubmit'
  }
  employeesByDepartmentAndProject() {
    this.stopSpinner = false;
    this.httpGet
      .getMasterList('employeesByCatAndDept?department=' + this.reportObj.department + '&category=' + this.reportObj.project)
      .subscribe((res: any) => {
        this.employees_list = res.response;
        this.stopSpinner = true;
      },
        err => {
          this.stopSpinner = false;
          console.error(err.error.status.message);
        }
    );
  }

  submit() {
    this.spinner.show();
    const payList = [];
    this.payrollList.forEach(element => {
      payList.push(
        {
          componentCode: element.componentCode,
          amount: element.amountStr,
          employeeCode: this.reportObj.empCode,
        }
      );
    });
    this.httpPOst.create('payrollcomponent', payList).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: this.reportObj.empCode + ' Payroll Created',
          }).then(() => {
            this.payrollList = [];
            this.reportObj.empCode = null;
          })
        }
      },
      err => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.error.status.message,
        });
      });
  }
}