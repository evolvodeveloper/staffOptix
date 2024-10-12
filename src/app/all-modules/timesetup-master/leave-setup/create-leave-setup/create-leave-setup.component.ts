import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-leave-setup',
  templateUrl: './create-leave-setup.component.html',
  styleUrls: ['./create-leave-setup.component.scss']
})
export class CreateLeaveSetupComponent implements OnInit, OnDestroy {

  view = false;
  update = false;
  dates = [];
  leavesetUpForm: FormGroup;
  leavePlansList = [];
  leaveTypesList = [];
  otherThanLeaveType = [];
  charLimit: number;
  labels: any;
  placeholder: any;
  constructor(
    private fb: FormBuilder,
    private httpGetService: HttpGetService,
    private httpPost: HttpPostService,
    private router: Router,
    public globalServ: GlobalvariablesService,
    private utilServ: UtilService,
    private httpPut: HttpPutService,
    private spinner: NgxSpinnerService
  ) {

  }


  startAcc = ['from DOJ', 'after Probation']
  // leavesetUpForm.controls.canMixWith
  onleaveTypeCodeChange() {
    this.otherThanLeaveType = [];
    if (!this.view && !this.update) {
      this.leavesetUpForm.controls.canMixWith.setValue(null);
    }
    this.otherThanLeaveType = this.leaveTypesList.filter(x => x.leaveTypeCode !== this.leavesetUpForm.controls.leaveTypeCode.value)
  }
  canMixOtherLeave() {
    if (this.leavesetUpForm.controls.canMixOtherLeave.value == true) {
      this.leavesetUpForm.controls.canMixWith.enable();
    } else {
      this.leavesetUpForm.controls.canMixWith.disable();
      this.leavesetUpForm.controls.canMixWith.setValue(null);
    }
  }
  onChangeAccrueLeavesFromDOJ(val) {
    if (val == false) {
      this.leavesetUpForm.controls.startAccrual.setValue(null)
    }
  }
  onChangeallowAccrueBasedOnWorkdays(val) {
    if (val == false) {
      this.leavesetUpForm.controls.minWorkdaysForAccrue.setValue(null)
    }
  }
  getLabelDescription(divId: string): string {
    const label = this.labels?.find(item => item.colCode === divId);
    return label ? label.labelDescription : '';
  }
  getPlaceholdersDescription(divId: string): string {
    const pc = this.placeholder?.find(item => item.placeholderColCode === divId);
    return pc ? pc.placeholderDescription : '';
  }

  checkCanCarryForward(val) {
    if (val == false) {
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.setValue(null);
      this.leavesetUpForm.controls.maxCarryForwardLimit.setValue(null);
      this.leavesetUpForm.controls.lapseAfterYears.setValue(null);
    }
  }
  checkForSandwich(val) {
    if (val == false) {
      this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.setValue(null);
    }
  }
  checkForSandwichHoliday(val) {
    if (val == false) {
      this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.setValue(null);
    }
  }
  onChangeInPlanCode(val) {
    this.leavesetUpForm.controls.leaveTypeCode.setValue(null);
    const records = this.utilServ.leaveSetupBackup.filter(x => x.leavePlanCode == val.value)
    this.leaveTypesList.forEach(c => {
      c.disable = false;
      const findLType = records.find(x => x.leaveTypeCode == c.leaveTypeCode)
      if (findLType) {
        c.disable = true;
      }
    })
  }


  getLevaeSetupLabels() {
    this.spinner.show();
    this.globalServ.getLabels('leavesetup').subscribe((res: any) => {
      this.labels = res.response;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      console.error(err.error.status.message);
    });
  }
  getLeavesetupPlaceHolder() {
    this.spinner.show();
    this.globalServ.getPlaceholders('leavesetup').subscribe((res: any) => {
      this.placeholder = res.response;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();

      console.error(err.error.status.message);
    });
  }
  ngOnInit() {
    // this.getLevaeSetupLabels();
    // this.getLeavesetupPlaceHolder();
    if (this.utilServ.leaveTypesBackup.length > 0) {
      this.leaveTypesList = this.utilServ.leaveTypesBackup
    } else {
      this.getleaveTypes();
    }
    if (this.utilServ.leavePlanbackup.length > 0) {
      this.leavePlansList = this.utilServ.leavePlanbackup;
    } else {
      this.getleavePlans();
    }
    this.leavesetUpFormControls();
    this.charLimit = this.globalServ.charLimitValue;
    for (let index = 1; index < 31; index++) {
      let suffix = 'th';
      if (index === 1) {
        suffix = 'st';
      } else if (index === 2) {
        suffix = 'nd';
      } else if (index === 3) {
        suffix = 'rd';
      }
      this.dates.push({ code: index, name: `${index}${suffix} of Month` });
    }
  }


