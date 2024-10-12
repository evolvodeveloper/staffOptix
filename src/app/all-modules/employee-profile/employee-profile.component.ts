import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

import { HttpPostService } from '../../services/http-post.service';
import { ProfilePicComponent } from '../all-payroll-employees/profile-pic/profile-pic.component';
@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
})
export class EmployeeProfileComponent implements OnInit {
  employee_id: any;
  employee_details: any;
  family_info: any = [];
  branchForm: FormGroup;
  setTimeId: any;
  userProfile: any;
  company: any;
  option: any;
  pdfSrc: any;
  logoModified = false;
  stopSpinner = false;
  companyImgbite: any;
  userIsAdmin = false;
  branchview = false;
  companyLogoPresent = false;
  dateFormat: string;
  emp: any;
  profilePic: any;
  roles: any;
  firstTab = true;
  secondTab = false;
  modifiedDocuments = false;
  expensesByEmp = [];

  fulldate = moment().format('YYYY-MM');

  config: any;
  config1: any;
  TotalQty: string;
  rows = [];
  temp = [];
  employees_list = [];
  searchedFor: string;
  reportObj = {
    employeeCode: 'ALL',
  };
  PreviewObject: any;
  shortName: string;
  empDoc = [];
  constructor(
    private httpGet: HttpGetService,
    private router: Router,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private utilServ: UtilService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private httpPost: HttpPostService,
    private acRoute: ActivatedRoute,
    public globalServ: GlobalvariablesService,
    private httpPutServ: HttpPutService
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
    this.config1 = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }
  getUserProfile() {
    this.spinner.show();
    this.userProfile = this.utilServ.userProfileData;
    if (this.utilServ.userProfileData !== undefined) {
      this.getEmployeeData(this.userProfile.employeeCode);
      if (this.utilServ.userProfileData.image) {
        const header = 'data:image/' + this.utilServ.userProfileData.fileType + ';base64,';
        this.profilePic = header.concat(this.utilServ.userProfileData.image)
      }
      this.userProfile.rolesWithBr = this.utilServ.userProfileData.roles.join(', ');

      // this.userProfile.rolesWithBr = this.utilServ.userProfileData.roles.reduce((acc, role, index) => {
      //   acc += role;
      //   if ((index + 1) % 3 === 0 && index !== this.utilServ.userProfileData.roles.length - 1) {
      //     acc += "<br>";
      //   } else if (index !== this.utilServ.userProfileData.roles.length - 1) {
      //     acc += ",";
      //   }
      //   return acc;
      // }, "");

      this.spinner.hide();
    }
    else {
      this.setTimeId = setTimeout(() => {
        this.getUserProfile.call(this)
      })
    }
  }

  ngOnInit() {
    this.globalServ.getMyCompLabels('empProfile');
    this.globalServ.getMyCompPlaceHolders('empProfile');
    this.globalServ.getMyCompLabels('expensesComp');
    this.globalServ.getMyCompPlaceHolders('expensesComp');

    this.getEmpALLreports();
    this.getUserProfile.call(this);
    this.dateFormat = this.globalServ.dateFormat;
    this.getEmployees();
    this.getEmpDocs();
    this.dateChange();
  }

  getPayslip() {
    this.spinner.show();
    const dateSplit = this.fulldate.split('-');
    const month = dateSplit[1];
    const year = dateSplit[0];
    this.httpGet.getPdf('reports/payslip/pdf/mob?empCode=' + '&year=' +
      year + '&month=' + month + '&date=' + '01').subscribe((res: any) => {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        this.pdfSrc = fileURL;
        this.spinner.hide();
      },
        err => {
          this.spinner.hide();
          console.error(err);
        })
  }

