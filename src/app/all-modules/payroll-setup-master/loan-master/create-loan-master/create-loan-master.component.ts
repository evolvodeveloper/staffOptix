import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-create-loan-master]',
  templateUrl: './create-loan-master.component.html',
  styleUrls: ['./create-loan-master.component.scss']
})
export class CreateLoanMasterComponent implements OnInit, OnChanges, OnDestroy {
  @Input('app-create-loan-master') selectedLoanData: any;
  @Output() selectedLoanEvent = new EventEmitter<string>();
  open = false;
  view = false;
  update = false;
  selectedLoan: any;
  loanMaster: FormGroup;
  constructor(
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private router: Router,
    private httpPut: HttpPutService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private UtilServ: UtilService
  ) { }
  back() {
    this.router.navigateByUrl('dashboard')
  }
  decimalValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const decimalPattern = /^\d{0,3}(\.\d{1,2})?$/;
      if (control.value && !decimalPattern.test(control.value)) {
        return { 'invalidDecimal': true };
      }
      return null;
    };
  }
  closeModal(): void {
    this.open = false;
    this.selectedLoanEvent.emit();
  }
  ngOnChanges(department: any): void {
    if (
      typeof department !== 'undefined' &&
      typeof department.selectedLoanData !== 'undefined' &&
      typeof department.selectedLoanData.currentValue !== 'undefined' &&
      (department.selectedLoanData.currentValue.type === 'NEW' ||
        department.selectedLoanData.currentValue.type === 'VIEW' ||
        department.selectedLoanData.currentValue.type === 'EDIT')
    ) {
      this.open = true;
      this.loanMaster.enable();
      delete this.UtilServ.viewData;
      delete this.UtilServ.editData;
      this.view = false;
      this.update = false;
      if (
        typeof department.selectedLoanData.currentValue.viewData !==
        'undefined'
      ) {
        this.UtilServ.viewData =
          department.selectedLoanData.currentValue.viewData;
        this.init();
      } else if (
        typeof department.selectedLoanData.currentValue.editData !==
        'undefined'
      ) {
        this.UtilServ.editData =
          department.selectedLoanData.currentValue.editData;
        this.init();
      } else {
        this.loanMaster.reset();
        this.loanMaster.controls.isFixed.setValue(false);
      }
    }
  }

  ngOnInit() {
    this.loanMaster = this.fb.group({
      loanCode: ['', [Validators.required, Validators.maxLength(56), this.httpPost.customValidator()]],
      loanDescription: ['', [Validators.maxLength(100)]],
      loanType: ['', [Validators.required]],
      interestRate: [0, [this.decimalValidator()]],
      emiType: [''],
      noOfInstalments: ['', Validators.required],
      maxLoanAmount: [''],
      isFixed: [false]
    })
  }
  onTypeChange(value) {
    if (value == 'Advance') {
      this.loanMaster.get('emiType').clearValidators();  
      this.loanMaster.get('emiType').updateValueAndValidity();
      this.loanMaster.get('noOfInstalments').clearValidators();
      this.loanMaster.get('noOfInstalments').updateValueAndValidity();
    } else {
      // this.loanMaster.get('emiType').setValidators([Validators.required]);
      // this.loanMaster.get('emiType').updateValueAndValidity();
      this.loanMaster.get('noOfInstalments').setValidators([Validators.required]);
      this.loanMaster.get('noOfInstalments').updateValueAndValidity();
    }
  }
  init() {
    if (this.UtilServ.editData) {
      this.update = true; this.view = false;
      this.loanMaster.controls.loanCode.setValue(this.UtilServ.editData.loanCode);
      this.loanMaster.controls.loanDescription.setValue(this.UtilServ.editData.loanDescription);
      this.loanMaster.controls.interestRate.setValue(this.UtilServ.editData.interestRate);
      this.loanMaster.controls.loanType.setValue(this.UtilServ.editData.loanType);
      this.loanMaster.controls.emiType.setValue(this.UtilServ.editData.emiType);
      this.loanMaster.controls.noOfInstalments.setValue(this.UtilServ.editData.noOfInstalments);
      this.loanMaster.controls.maxLoanAmount.setValue(this.UtilServ.editData.maxLoanAmount);
      this.loanMaster.controls.isFixed.setValue(this.UtilServ.editData.isFixed);
      this.loanMaster.enable();
      this.loanMaster.controls.loanCode.disable();

    } else if (this.UtilServ.viewData) {
      this.update = false; this.view = true;
      this.loanMaster.controls.loanCode.setValue(this.UtilServ.viewData.loanCode);
      this.loanMaster.controls.loanDescription.setValue(this.UtilServ.viewData.loanDescription);
      this.loanMaster.controls.interestRate.setValue(this.UtilServ.viewData.interestRate);
      this.loanMaster.controls.loanType.setValue(this.UtilServ.viewData.loanType);
      this.loanMaster.controls.emiType.setValue(this.UtilServ.viewData.emiType);
      this.loanMaster.controls.noOfInstalments.setValue(this.UtilServ.viewData.noOfInstalments);
      this.loanMaster.controls.maxLoanAmount.setValue(this.UtilServ.viewData.maxLoanAmount);
      this.loanMaster.controls.isFixed.setValue(this.UtilServ.viewData.isFixed);
      this.loanMaster.disable();
    }
  }
  create() {
    this.spinner.show();
    const obj = {
      "loanCode": this.loanMaster.controls.loanCode.value,
      "loanDescription": this.loanMaster.controls.loanDescription.value,
      loanType: this.loanMaster.controls.loanType.value,
      "interestRate": this.loanMaster.controls.interestRate.value == null ? 0 : this.loanMaster.controls.interestRate.value,
      "emiType": this.loanMaster.controls.loanType.value == 'Advance' ? 'Flat' : 'Flat',
      "noOfInstalments": this.loanMaster.controls.loanType.value == 'Advance' ? 1 : this.loanMaster.controls.noOfInstalments.value,
      "maxLoanAmount": this.loanMaster.controls.maxLoanAmount.value,
      "isFixed": this.loanMaster.controls.isFixed.value,
    }
    this.httpPost.create('loan', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.loanMaster.controls.loanCode.value + ' Created',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.loanMaster.reset();
          this.loanMaster.enable();
          this.loanMaster.controls.isFixed.setValue(true);
          this.router.navigateByUrl('payrollsetup/loanMaster');
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
      "loanCode": this.loanMaster.controls.loanCode.value,
      "loanDescription": this.loanMaster.controls.loanDescription.value,
      loanType: this.loanMaster.controls.loanType.value,
      "interestRate": this.loanMaster.controls.interestRate.value == null ? 0 : this.loanMaster.controls.interestRate.value,
      "emiType": this.loanMaster.controls.loanType.value == 'Advance' ? 'Flat' : 'Flat',
      "noOfInstalments": this.loanMaster.controls.loanType.value == 'Advance' ? 1 : this.loanMaster.controls.noOfInstalments.value,
      "maxLoanAmount": this.loanMaster.controls.maxLoanAmount.value,
      "isFixed": this.loanMaster.controls.isFixed.value,
      "id": this.UtilServ.editData.id,
      "buCode": this.UtilServ.editData.buCode,
      "tenantCode": this.UtilServ.editData.tenantCode,
      "createdby": this.UtilServ.editData.createdby,
      "createddate": this.UtilServ.editData.createddate,
      "lastmodifiedby": this.UtilServ.editData.lastmodifiedby,
      "lastmodifieddate": this.UtilServ.editData.lastmodifieddate,
    }
    this.httpPut.doPut('loan', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.loanMaster.controls.loanCode.value + ' Updated',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.loanMaster.reset();
          this.loanMaster.enable();
          this.loanMaster.controls.isFixed.setValue(true);
          this.update = false;
          this.router.navigateByUrl('payrollsetup/loanMaster');
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
  ngOnDestroy() {
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
    this.view = false;
    this.update = false
  }
}