  getleavePlans() {
    this.spinner.show();
    this.httpGetService.getMasterList('leavePlans').subscribe(
      (res: any) => {
        this.spinner.hide();
        this.leavePlansList = res.response;
      },
      (err) => {
        this.spinner.hide();
        console.error(err.error.status.message);
      });
  }
  getleaveTypes() {
    this.spinner.show();
    this.httpGetService.getMasterList('leavetypes').subscribe(
      (res: any) => {
        this.spinner.hide();
        this.leaveTypesList = res.response;
      },
      (err) => {
        this.spinner.hide();
        console.error(err.error.status.message);
      });
  }


  leavesetUpFormControls() {
    this.leavesetUpForm = this.fb.group({
      leaveTypeCode: [null, Validators.required],
      leavePlanCode: [null, Validators.required],
      leavePolicy: [null],
      isPaidLeave: [true],
      payPct: ['100'],
      eligibleFromDojInMonths: [null],
      // calendarStartMonth: [null, Validators.required],
      // runLeavepolicyOnDt: [null, Validators.required],
      canCarryForward: [false],
      yearlyCarryForwardLimit: [null],
      maxCarryForwardLimit: [null],
      lapseAfterYears: [null],
      allowDeductionInLeaves4Weekend: [false],
      allowDeductionInLeaves4Holiday: [false],
      maxLeaveAllowedForSandwich: [null],
      maxTakeAtatime: [null],
      canMixOtherLeave: [false],
      canMixWith: [null],
      canApplyHalf: [false],
      accrualPolicy: ['', Validators.required],
      applicableFrom: [null],
      accrueLeavesFromDojTill: [null],
      startAccrual: [null],
      allowAccrueBasedOnWorkdays: [false],
      minWorkdaysForAccrue: [null],
      leaves: [null],
      prorateLeavesInMonthOfJoining: [false],
      noLeaveQuotaIfJoinsAfter: [null],
      nextRunDate: null,
      lastRunDate: null,
      companyCode: [null],
      branchCode: [null],
      createdby: [null],
      createddate: [null],
      lastmodifiedby: [null],
      lastmodifieddate: [null],
      leaveSetupId: [null],
    });
    this.leavesetUpForm.controls.canMixWith.disable();
    this.init();
  }
  init() {
    if (this.utilServ.viewData) {
      this.view = true;
      this.update = false;
      this.leavesetUpForm.controls.leaveSetupId.setValue(this.utilServ.viewData.leaveSetupId);
      this.leavesetUpForm.controls.leavePlanCode.setValue(this.utilServ.viewData.leavePlanCode);
      this.leavesetUpForm.controls.leaveTypeCode.setValue(this.utilServ.viewData.leaveTypeCode);
      this.onleaveTypeCodeChange();
      this.leavesetUpForm.controls.leavePolicy.setValue(this.utilServ.viewData.leavePolicy);
      this.leavesetUpForm.controls.isPaidLeave.setValue(this.utilServ.viewData.isPaidLeave);
      this.leavesetUpForm.controls.payPct.setValue(this.utilServ.viewData.payPct);
      this.leavesetUpForm.controls.eligibleFromDojInMonths.setValue(this.utilServ.viewData.eligibleFromDojInMonths);
      this.leavesetUpForm.controls.canCarryForward.setValue(this.utilServ.viewData.canCarryForward);
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.setValue(this.utilServ.viewData.yearlyCarryForwardLimit);
      this.leavesetUpForm.controls.maxCarryForwardLimit.setValue(this.utilServ.viewData.maxCarryForwardLimit);
      this.leavesetUpForm.controls.lapseAfterYears.setValue(this.utilServ.viewData.lapseAfterYears);
      this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.setValue(this.utilServ.viewData.allowDeductionInLeaves4Weekend);
      this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.setValue(this.utilServ.viewData.allowDeductionInLeaves4Holiday);
      this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.setValue(this.utilServ.viewData.maxLeaveAllowedForSandwich);
      this.leavesetUpForm.controls.maxTakeAtatime.setValue(this.utilServ.viewData.maxTakeAtatime);
      this.leavesetUpForm.controls.canMixOtherLeave.setValue(this.utilServ.viewData.canMixOtherLeave);
      this.leavesetUpForm.controls.canMixWith.setValue(this.utilServ.viewData.canMixWith);
      this.leavesetUpForm.controls.canApplyHalf.setValue(this.utilServ.viewData.canApplyHalf);
      this.leavesetUpForm.controls.accrualPolicy.setValue(this.utilServ.viewData.accrualPolicy);
      this.leavesetUpForm.controls.applicableFrom.setValue(this.utilServ.viewData.applicableFrom);
      this.leavesetUpForm.controls.accrueLeavesFromDojTill.setValue(this.utilServ.viewData.accrueLeavesFromDojTill);
      this.leavesetUpForm.controls.startAccrual.setValue(this.utilServ.viewData.startAccrual);
      this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.setValue(this.utilServ.viewData.allowAccrueBasedOnWorkdays);
      this.leavesetUpForm.controls.minWorkdaysForAccrue.setValue(this.utilServ.viewData.minWorkdaysForAccrue);
      this.leavesetUpForm.controls.leaves.setValue(this.utilServ.viewData.leaves);
      this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.setValue(this.utilServ.viewData.prorateLeavesInMonthOfJoining);
      this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.setValue(this.utilServ.viewData.noLeaveQuotaIfJoinsAfter);
      this.leavesetUpForm.controls.nextRunDate.setValue(this.utilServ.viewData.nextRunDate);
      this.leavesetUpForm.controls.branchCode.setValue(this.utilServ.viewData.branchCode);
      this.leavesetUpForm.controls.companyCode.setValue(this.utilServ.viewData.companyCode);
      this.leavesetUpForm.controls.createdby.setValue(this.utilServ.viewData.createdby);
      this.leavesetUpForm.controls.createddate.setValue(this.utilServ.viewData.createddate);
      this.leavesetUpForm.controls.lastmodifiedby.setValue(this.utilServ.viewData.lastmodifiedby);
      this.leavesetUpForm.controls.lastmodifieddate.setValue(this.utilServ.viewData.lastmodifieddate);
      this.leavesetUpForm.disable();
    }
    else if (this.utilServ.editData) {
      this.view = false;
      this.update = true;
      this.leavesetUpForm.enable();
      this.leavesetUpForm.controls.leaveSetupId.setValue(this.utilServ.editData.leaveSetupId);
      this.leavesetUpForm.controls.leavePlanCode.setValue(this.utilServ.editData.leavePlanCode);
      this.leavesetUpForm.controls.leaveTypeCode.setValue(this.utilServ.editData.leaveTypeCode);
      this.onleaveTypeCodeChange();
      this.leavesetUpForm.controls.leavePolicy.setValue(this.utilServ.editData.leavePolicy);
      this.leavesetUpForm.controls.isPaidLeave.setValue(this.utilServ.editData.isPaidLeave);
      this.leavesetUpForm.controls.payPct.setValue(this.utilServ.editData.payPct);
      this.leavesetUpForm.controls.eligibleFromDojInMonths.setValue(this.utilServ.editData.eligibleFromDojInMonths);
      this.leavesetUpForm.controls.canCarryForward.setValue(this.utilServ.editData.canCarryForward);
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.setValue(this.utilServ.editData.yearlyCarryForwardLimit);
      this.leavesetUpForm.controls.maxCarryForwardLimit.setValue(this.utilServ.editData.maxCarryForwardLimit);
      this.leavesetUpForm.controls.lapseAfterYears.setValue(this.utilServ.editData.lapseAfterYears);
      this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.setValue(this.utilServ.editData.allowDeductionInLeaves4Weekend);
      this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.setValue(this.utilServ.editData.allowDeductionInLeaves4Holiday);
      this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.setValue(this.utilServ.editData.maxLeaveAllowedForSandwich);
      this.leavesetUpForm.controls.maxTakeAtatime.setValue(this.utilServ.editData.maxTakeAtatime);
      this.leavesetUpForm.controls.canMixOtherLeave.setValue(this.utilServ.editData.canMixOtherLeave);
      this.leavesetUpForm.controls.canMixWith.setValue(this.utilServ.editData.canMixWith);
      this.leavesetUpForm.controls.canApplyHalf.setValue(this.utilServ.editData.canApplyHalf);
      this.leavesetUpForm.controls.accrualPolicy.setValue(this.utilServ.editData.accrualPolicy);
      this.leavesetUpForm.controls.applicableFrom.setValue(this.utilServ.editData.applicableFrom);
      this.leavesetUpForm.controls.accrueLeavesFromDojTill.setValue(this.utilServ.editData.accrueLeavesFromDojTill);
      this.leavesetUpForm.controls.startAccrual.setValue(this.utilServ.editData.startAccrual);
      this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.setValue(this.utilServ.editData.allowAccrueBasedOnWorkdays);
      this.leavesetUpForm.controls.minWorkdaysForAccrue.setValue(this.utilServ.editData.minWorkdaysForAccrue);
      this.leavesetUpForm.controls.leaves.setValue(this.utilServ.editData.leaves);
      this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.setValue(this.utilServ.editData.prorateLeavesInMonthOfJoining);
      this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.setValue(this.utilServ.editData.noLeaveQuotaIfJoinsAfter);
      this.leavesetUpForm.controls.nextRunDate.setValue(this.utilServ.editData.nextRunDate);
      this.leavesetUpForm.controls.branchCode.setValue(this.utilServ.editData.branchCode);
      this.leavesetUpForm.controls.companyCode.setValue(this.utilServ.editData.companyCode);
      this.leavesetUpForm.controls.createdby.setValue(this.utilServ.editData.createdby);
      this.leavesetUpForm.controls.createddate.setValue(this.utilServ.editData.createddate);
      this.leavesetUpForm.controls.lastmodifiedby.setValue(this.utilServ.editData.lastmodifiedby);
      this.leavesetUpForm.controls.lastmodifieddate.setValue(this.utilServ.editData.lastmodifieddate);
      this.leavesetUpForm.controls.leavePlanCode.disable();
      this.leavesetUpForm.controls.leaveTypeCode.disable();
    }
  }