  dateChange() {
    const dateSplit = this.fulldate.split('-');
    const month = dateSplit[1];
    const year = dateSplit[0];
    this.getExpensesList(month, year);
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
          });
        }
        this.employees_list = res.response;
        this.stopSpinner = true;
      },
      (err) => {
        this.spinner.hide();
        this.stopSpinner = true;
        console.error(err.error.status.message);
      }
    );
  }

  getExpensesList(month, year) {
    this.spinner.show();
    this.httpGet.getMasterList('employeeexpensess?year=' + year + '&month=' + month).subscribe((res: any) => {
      this.rows = res.response;
      this.temp = res.response;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      console.error(err.error.status.message);
    });
  }


  getEmpALLreports() {
    this.option = {
      legend: {
        top: '90%'
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      series: [
        {
          name: 'Nightingale Chart',
          type: 'pie',
          // radius: [50, 250],
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          roseType: 'area',
          itemStyle: {
            borderRadius: 8
          },
          data: [
            { value: 40, name: 'Leave' },
            { value: 38, name: 'Absent' },
            { value: 32, name: 'OT' },
            { value: 30, name: 'Shift' },
            { value: 28, name: 'Early Late' },
            { value: 26, name: 'Expenses' }
          ]
        }
      ]
    };

  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.title.toLowerCase().indexOf(val) !== -1 || d.subcategoryCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }


  pageChanged(event) {
    this.config.currentPage = event;
  }

  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }

  addExpense() {
    this.router.navigateByUrl('expenses/add-expense');
  }

  viewData(row) {
    this.utilServ.viewData = row;
    this.router.navigateByUrl('expenses/add-expense');
  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('expenses/add-expense');
  }

  editProfile(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('employees-list/create-employee');
  }
  getInitials(firstName: string, lastName: string) {
    const firstInitial = firstName ? firstName?.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    const fN = firstInitial.toLocaleUpperCase();
    const LN = lastInitial.toLocaleUpperCase();
    return `${fN}${LN}`;
  }


  getEmployeeData(employeeCode) {
    this.spinner.show();
    this.httpGet
      .getEmployeeDetails(employeeCode)
      .subscribe((res: any) => {
        this.employee_details = res.response;
        this.emp = res.response.employeeMaster;
        this.getdocuments(employeeCode)
        this.shortName = this.getInitials(res.response.employeeMaster.employeeName, res.response.employeeMaster.lastName)
        if (res.response.employeeDetails !== null) {
          this.family_info = JSON.parse(
            this.employee_details?.employeeDetails?.employeeDetails
          );
        }
        this.spinner.hide();
      },
        (err) => {
          this.spinner.hide();
          console.error(err.error.status.message);

        });
  }
  getEmpDocs() {
    this.httpGet.getMasterList('docs').subscribe(
      (res: any) => {
        const empDoc = res.response;
        empDoc.map(x => ({ ...x, imageByteCode: null, fileName: null, fileType: null, preview: false, fileContent: null }));
        this.empDoc = empDoc;
      },
      err => {
        console.error(err?.error?.status?.message);

      }
    );
  }
  getdocuments(empCode) {
    this.httpGet.getMasterList('empDocuments?empCode=' + empCode).subscribe((res: any) => {
      const docRes = res.response;
      this.empDoc.forEach((element) => {
        const find = docRes.find(x => x.documentName == element.documentName)
        if (find) {
          element.image = find.image;
          element.documentType = find.documentType
          element.fileName = find.fileName
          element.fileType = find.fileType
          element.imageByteCode = 'data:' + find.documentType + ';base64,' + find.image
          element.docId = find.docId
          element.createddate = find.createddate
          element.createdby = find.createdby
          element.branchCode = find.branchCode
          element.companyCode = find.companyCode
          element.fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(element.imageByteCode);
        }
      })
    })
  }
  previewRow(data) {
    this.PreviewObject = data
  }

  open() {
    const dialogRef = this.dialog.open(ProfilePicComponent, {
      disableClose: true,
      hasBackdrop: true,
      data: {
        employee: this.emp,
      },
      width: '30%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.emp = result.event;
      this.logoModified = true;
      this.emp.fileType;
      if (this.emp.imageByte) {
        this.submit();
      }
      // this.emp.fileName = this.addEmployeeForm.controls.employeeName.value + '_image'
    });
  }
  submit() {
    this.spinner.show();
    const obj = {
      "employeeid": this.employee_details.employeeMaster.employeeid,
      "employeeCode": this.employee_details.employeeMaster.employeeCode,
      "fileName": this.employee_details.employeeMaster.employeeName + '_image',
      "image": this.emp.imageByte,
      "fileType": this.emp.fileType
    }
    this.httpPutServ.doPut('employee/image', JSON.stringify(obj))
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.employee_details.employeeMaster.employeeName + ' Pic Updated',
            icon: 'success',
            timer: 10000,
          })
        }
        else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      }, (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }


  extractMimeType(dataUrl: string): string {
    const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    return match ? match[1] : '';
  }
  openFileInput(inputId: string) {
    document.getElementById(inputId).click();
  }
  getBase64(ev: any, row: any) {
    const maxSize = 10485760; // 10 MB in bytes

    const found = this.empDoc.findIndex(x => { x.documentName == row.documentName && (x.image !== null || x.image !== undefined) })
    let base64Result: any;
    if (ev.target.files.length > 0 && ev.target.files[0].size < maxSize) {
      const file = ev.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        base64Result = reader.result;
        if (base64Result !== null) {
          this.modifiedDocuments = true
          const base64 = base64Result?.replace(/^data:.*?;base64,/, '');
          const mimeType = this.extractMimeType(base64Result);
          if (found == -1) {
            const obj = this.empDoc.find(x => x.documentName == row.documentName);
            obj.imageByteCode = base64Result;
            obj.image = base64;
            obj.fileName = file.name;
            obj.documentType = mimeType,
              obj.fileType = file.name.split('.').pop();
            obj.fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(base64Result);
          } else {
            const index = this.empDoc.findIndex(x => x.documentName == row.documentName)
            this.empDoc[index].imageByteCode = base64Result;
            this.empDoc[index].image = base64;
            this.empDoc[index].fileName = file.name;
            this.empDoc[index].documentType = mimeType,
              this.empDoc[index].documentName = row.documentName,
              this.empDoc[index].fileType = file.name.split('.').pop();
            this.empDoc[index].fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(base64Result);
          }
        }
      }
    }
    else {
      Swal.fire({
        title: 'Info',
        html: 'File size exceeds the limit of 10 Mb',
        icon: 'warning',
      })
    }
  }
  submitDocuments() {
    let doc = [];
    doc = this.empDoc.filter(x => x.image)
    this.employee_details.documents = doc;
    this.spinner.show();
    this.httpPutServ.doPut('employeeInfo', JSON.stringify(this.employee_details)).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: 'Documents Uploaded',
            icon: 'success',
            timer: 10000,
          })
          this.modifiedDocuments = false;
        }
        else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      }, (err) => {
        console.error(err.error.status.message);
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }

  tab1() {
    this.firstTab = true;
    this.secondTab = false;
  }
  tab2() {
    this.firstTab = false;
    this.secondTab = true;
  }

  savePdf() {
    this.spinner.show();
    window.open(this.pdfSrc);
    this.spinner.hide();
  }
}
