import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
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
  LastRunDate: string;
  accuralInMonthOfJoin: string;
  accrualPolicyOptions = [
    { value: 1, label: 'Credit leaves at the start of the year.' },
    { value: 12, label: 'Credit accrued leaves every month.' },
    { value: 4, label: 'Credit accrued leave quarterly.' },
    { value: 2, label: 'Credit accrued leave half-yearly.' },
  ];
  startAcc = ['from DOJ', 'after Probation']

  constructor(
    private fb: FormBuilder,
    private httpGetService: HttpGetService,
    private httpPost: HttpPostService,
    private router: Router,
    public globalServ: GlobalvariablesService,
    private utilServ: UtilService,
    private httpPut: HttpPutService,
    private spinner: NgxSpinnerService
  ) { }
  ngOnInit() {
    if (this.utilServ.leaveTypesBackup.length > 0) {
      this.leaveTypesList = this.utilServ.leaveTypesBackup;
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

  leavesetUpFormControls() {
    this.leavesetUpForm = this.fb.group({
      leaveTypeCode: [null, Validators.required],
      leavePlanCode: [null, Validators.required],
      leavePolicy: [null],
      isPaidLeave: [true],
      payPct: ['100'],
      fullLeaveQuotaIfJoinsBefore: [null],
      // calendarStartMonth: [null, Validators.required],
      // runLeavepolicyOnDt: [null, Validators.required],
      canCarryForward: [false],
      yearlyCarryForwardLimit: [null],
      maxCarryForwardLimit: [null],
      lapseAfterYears: [null],
      allowDeductionInLeaves4Weekend: [false],
      allowDeductionInLeaves4Holiday: [false],
      maxLeaveAllowedForSandwich: [null],
      maxTakeAtatime: ['', Validators.required],
      canMixOtherLeave: [false],
      canMixWith: [null],
      canApplyHalf: [false],
      accrualPolicy: ['', Validators.required],
      applicableFrom: [null, Validators.required],
      accrueLeavesFromDojTill: [null],
      startAccrual: [null],
      allowAccrueBasedOnWorkdays: [false],
      minWorkdaysForAccrue: [null],
      leaves: ['', Validators.required],
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
    this.isPaidLeaveFun();
    this.init();
  }
  init() {
    if (this.utilServ.viewData) {
      this.view = true;
      this.update = false;
      if (this.utilServ.viewData.prorateLeavesInMonthOfJoining == true) {
        this.accuralInMonthOfJoin = 'prorate'
      } else {
        this.accuralInMonthOfJoin = 'eligibility'
      }
      this.leavesetUpForm.controls.leaveSetupId.setValue(this.utilServ.viewData.leaveSetupId);
      this.leavesetUpForm.controls.leavePlanCode.setValue(this.utilServ.viewData.leavePlanCode);
      this.leavesetUpForm.controls.leaveTypeCode.setValue(this.utilServ.viewData.leaveTypeCode);
      this.leavesetUpForm.controls.leavePolicy.setValue(this.utilServ.viewData.leavePolicy);
      this.leavesetUpForm.controls.isPaidLeave.setValue(this.utilServ.viewData.isPaidLeave);
      this.leavesetUpForm.controls.payPct.setValue(this.utilServ.viewData.payPct);
      this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.setValue(this.utilServ.viewData.fullLeaveQuotaIfJoinsBefore);
      this.leavesetUpForm.controls.canCarryForward.setValue(this.utilServ.viewData.canCarryForward);
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.setValue(this.utilServ.viewData.yearlyCarryForwardLimit);
      this.leavesetUpForm.controls.maxCarryForwardLimit.setValue(this.utilServ.viewData.maxCarryForwardLimit);
      this.leavesetUpForm.controls.lapseAfterYears.setValue(this.utilServ.viewData.lapseAfterYears);
      this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.setValue(this.utilServ.viewData.allowDeductionInLeaves4Weekend);
      this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.setValue(this.utilServ.viewData.allowDeductionInLeaves4Holiday);
      this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.setValue(this.utilServ.viewData.maxLeaveAllowedForSandwich);
      this.leavesetUpForm.controls.maxTakeAtatime.setValue(this.utilServ.viewData.maxTakeAtatime);
      this.leavesetUpForm.controls.canMixOtherLeave.setValue(this.utilServ.viewData.canMixOtherLeave);
      const list = this.utilServ.editData.canMixWith?.split(',').map(item => item.trim())
      this.leavesetUpForm.controls.canMixWith.setValue(list);
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
      this.onleaveTypeCodeChange();
    }
    else if (this.utilServ.editData) {
      this.view = false;
      this.update = true;     
      this.leavesetUpForm.enable();
      if (this.utilServ.editData.prorateLeavesInMonthOfJoining == true) {
        this.accuralInMonthOfJoin = 'prorate'
      } else {
        this.accuralInMonthOfJoin = 'eligibility'
      }
      this.leavesetUpForm.controls.leaveSetupId.setValue(this.utilServ.editData.leaveSetupId);
      this.leavesetUpForm.controls.leavePlanCode.setValue(this.utilServ.editData.leavePlanCode);
      this.leavesetUpForm.controls.leaveTypeCode.setValue(this.utilServ.editData.leaveTypeCode);
      this.leavesetUpForm.controls.leavePolicy.setValue(this.utilServ.editData.leavePolicy);
      this.leavesetUpForm.controls.isPaidLeave.setValue(this.utilServ.editData.isPaidLeave);
      this.leavesetUpForm.controls.payPct.setValue(this.utilServ.editData.payPct);
      this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.setValue(this.utilServ.editData.fullLeaveQuotaIfJoinsBefore);
      this.leavesetUpForm.controls.canCarryForward.setValue(this.utilServ.editData.canCarryForward);
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.setValue(this.utilServ.editData.yearlyCarryForwardLimit);
      this.leavesetUpForm.controls.maxCarryForwardLimit.setValue(this.utilServ.editData.maxCarryForwardLimit);
      this.leavesetUpForm.controls.lapseAfterYears.setValue(this.utilServ.editData.lapseAfterYears);
      this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.setValue(this.utilServ.editData.allowDeductionInLeaves4Weekend);
      this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.setValue(this.utilServ.editData.allowDeductionInLeaves4Holiday);
      this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.setValue(this.utilServ.editData.maxLeaveAllowedForSandwich);
      this.leavesetUpForm.controls.maxTakeAtatime.setValue(this.utilServ.editData.maxTakeAtatime);
      this.leavesetUpForm.controls.canMixOtherLeave.setValue(this.utilServ.editData.canMixOtherLeave);
      const list = this.utilServ.editData.canMixWith?.split(',').map(item => item.trim())
      this.leavesetUpForm.controls.canMixWith.setValue(list);
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
      this.onleaveTypeCodeChange();
    }
  }

  onChangeInEnterNumberOfLeaves(val) {
    if (this.leavesetUpForm.controls.maxTakeAtatime.value == null ||
      this.leavesetUpForm.controls.maxTakeAtatime.value == '' ||
      this.leavesetUpForm.controls.maxTakeAtatime.value > val) {
      this.leavesetUpForm.controls.maxTakeAtatime.setValue(val);
    }
  }

  onleaveTypeCodeChange() {
    this.otherThanLeaveType = [];
    if (!this.view && !this.update) {
      this.leavesetUpForm.controls.canMixWith.setValue(null);
    }
    const otherThanLeaveType = this.leaveTypesList.filter(x => x.leaveTypeCode !== this.leavesetUpForm.controls.leaveTypeCode.value)
    this.otherThanLeaveType = otherThanLeaveType.map(x => x.leaveTypeCode)
  }
  canMixOtherLeave() {
    if (this.leavesetUpForm.controls.canMixOtherLeave.value == true) {
      this.leavesetUpForm.controls.canMixWith.enable();
      this.leavesetUpForm.controls.canMixWith.setValidators([Validators.required]);
      this.leavesetUpForm.controls.canMixWith.updateValueAndValidity();
    } else {
      this.leavesetUpForm.controls.canMixWith.disable();
      this.leavesetUpForm.controls.canMixWith.setValue(null);
      this.leavesetUpForm.controls.canMixWith.clearValidators();
      this.leavesetUpForm.controls.canMixWith.updateValueAndValidity();
    }
  }
  onChangeAccrueLeavesFromDOJ(val) {
    if (val == false) {
      this.leavesetUpForm.controls.startAccrual.setValue(null);
      this.leavesetUpForm.controls.startAccrual.clearValidators();
      this.leavesetUpForm.controls.startAccrual.updateValueAndValidity();
    } else {
      this.leavesetUpForm.controls.startAccrual.setValue('from DOJ');
      this.leavesetUpForm.controls.startAccrual.setValidators([Validators.required]);
      this.leavesetUpForm.controls.startAccrual.updateValueAndValidity();
    }
  }
  onChangeallowAccrueBasedOnWorkdays(val) {
    if (val == false) {
      this.leavesetUpForm.controls.minWorkdaysForAccrue.setValue(null);
      this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.clearValidators();
      this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.updateValueAndValidity();

      this.leavesetUpForm.controls.minWorkdaysForAccrue.clearValidators();
      this.leavesetUpForm.controls.minWorkdaysForAccrue.updateValueAndValidity();
    } else {
      this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.setValidators([Validators.required]);
      this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.updateValueAndValidity(); 

      this.leavesetUpForm.controls.minWorkdaysForAccrue.setValidators([Validators.required]);
      this.leavesetUpForm.controls.minWorkdaysForAccrue.updateValueAndValidity();
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
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.clearValidators();
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.updateValueAndValidity();
      this.leavesetUpForm.controls.maxCarryForwardLimit.clearValidators();
      this.leavesetUpForm.controls.maxCarryForwardLimit.updateValueAndValidity();
      this.leavesetUpForm.controls.lapseAfterYears.clearValidators();
      this.leavesetUpForm.controls.lapseAfterYears.updateValueAndValidity();
    } else {
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.setValue(this.leavesetUpForm.controls.leaves.value);
      this.leavesetUpForm.controls.maxCarryForwardLimit.setValue(this.leavesetUpForm.controls.leaves.value);
      this.leavesetUpForm.controls.lapseAfterYears.setValue(2);
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.setValidators([Validators.required]);
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.updateValueAndValidity();
      this.leavesetUpForm.controls.maxCarryForwardLimit.setValidators([Validators.required]);
      this.leavesetUpForm.controls.maxCarryForwardLimit.updateValueAndValidity();
      this.leavesetUpForm.controls.lapseAfterYears.setValidators([Validators.required]);
      this.leavesetUpForm.controls.lapseAfterYears.updateValueAndValidity();
    }
  }
  checkForSandwich() {
    if (this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.value == false && this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value == false) {
      this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.setValue(null);
    } else {
      this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.setValue(2)
    }
  }
  isPaidLeaveFun() {
    if (this.leavesetUpForm.controls.isPaidLeave.value) {
      this.leavesetUpForm.controls.payPct.setValidators([Validators.required]);
      this.leavesetUpForm.controls.payPct.updateValueAndValidity();
    } else {
      this.leavesetUpForm.controls.payPct.clearValidators();
      this.leavesetUpForm.controls.payPct.updateValueAndValidity();
    }
  }

  accrualPolicyFunction() {
    if (this.leavesetUpForm.controls.accrualPolicy.value == 12) {
      // this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.setValue(null);
      // this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.setValue(false);

      // this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.clearValidators();
      // this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.updateValueAndValidity();

      // this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.clearValidators();
      // this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.updateValueAndValidity();

      // // this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.setValidators([Validators.required]);
      // // this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.updateValueAndValidity(); 

      // // this.leavesetUpForm.controls.minWorkdaysForAccrue.setValidators([Validators.required]);
      // // this.leavesetUpForm.controls.minWorkdaysForAccrue.updateValueAndValidity();


    } else {
      // this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.setValidators([Validators.required]);
      // this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.updateValueAndValidity();

      // this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.setValidators([Validators.required]);
      // this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.updateValueAndValidity();

      // // this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.clearValidators();
      // // this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.updateValueAndValidity();

      // // this.leavesetUpForm.controls.minWorkdaysForAccrue.clearValidators();
      // // this.leavesetUpForm.controls.minWorkdaysForAccrue.updateValueAndValidity();
      this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.setValue(false);
      this.leavesetUpForm.controls.minWorkdaysForAccrue.setValue(null)
    }
  }
  prorateLeavesInMonthOfJoining() {
    if (this.accuralInMonthOfJoin == 'eligibility') {
      this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.setValidators([Validators.required]);
      this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.updateValueAndValidity();
      this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.setValue(1);

      this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.setValue(false);
      this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.setValue(null);
      this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.clearValidators();
      this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.updateValueAndValidity();
    } else {
      this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.setValue(null);
      this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.clearValidators();
      this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.updateValueAndValidity();

      this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.setValue(true);
      this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.setValue(20);
      this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.setValidators([Validators.required]);
      this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.updateValueAndValidity();

    }

    // if (this.leavesetUpForm.controls.prorateLeavesInMonthOfJoining.value) {
    //   this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.setValidators([Validators.required]);
    //   this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.updateValueAndValidity();
    // } else {
    //   this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.setValue(null);
    //   this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.clearValidators();
    //   this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.updateValueAndValidity();
    // }
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
   const selectedData = this.leavePlansList.find(x => x.leavePlanCode == val.value)
    const currentDate = moment().format('YYYY-MM'); // Use 'YYYY-MM' format for proper comparison
    const LastRunDate = moment(selectedData.lastRunDate).format('YYYY-MM'); // Same for LastRunDate
    if (moment(currentDate).isAfter(moment(LastRunDate))) {
      this.LastRunDate = currentDate;
    } else {
      this.LastRunDate = moment(LastRunDate).add(1, 'months').format('YYYY-MM');;
    }
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

  minWorkDaysFunction() {
    if (this.leavesetUpForm.controls.minWorkdaysForAccrue.value > 30) {
      this.leavesetUpForm.controls.minWorkdaysForAccrue.setValue(0)
      Swal.fire({
        icon: 'warning',
        text: 'Please enter a maximum of 30 for minimum workdays for accrual',
        showConfirmButton: true
      })
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


  onMaxCarryForwardLimitChange() {
    if (this.leavesetUpForm.controls.maxCarryForwardLimit.value < this.leavesetUpForm.controls.yearlyCarryForwardLimit.value) {
      this.leavesetUpForm.controls.yearlyCarryForwardLimit.setValue(0);
      Swal.fire({
        icon: 'warning',
        text: 'The yearly carryforward limit cannot exceed the maximum carryforward limit',
        showConfirmButton: true
      })
    }
  }
  maxLeaveAtOneInstance() {
    if (this.leavesetUpForm.controls.maxTakeAtatime.value > this.leavesetUpForm.controls.leaves.value) {
      this.leavesetUpForm.controls.maxTakeAtatime.setValue(0);
      Swal.fire({
        icon: 'warning',
        text: 'The maximum limit an employee can take at one instance cannot be more than annual quota',
        showConfirmButton: true
      })
    }
  }

  create() {
    let canMixWith = this.leavesetUpForm.controls.canMixWith.value

    const submitObj = {
      leaveTypeCode: this.leavesetUpForm.controls.leaveTypeCode.value.trim(),
      leavePlanCode: this.leavesetUpForm.controls.leavePlanCode.value,
      leavePolicy: this.leavesetUpForm.controls.leavePolicy.value,
      isPaidLeave: this.leavesetUpForm.controls.isPaidLeave.value == null ? false : this.leavesetUpForm.controls.isPaidLeave.value,
      fullLeaveQuotaIfJoinsBefore: this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.value,
      // calendarStartMonth: this.leavesetUpForm.controls.calendarStartMonth.value,
      // runLeavepolicyOnDt: this.leavesetUpForm.controls.runLeavepolicyOnDt.value,
      canCarryForward: this.leavesetUpForm.controls.canCarryForward.value == null
        ? false
        : this.leavesetUpForm.controls.canCarryForward.value,

      allowDeductionInLeaves4Weekend: this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value == null ? false : this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value,
      allowDeductionInLeaves4Holiday: this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.value == null ? false : this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.value,
      maxTakeAtatime: this.leavesetUpForm.controls.maxTakeAtatime.value,
      canMixOtherLeave: this.leavesetUpForm.controls.canMixOtherLeave.value == null ? false : this.leavesetUpForm.controls.canMixOtherLeave.value,
      canApplyHalf: this.leavesetUpForm.controls.canApplyHalf.value == null
        ? false
        : this.leavesetUpForm.controls.canApplyHalf.value,
      accrualPolicy: this.leavesetUpForm.controls.accrualPolicy.value,
      applicableFrom: moment(this.leavesetUpForm.controls.applicableFrom.value).format('YYYY-MM-DD') ,
      accrueLeavesFromDojTill: this.leavesetUpForm.controls.accrueLeavesFromDojTill.value == null ? false : true,
      payPct: this.leavesetUpForm.controls.isPaidLeave.value == true ? this.leavesetUpForm.controls.payPct.value : null,
      yearlyCarryForwardLimit: this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.yearlyCarryForwardLimit.value : null,
      maxCarryForwardLimit: this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.maxCarryForwardLimit.value : null,
      lapseAfterYears: this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.lapseAfterYears.value : null,
      maxLeaveAllowedForSandwich: this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value == true ? this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.value : null,
      canMixWith: this.leavesetUpForm.controls.canMixOtherLeave.value == true ? canMixWith?.join(', ') : null,
      startAccrual: this.leavesetUpForm.controls.accrueLeavesFromDojTill.value == true ? this.leavesetUpForm.controls.startAccrual.value : null,
      allowAccrueBasedOnWorkdays: this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value == null ? false : this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value,
      minWorkdaysForAccrue: this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value == true ? this.leavesetUpForm.controls.minWorkdaysForAccrue.value : null,
      leaves: this.leavesetUpForm.controls.leaves.value,
      prorateLeavesInMonthOfJoining: this.accuralInMonthOfJoin == 'prorate' ? true : false,
      noLeaveQuotaIfJoinsAfter: this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.value,
      // nextRunDate: this.leavesetUpForm.controls.nextRunDate.value,
      // lastRunDate: this.leavesetUpForm.controls.lastRunDate.value,
    };      
    this.spinner.show();
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
    let canMixWith = this.leavesetUpForm.controls.canMixWith.value
    const obj = {
      "leaveSetupId": this.utilServ.editData.leaveSetupId,
      "leavePlanCode": this.leavesetUpForm.controls.leavePlanCode.value,
      "leaveTypeCode": this.leavesetUpForm.controls.leaveTypeCode.value,
      "leavePolicy": this.leavesetUpForm.controls.leavePolicy.value,
      "isPaidLeave": this.leavesetUpForm.controls.isPaidLeave.value == null ? false : this.leavesetUpForm.controls.isPaidLeave.value,
      "payPct": this.leavesetUpForm.controls.isPaidLeave.value == true ? this.leavesetUpForm.controls.payPct.value : null,
      // "eligibleFromDojInMonths": this.utilServ.editData.leaveSetupId,
      "canCarryForward": this.leavesetUpForm.controls.canCarryForward.value == null
        ? false
        : this.leavesetUpForm.controls.canCarryForward.value,
      "yearlyCarryForwardLimit": this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.yearlyCarryForwardLimit.value : null,
      "maxCarryForwardLimit": this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.maxCarryForwardLimit.value : null,
      "lapseAfterYears": this.leavesetUpForm.controls.canCarryForward.value == true ? this.leavesetUpForm.controls.lapseAfterYears.value : null,
      "allowDeductionInLeaves4Weekend": this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value == null ? false : this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value,
      "allowDeductionInLeaves4Holiday": this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.value == null ? false : this.leavesetUpForm.controls.allowDeductionInLeaves4Holiday.value,
      "maxLeaveAllowedForSandwich": this.leavesetUpForm.controls.allowDeductionInLeaves4Weekend.value == true ? this.leavesetUpForm.controls.maxLeaveAllowedForSandwich.value : null,
      "maxTakeAtatime": this.leavesetUpForm.controls.maxTakeAtatime.value,
      "canMixOtherLeave": this.leavesetUpForm.controls.canMixOtherLeave.value == null
        ? false
        : this.leavesetUpForm.controls.canMixOtherLeave.value,
      "canMixWith": this.leavesetUpForm.controls.canMixOtherLeave.value == true ? canMixWith?.join(', ') : null,
      "canApplyHalf": this.leavesetUpForm.controls.canApplyHalf.value == null
        ? false
        : this.leavesetUpForm.controls.canApplyHalf.value,
      "accrualPolicy": this.leavesetUpForm.controls.accrualPolicy.value,
      applicableFrom: this.utilServ.editData.applicableFrom,
      "accrueLeavesFromDojTill": this.leavesetUpForm.controls.accrueLeavesFromDojTill.value == null ? false : true,
      "startAccrual": this.leavesetUpForm.controls.accrueLeavesFromDojTill.value == true ? this.leavesetUpForm.controls.startAccrual.value : null,
      "allowAccrueBasedOnWorkdays": this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value,
      "minWorkdaysForAccrue": this.leavesetUpForm.controls.allowAccrueBasedOnWorkdays.value == true ? this.leavesetUpForm.controls.minWorkdaysForAccrue.value : null,
      "leaves": this.leavesetUpForm.controls.leaves.value,
      prorateLeavesInMonthOfJoining: this.accuralInMonthOfJoin == 'prorate' ? true : false,
      "noLeaveQuotaIfJoinsAfter": this.leavesetUpForm.controls.noLeaveQuotaIfJoinsAfter.value,
      "fullLeaveQuotaIfJoinsBefore": this.accuralInMonthOfJoin !== 'prorate' ? this.leavesetUpForm.controls.fullLeaveQuotaIfJoinsBefore.value : null,
      "nextRunDate": this.utilServ.editData.nextRunDate,
      "lastRunDate": this.utilServ.editData.lastRunDate,
      "isNew": this.utilServ.editData.isNew,
      "branchCode": this.utilServ.editData.branchCode,
      "companyCode": this.utilServ.editData.companyCode,
      "createdby": this.utilServ.editData.createdby,
      "createddate": this.utilServ.editData.createddate,
      "lastmodifiedby": this.utilServ.editData.lastmodifiedby,
      "lastmodifieddate": this.utilServ.editData.lastmodifieddate,
    }
    const submitObj = {
      leaveTypeCode: this.leavesetUpForm.controls.leaveTypeCode.value,
      leaveSetup: obj,
    };
    this.httpPut.doPut('leavetypewithsetup', submitObj).subscribe(
      (res: any) => {
        1
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