  create() {
    this.spinner.show();
    const req = this.leavesetUpForm.value;
    req.leaveTypeCode = this.leavesetUpForm.controls.leaveTypeCode.value.trim();
    req.canApplyHalf =
      this.leavesetUpForm.controls.canApplyHalf.value == null
        ? false
        : this.leavesetUpForm.controls.canApplyHalf.value;
    req.canCarryForward =
      this.leavesetUpForm.controls.canCarryForward.value == null
        ? false
        : this.leavesetUpForm.controls.canCarryForward.value;
    req.canMixOtherLeave = this.leavesetUpForm.controls.canMixOtherLeave.value == null ? false : this.leavesetUpForm.controls.canMixOtherLeave.value;
    req.allowDeductionInLeaves4Weekend = this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value == null ? false : this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value;
    req.allowDeductionInLeaves4Holiday = this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.value == null ? false : this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.value;
    req.isPaidLeave = this.leavesetUpForm.controls.isPaidLeave.value == null ? false : this.leavesetUpForm.controls.isPaidLeave.value;
    req.prorateLeavesInMonthOfJoining = this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.value == null ? false : this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.value;
    req.allowAccrueBasedOnWorkdays = this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value == null ? false : this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value;

    const submitObj = {
      leaveTypeCode: this.leavesetUpForm.controls.leaveTypeCode.value,
      leavePlanCode: this.leavesetUpForm.controls.leavePlanCode.value,
      leavePolicy: this.leavesetUpForm.controls.leavePolicy.value,
      isPaidLeave: this.leavesetUpForm.controls.isPaidLeave.value,
      eligibleFromDojInMonths: this.leavesetUpForm.controls.eligibleFromDojInMonths.value,
      // calendarStartMonth: this.leavesetUpForm.controls.calendarStartMonth.value,
      // runLeavepolicyOnDt: this.leavesetUpForm.controls.runLeavepolicyOnDt.value,
      canCarryForward: this.leavesetUpForm.controls.canCarryForward.value,

      allowDeductionInLeaves4Weekend: this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value,
      allowDeductionInLeaves4Holiday: this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.value,
      maxTakeAtatime: this.leavesetUpForm.controls.maxTakeAtatime.value,
      canMixOtherLeave: this.leavesetUpForm.controls.canMixOtherLeave.value,
      canApplyHalf: this.leavesetUpForm.controls.canApplyHalf.value,
      accrualPolicy: this.leavesetUpForm.controls.accrualPolicy.value,
      // applicableFrom: this.leavesetUpForm.controls.applicableFrom.value,
      accrueLeavesFromDojTill: this.leavesetUpForm.controls.accrueLeavesFromDojTill.value,
      payPct: this.leavesetUpForm.controls.isPaidLeave.value == true ? this.leavesetUpForm.controls.payPct.value : null,
      yearlyCarryForwardLimit: this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.yearlyCarryForwardLimit.value : null,
      maxCarryForwardLimit: this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.maxCarryForwardLimit.value : null,
      lapseAfterYears: this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.lapseAfterYears.value : null,
      maxLeaveAllowedForSandwich: this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value == true ? this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.value : null,
      canMixWith: this.leavesetUpForm.controls.canMixOtherLeave.value == true ? this.leavesetUpForm.controls.canMixWith.value : null,
      startAccrual: this.leavesetUpForm.controls.accrueLeavesFromDojTill.value == true ? this.leavesetUpForm.controls.startAccrual.value : null,
      minWorkdaysForAccrue: this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value == true ? this.leavesetUpForm.controls.minWorkdaysForAccrue.value : null,
      allowAccrueBasedOnWorkdays: this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value,
      leaves: this.leavesetUpForm.controls.leaves.value,
      prorateLeavesInMonthOfJoining: this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.value,
      noLeaveQuotaIfJoinsAfter: this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.value,
      // nextRunDate: this.leavesetUpForm.controls.nextRunDate.value,
      // lastRunDate: this.leavesetUpForm.controls.lastRunDate.value,

    };
    this.httpPost.create('leavesetup', submitObj).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.leavesetUpForm.controls.leaveTypeCode.value + ' Created',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.leavesetUpForm.reset();
            this.utilServ.leaveSetupBackup = [];
            this.cancel();
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
    const req = this.leavesetUpForm.value;
    req.leaveTypeCode = this.leavesetUpForm.controls.leaveTypeCode.value;
    req.leavePlanCode = this.leavesetUpForm.controls.leavePlanCode.value,
    req.canApplyHalf =
      this.leavesetUpForm.value.canApplyHalf == null
        ? false
        : this.leavesetUpForm.value.canApplyHalf;
    req.branchCode = this.leavesetUpForm.controls.branchCode.value,
      req.canCarryForward =
      this.leavesetUpForm.value.canCarryForward == null
        ? false
        : this.leavesetUpForm.value.canCarryForward;
    req.canMixOtherLeave =
      this.leavesetUpForm.value.canMixOtherLeave == null
        ? false
        : this.leavesetUpForm.value.canMixOtherLeave;
    req.canMixWith = this.leavesetUpForm.controls.canMixOtherLeave.value == true ? this.leavesetUpForm.controls.canMixWith.value : null;
    req.payPct = this.leavesetUpForm.controls.isPaidLeave.value == true ? this.leavesetUpForm.controls.payPct.value : null,
      req.yearlyCarryForwardLimit = this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.yearlyCarryForwardLimit.value : null,
      req.maxCarryForwardLimit = this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.maxCarryForwardLimit.value : null,
      req.lapseAfterYears = this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.lapseAfterYears.value : null,
      req.maxLeaveAllowedForSandwich = this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value == true ? this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.value : null,
      req.canMixWith = this.leavesetUpForm.controls.canMixOtherLeave.value == true ? this.leavesetUpForm.controls.canMixWith.value : null,
      req.startAccrual = this.leavesetUpForm.controls.accrueLeavesFromDojTill.value == true ? this.leavesetUpForm.controls.startAccrual.value : null,
      req.minWorkdaysForAccrue = this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value == true ? this.leavesetUpForm.controls.minWorkdaysForAccrue.value : null;
    const submitObj = {
      leaveTypeCode: this.leavesetUpForm.controls.leaveTypeCode.value,
      leaveSetup: this.leavesetUpForm.value,
    };
    this.httpPut.doPut('leavetypewithsetup', submitObj).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.leavesetUpForm.controls.leaveTypeCode.value + ' Updated',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.leavesetUpForm.reset();
            this.utilServ.leaveSetupBackup = [];
            // this.obj.createNew = false;
            this.update = false;
            this.cancel();
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
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
  cancel() {
    this.router.navigateByUrl('timesetup/leavesetup')
  }
  ngOnDestroy() {
    this.utilServ.viewData = null;
    this.utilServ.editData = null;
    this.leaveTypesList.forEach(c => {
      c.disable = false;
    });
  }
}
