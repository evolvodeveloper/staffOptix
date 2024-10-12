import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-apply-loan]',
  templateUrl: './apply-loan.component.html',
  styleUrls: ['./apply-loan.component.scss']
})
export class ApplyLoanComponent implements OnInit, OnChanges, OnDestroy {
  @Input('app-apply-loan') loanApplicationData: any;
  @Output() loanApplicationEvent = new EventEmitter<string>();
  loanApplicationForm: FormGroup;
  open = false;
  view = false;
  maxLoanAmt: number;
  update = false;
  loansData = [];
  iamAdmin = false;
  userProfile: any;
  employees_list = [];
  constructor(
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private router: Router,
    private httpPut: HttpPutService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private UtilServ: UtilService
  ) { }
  ngOnInit(): void {
    this.loanApplicationForm = this.fb.group({
      employeeCode: [''],
      loanCode: ['', [Validators.required]],
      loanAmount: ['', [Validators.required]],
      approved: [false]
    })
  }
  checkMaxLoanAmt() {
    if (this.loanApplicationForm.controls.loanCode.value !== '' && this.loanApplicationForm.controls.loanCode.value !== null) {
      const data = this.loansData.find(x => x.loanCode == this.loanApplicationForm.controls.loanCode.value);
      this.maxLoanAmt = data.maxLoanAmount;
      if (data.isFixed) {
        this.loanApplicationForm.controls.loanAmount.setValue(data.maxLoanAmount);
        this.loanApplicationForm.controls.loanAmount.disable();
      } else {
        // this.loanApplicationForm.controls.loanAmount.setValue(null);
        this.loanApplicationForm.controls.loanAmount.enable();
      }
    }
    else {
      this.loanApplicationForm.controls.loanCode.setValue(null);
      this.loanApplicationForm.controls.loanAmount.enable();
      this.loanApplicationForm.controls.loanAmount.setValue(null);
    }
  }

  getLoans() {
    this.spinner.show();
    this.httpGet.getMasterList('loans').subscribe((res: any) => {
      this.loansData = res.response;

      if (this.UtilServ.editData) {
        this.loanApplicationForm.controls.loanCode.setValue(this.UtilServ.editData.loanCode)
        this.checkMaxLoanAmt();

      } else if (this.UtilServ.viewData) {
        this.loanApplicationForm.controls.loanCode.setValue(this.UtilServ.viewData.loanCode)
        // this.checkMaxLoanAmt();

      } else {
        this.loanApplicationForm.controls.loanCode.setValue(null);
      }
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err);
      })
  }
  getAllEmps() {
    this.employees_list = [];
    this.httpGet.getMasterList('employeesByCatAndDept?department=all&category=ALL').subscribe(
      (res: any) => {
        const val = res.response.map(x => {
          x.mergeName = `${x.employeeName} - ${x.employeeCode}`;
          return x
        })
        this.employees_list = val;
      },
      err => {
        console.error(err.error.status.message);
      })
  }

  ngOnChanges(loanApp: any): void {
    if (
      typeof loanApp !== 'undefined' &&
      typeof loanApp.loanApplicationData !== 'undefined' &&
      typeof loanApp.loanApplicationData.currentValue !== 'undefined' &&
      (loanApp.loanApplicationData.currentValue.type === 'NEW' ||
        loanApp.loanApplicationData.currentValue.type === 'VIEW' ||
        loanApp.loanApplicationData.currentValue.type === 'EDIT')
    ) {
      this.open = true;
      this.loanApplicationForm.enable()
      this.loanApplicationForm.reset();
      this.loanApplicationForm.controls.loanCode.setValue(null);
      delete this.UtilServ.viewData;
      delete this.UtilServ.editData;
      this.view = false;
      this.update = false;
      this.getAllEmps();
      this.getLoans();
      if (
        typeof loanApp.loanApplicationData.currentValue.viewData !==
        'undefined'
      ) {
        this.UtilServ.viewData =
          loanApp.loanApplicationData.currentValue.viewData;
        this.userProfile = loanApp.loanApplicationData.currentValue.userData;
        this.iamAdmin = this.userProfile.roles.includes('PROLL_MGR') || this.userProfile.roles.includes('ADMIN');
        this.init();
      } else if (
        typeof loanApp.loanApplicationData.currentValue.editData !==
        'undefined'
      ) {
        this.UtilServ.editData =
          loanApp.loanApplicationData.currentValue.editData;
        this.userProfile = loanApp.loanApplicationData.currentValue.userData;
        this.iamAdmin = this.userProfile.roles.includes('PROLL_MGR') || this.userProfile.roles.includes('ADMIN');
        this.init();
      } else {
        this.userProfile = loanApp.loanApplicationData.currentValue.userData;
        this.iamAdmin = this.userProfile.roles.includes('PROLL_MGR') || this.userProfile.roles.includes('ADMIN');
        this.loanApplicationForm.reset();
        this.loanApplicationForm.controls.employeeCode.setValue(this.userProfile.employeeCode);
        // this.loanApplicationForm.controls.loanCode.setValue('');
      }
    }
  }
  closeModal(): void {
    this.open = false;
    this.loanApplicationForm.reset();
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
    this.update = false;
    this.maxLoanAmt = null;
    this.view = false;
    this.loanApplicationForm.controls.loanCode.setValue('');
    this.loanApplicationEvent.emit();
  }
  init() {
    if (this.UtilServ.editData) {
      this.update = true; this.view = false;
      this.loanApplicationForm.controls.employeeCode.setValue(this.UtilServ.editData.employeeCode);
      this.loanApplicationForm.controls.loanAmount.setValue(this.UtilServ.editData.loanAmount);
      this.loanApplicationForm.controls.loanCode.setValue(this.UtilServ.editData.loanCode);
      this.loanApplicationForm.controls.approved.setValue(this.UtilServ.editData.approved);
      this.loanApplicationForm.enable();
      this.loanApplicationForm.controls.loanCode.disable();
      this.loanApplicationForm.controls.employeeCode.disable();
    } else if (this.UtilServ.viewData) {
      this.update = false; this.view = true;
      this.loanApplicationForm.controls.employeeCode.setValue(this.UtilServ.viewData.employeeCode);
      this.loanApplicationForm.controls.loanAmount.setValue(this.UtilServ.viewData.loanAmount);
      this.loanApplicationForm.controls.loanCode.setValue(this.UtilServ.viewData.loanCode);
      this.loanApplicationForm.controls.approved.setValue(this.UtilServ.viewData.approved);
      this.loanApplicationForm.disable();
      this.loanApplicationForm.controls.loanCode.disable();
      this.loanApplicationForm.controls.loanAmount.disable();
      this.loanApplicationForm.controls.employeeCode.disable();
    }
  }
  create() {
    this.spinner.show();
    let empCode: string
    if (this.iamAdmin) {
      empCode = this.loanApplicationForm.controls.employeeCode.value == null || this.loanApplicationForm.controls.employeeCode.value == '' ?
        this.userProfile.employeeCode : this.loanApplicationForm.controls.employeeCode.value
    } else {
      empCode = this.userProfile.employeeCode;
    }
    const obj = {
      "employeeCode": empCode,
      "loanCode": this.loanApplicationForm.controls.loanCode.value,
      "loanAmount": this.loanApplicationForm.controls.loanAmount.value,
    }
    this.httpPost.create('loanapplication', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Loan Created',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.loanApplicationForm.reset();
          this.closeModal();
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning', showConfirmButton: true,
        });
      }
    },
      (err) => {
        console.error(err.error.status.message);
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
  Update() {
    this.spinner.show();
    const obj = {
      "id": this.UtilServ.editData.id,
      "loanApplicationId": this.UtilServ.editData.loanApplicationId,
      "employeeCode": this.UtilServ.editData.employeeCode,
      "loanCode": this.loanApplicationForm.controls.loanCode.value,
      "loanAmount": this.loanApplicationForm.controls.loanAmount.value,
      "approved": this.loanApplicationForm.controls.approved.value,
      "buCode": this.UtilServ.editData.buCode,
      "tenantCode": this.UtilServ.editData.tenantCode,
      "createdby": this.UtilServ.editData.createdby,
      "createddate": this.UtilServ.editData.createddate,
      "lastmodifiedby": this.UtilServ.editData.lastmodifiedby,
      "lastmodifieddate": this.UtilServ.editData.lastmodifieddate,
      "approvedby": this.UtilServ.editData.approvedby,
      "approveddate": this.UtilServ.editData.approveddate,
    }
    this.httpPut.doPut('loanapplications', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Loan Updated',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.loanApplicationForm.reset();
          this.update = false;
          this.loanApplicationForm.enable();
          this.closeModal();
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning', showConfirmButton: true,
        });
      }
    },
      (err) => {
        console.error(err.error.status.message);
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
    this.update = false;
    this.maxLoanAmt = null;
    this.view = false;
  }
}
