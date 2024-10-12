
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';
import { UtilService } from '../../../../services/util.service';

@Component({
  selector: 'app-create-tracking-policy-setup',
  templateUrl: './create-tracking-policy-setup.component.html',
  styleUrls: ['./create-tracking-policy-setup.component.scss']
})
export class CreateTrackingPolicySetupComponent implements OnInit, OnDestroy {
  displayLateArrival = true;
  displayNoAtt = false;
  update = false;
  view = false;
  trackingPolicyForm: FormGroup;
  lateArrivalPolicyForm: FormGroup;
  noAttendancePolicyForm: FormGroup;
  workingHrsPolicyForm: FormGroup;
  lateArrivalPolicyRules = [];
  workingHrsPolicyRules = [];


  policyTab = true;
  noattendanceTab = false;
  LateTab = false;
  workHrsTab = false;
  constructor(private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private httpPost: HttpPostService,
    private fb: FormBuilder,
    private httPut: HttpPutService,
    private UtilService: UtilService,
    public globalServ: GlobalvariablesService,
    private router: Router) {
  }
  back() {
    this.router.navigateByUrl('/timesetup/trackingPolicy');
  }
  ngOnInit(): void {
    this.trackingPolicyForm = this.fb.group({
      policyCode: [null, [Validators.required, Validators.maxLength(56)]]
    })
    this.noAttendancePolicyForm = this.fb.group({
      goDeduct: [false],
      deductDaysOfSalary: [null],
      adjustAgainstLeaves: [false],
    })
    this.lateArrivalPolicyForm = this.fb.group({
      penalizeForLateArrival: [false],
      graceTimeInMin: [null],
      deductForLateTime: [true],
      allowedNoOfTimesLate: [null],
      timeframe: [null],
      adjustAgainstLeaves: [false],
      ignorePenalizationIfHrsCovered: [false]
    })

    this.workingHrsPolicyForm = this.fb.group({
      penalizeForLessHours: [false],
      timeframe: [null],
      deductOnlyForShortage: [true]
    })
    this.penalize_for_less_hours(this.workingHrsPolicyForm.controls.penalizeForLessHours.value);

    this.init();
  }
  init() {
    if (this.UtilService.editData) {
      this.update = true;
      this.view = false;
      this.trackingPolicyForm.controls.policyCode.setValue(this.UtilService.editData.trackingPolicy.policyCode);

      this.noAttendancePolicyForm.controls.goDeduct.setValue(this.UtilService.editData.noShowPolicy.goDeduct);
      this.noAttendancePolicyForm.controls.deductDaysOfSalary.setValue(this.UtilService.editData.noShowPolicy.deductDaysOfSalary);
      this.noAttendancePolicyForm.controls.adjustAgainstLeaves.setValue(this.UtilService.editData.noShowPolicy.adjustAgainstLeaves);
      this.lateArrivalPolicyForm.controls.penalizeForLateArrival.setValue(this.UtilService.editData.lateArrivalPolicy.penalizeForLateArrival);
      this.lateArrivalPolicyForm.controls.graceTimeInMin.setValue(this.UtilService.editData.lateArrivalPolicy.graceTimeInMin);
      this.lateArrivalPolicyForm.controls.deductForLateTime.setValue(this.UtilService.editData.lateArrivalPolicy.deductForLateTime);
      this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.setValue(this.UtilService.editData.lateArrivalPolicy.allowedNoOfTimesLate);
      this.lateArrivalPolicyForm.controls.timeframe.setValue(this.UtilService.editData.lateArrivalPolicy.timeframe);
      this.lateArrivalPolicyForm.controls.adjustAgainstLeaves.setValue(this.UtilService.editData.lateArrivalPolicy.adjustAgainstLeaves);
      this.lateArrivalPolicyForm.controls.ignorePenalizationIfHrsCovered.setValue(this.UtilService.editData.lateArrivalPolicy.ignorePenalizationIfHrsCovered);
      this.lateArrivalPolicyRules = this.UtilService.editData.lateArrivalPolicy.lateArrivalPolicyRules;
      // this.adddeductForLateTime();


      this.workingHrsPolicyForm.controls.penalizeForLessHours.setValue(this.UtilService.editData.workingHoursPolicy.penalizeForLessHours);
      this.workingHrsPolicyForm.controls.timeframe.setValue(this.UtilService.editData.workingHoursPolicy.timeframe);
      this.workingHrsPolicyForm.controls.deductOnlyForShortage.setValue(this.UtilService.editData.workingHoursPolicy.deductOnlyForShortage);
      // this.workingHrsPolicyForm.controls.deductionRules.setValue(true);

      this.workingHrsPolicyRules = this.UtilService.editData.workingHoursPolicy.workingHoursPolicyRules;
      // this.addworkingHrsPolicyRules();
      this.trackingPolicyForm.enable();
      this.workingHrsPolicyForm.enable();
      this.lateArrivalPolicyForm.enable();
      this.noAttendancePolicyForm.enable();
      if (this.UtilService.editData.workingHoursPolicy.penalizeForLessHours === true) {
        this.workingHrsPolicyForm.controls.timeframe.enable();
      } else {
        this.workingHrsPolicyForm.controls.timeframe.disable();
      }
      this.trackingPolicyForm.controls.policyCode.disable();
    } else if (this.UtilService.viewData) {
      this.update = false;
      this.view = true;
      this.trackingPolicyForm.controls.policyCode.setValue(this.UtilService.viewData.trackingPolicy.policyCode);

      this.noAttendancePolicyForm.controls.goDeduct.setValue(this.UtilService.viewData.noShowPolicy.goDeduct);
      this.noAttendancePolicyForm.controls.deductDaysOfSalary.setValue(this.UtilService.viewData.noShowPolicy.deductDaysOfSalary);
      this.noAttendancePolicyForm.controls.adjustAgainstLeaves.setValue(this.UtilService.viewData.noShowPolicy.adjustAgainstLeaves);

      this.lateArrivalPolicyForm.controls.penalizeForLateArrival.setValue(this.UtilService.viewData.lateArrivalPolicy.penalizeForLateArrival);
      this.lateArrivalPolicyForm.controls.graceTimeInMin.setValue(this.UtilService.viewData.lateArrivalPolicy.graceTimeInMin);
      this.lateArrivalPolicyForm.controls.deductForLateTime.setValue(this.UtilService.viewData.lateArrivalPolicy.deductForLateTime);
      this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.setValue(this.UtilService.viewData.lateArrivalPolicy.allowedNoOfTimesLate);
      this.lateArrivalPolicyForm.controls.timeframe.setValue(this.UtilService.viewData.lateArrivalPolicy.timeframe);
      this.lateArrivalPolicyForm.controls.adjustAgainstLeaves.setValue(this.UtilService.viewData.lateArrivalPolicy.adjustAgainstLeaves);
      this.lateArrivalPolicyForm.controls.ignorePenalizationIfHrsCovered.setValue(this.UtilService.viewData.lateArrivalPolicy.ignorePenalizationIfHrsCovered);
      if (this.UtilService.viewData.workingHoursPolicy.workingHoursPolicyRules?.length > 0) {
      // this.workingHrsPolicyForm.controls.deductionRules.setValue(true);
      }
      this.lateArrivalPolicyRules = this.UtilService.viewData.lateArrivalPolicy.lateArrivalPolicyRules

      this.workingHrsPolicyForm.controls.penalizeForLessHours.setValue(this.UtilService.viewData.workingHoursPolicy.penalizeForLessHours);
      this.workingHrsPolicyForm.controls.deductOnlyForShortage.setValue(this.UtilService.viewData.workingHoursPolicy.deductOnlyForShortage);
      this.workingHrsPolicyForm.controls.timeframe.setValue(this.UtilService.viewData.workingHoursPolicy.timeframe);
      if (this.UtilService.viewData.workingHoursPolicy.workingHoursPolicyRules?.length > 0) {
      // this.workingHrsPolicyForm.controls.deductionRules.setValue(true);
      }
      this.workingHrsPolicyRules = this.UtilService.viewData.workingHoursPolicy.workingHoursPolicyRules
      this.trackingPolicyForm.disable();
      this.workingHrsPolicyForm.disable();
      this.lateArrivalPolicyForm.disable();
      this.noAttendancePolicyForm.disable();
    }
  }

  basicvalues() {
    this.lateArrivalPolicyForm.controls.penalizeForLateArrival.setValue(false);
    this.noAttendancePolicyForm.controls.goDeduct.setValue(false);
    this.noAttendancePolicyForm.controls.adjustAgainstLeaves.setValue(false);
    this.workingHrsPolicyForm.controls.penalizeForLessHours.setValue(false);
    this.workingHrsPolicyForm.controls.deductOnlyForShortage.setValue(true);
    // this.workingHrsPolicyForm.controls.deductionRules.setValue(false);
    this.penalize_for_less_hours(this.workingHrsPolicyForm.controls.penalizeForLessHours.value);
  }
  checkPenalize(val) {
    if (this.update) {
      if (val == false) {
        for (let i = 0; i < this.lateArrivalPolicyRules.length; i++) {
          this.deleteDeductRule(i)
        }
        this.lateArrivalPolicyForm.reset();
        this.lateArrivalPolicyForm.controls.penalizeForLateArrival.setValue(false)
      } else {
        this.lateArrivalPolicyRules = [];
        for (let i = 0; i < this.UtilService.editData.lateArrivalPolicy.lateArrivalPolicyRules.length; i++) {
          this.UtilService.editData.lateArrivalPolicy.lateArrivalPolicyRules[i].status = null
          this.lateArrivalPolicyRules.push(this.UtilService.editData.lateArrivalPolicy.lateArrivalPolicyRules[i])
        }
      }
    } else {
      if (val === false) {
        this.lateArrivalPolicyForm.reset();
        this.lateArrivalPolicyForm.controls.penalizeForLateArrival.setValue(false);
        this.lateArrivalPolicyForm.controls.graceTimeInMin.clearValidators();
        this.lateArrivalPolicyForm.controls.graceTimeInMin.updateValueAndValidity(); 

        this.lateArrivalPolicyRules = [];
      } else {
        this.lateArrivalPolicyForm.controls.graceTimeInMin.setValidators([Validators.required]);
        this.lateArrivalPolicyForm.controls.graceTimeInMin.updateValueAndValidity(); 
      }
    }
  }
  goDeduct(val) {
    if (this.update) {
      if (val == false) {
        this.noAttendancePolicyForm.controls.goDeduct.setValue(false)
        this.noAttendancePolicyForm.reset();
      } else {
        this.noAttendancePolicyForm.controls.goDeduct.setValue(true)
        this.noAttendancePolicyForm.controls.deductDaysOfSalary.setValue(this.UtilService.editData.noShowPolicy.deductDaysOfSalary);
        this.noAttendancePolicyForm.controls.adjustAgainstLeaves.setValue(this.UtilService.editData.noShowPolicy.adjustAgainstLeaves);
      }
    } else {
      if (val === false) {
        this.noAttendancePolicyForm.reset();
        this.noAttendancePolicyForm.controls.goDeduct.setValue(false)
      }
    }
  }
  deductionRules(val) {
    if (this.update) {
      if (val == true) {
        for (let i = 0; i < this.workingHrsPolicyRules.length; i++) {
          this.deleteworkingHrsPolicy(i)
        }
      } else {
        this.workingHrsPolicyRules = [];
        for (let i = 0; i < this.UtilService.editData.workingHoursPolicy.workingHoursPolicyRules.length; i++) {
          this.UtilService.editData.workingHoursPolicy.workingHoursPolicyRules[i].status = null
          this.workingHrsPolicyRules.push(this.UtilService.editData.workingHoursPolicy.workingHoursPolicyRules[i])
        }
      }
    }
    else {
      if (val == true) {
        this.workingHrsPolicyRules = [];
      } else {
        this.addworkingHrsPolicyRules();
      }
    }
  }
  penalize_for_less_hours(val) {
    if (this.update) {
      if (val == false) {
        for (let i = 0; i < this.workingHrsPolicyRules.length; i++) {
          this.deleteworkingHrsPolicy(i)
        }
      } else {
        this.workingHrsPolicyForm.controls.timeframe.enable();
        this.workingHrsPolicyForm.controls.timeframe.setValue(this.UtilService.editData.workingHoursPolicy.timeframe);
        this.workingHrsPolicyForm.controls.timeframe.setValue(this.UtilService.editData.workingHoursPolicy.timeframe);
        if (this.UtilService.editData.workingHoursPolicy.workingHoursPolicyRules.length > 0) {
          // this.workingHrsPolicyForm.controls.deductionRules.setValue(true);
        }
        this.workingHrsPolicyRules = [];
        for (let i = 0; i < this.UtilService.editData.workingHoursPolicy.workingHoursPolicyRules.length; i++) {
          this.UtilService.editData.workingHoursPolicy.workingHoursPolicyRules[i].status = null
          this.workingHrsPolicyRules.push(this.UtilService.editData.workingHoursPolicy.workingHoursPolicyRules[i])
        }
      }
    } else {
      if (val === false) {
        for (let i = 0; i < this.workingHrsPolicyRules.length; i++) {
          this.deleteworkingHrsPolicy(i)
        }
        this.workingHrsPolicyForm.controls.timeframe.clearValidators();
        this.workingHrsPolicyForm.controls.timeframe.updateValueAndValidity();
        this.workingHrsPolicyForm.reset();
        this.workingHrsPolicyForm.controls.penalizeForLessHours.setValue(false);
        this.workingHrsPolicyForm.controls.deductOnlyForShortage.setValue(false);
        this.workingHrsPolicyRules = [];
        this.workingHrsPolicyForm.controls.timeframe.disable();
        this.workingHrsPolicyForm.controls.timeframe.reset();
      }
      else {
        this.workingHrsPolicyForm.controls.timeframe.setValidators([Validators.required]);
        this.workingHrsPolicyForm.controls.timeframe.updateValueAndValidity();
        this.workingHrsPolicyForm.controls.timeframe.enable();
        this.addworkingHrsPolicyRules();
      }
    }
  }
  deductForLateTime(list) {
    if (this.update) {
      if (list == true) {
        for (let i = 0; i < this.lateArrivalPolicyRules.length; i++) {
          this.deleteDeductRule(i)
        }
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.clearValidators();
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.updateValueAndValidity();
        this.lateArrivalPolicyForm.controls.timeframe.clearValidators();
        this.lateArrivalPolicyForm.controls.timeframe.updateValueAndValidity();
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.disable();
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.setValue(null);
        this.lateArrivalPolicyForm.controls.timeframe.disable();
        this.lateArrivalPolicyForm.controls.timeframe.setValue(null);
      } else {
        this.lateArrivalPolicyRules = [];
        for (let i = 0; i < this.UtilService.editData.lateArrivalPolicy.lateArrivalPolicyRules.length; i++) {
          this.UtilService.editData.lateArrivalPolicy.lateArrivalPolicyRules[i].status = null
          this.lateArrivalPolicyRules.push(this.UtilService.editData.lateArrivalPolicy.lateArrivalPolicyRules[i])
        }
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.setValidators([Validators.required]);
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.updateValueAndValidity();
        this.lateArrivalPolicyForm.controls.timeframe.setValidators([Validators.required]);
        this.lateArrivalPolicyForm.controls.timeframe.updateValueAndValidity();
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.enable();
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.setValue(this.UtilService.viewData.lateArrivalPolicy.allowedNoOfTimesLate);
        this.lateArrivalPolicyForm.controls.timeframe.enable();
        this.lateArrivalPolicyForm.controls.timeframe.setValue(this.UtilService.viewData.lateArrivalPolicy.timeframe);
      }
    }
    else {
      if (list === false) {
        this.adddeductForLateTime();
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.setValidators([Validators.required]);
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.updateValueAndValidity();
        this.lateArrivalPolicyForm.controls.timeframe.setValidators([Validators.required]);
        this.lateArrivalPolicyForm.controls.timeframe.updateValueAndValidity();
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.enable();
        this.lateArrivalPolicyForm.controls.timeframe.enable();
      } else {
        for (let i = 0; i < this.lateArrivalPolicyRules.length; i++) {
          this.deleteDeductRule(i);
        }
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.clearValidators();
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.updateValueAndValidity();
        this.lateArrivalPolicyForm.controls.timeframe.clearValidators();
        this.lateArrivalPolicyForm.controls.timeframe.updateValueAndValidity();
        // this.lateArrivalPolicyRules = [];
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.disable();
        this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.setValue(null);
        this.lateArrivalPolicyForm.controls.timeframe.disable();
        this.lateArrivalPolicyForm.controls.timeframe.setValue(null);
      }
    }
  }

  adddeductForLateTime() {
    const length = this.lateArrivalPolicyRules.length;
    if (length > 0) {
      const isEmpty =
        this.lateArrivalPolicyRules[length - 1].lateLessThanInHrs.length == 0 &&
        this.lateArrivalPolicyRules[length - 1].daysOfLeaveToDeduct.length == 0;
      if (!isEmpty) {
        this.lateArrivalPolicyRules.push({
          ruleId: null,
          lateLessThanInHrs: '',
          daysOfLeaveToDeduct: ''
        });
      }
      else {
        Swal.fire('info', 'Please enter last rule completely!', 'warning');
      }
    } else {
      this.lateArrivalPolicyRules.push({
        ruleId: null,
        lateLessThanInHrs: '',
        daysOfLeaveToDeduct: ''
      });
    }
  }
  addworkingHrsPolicyRules() {
    const length = this.workingHrsPolicyRules.length;
    if (length > 0) {
      const isEmpty =
        this.workingHrsPolicyRules[length - 1].pctShiftHoursThreshold.length == 0 &&
        this.workingHrsPolicyRules[length - 1].daysToDeduct.length == 0;
      if (!isEmpty) {
        this.workingHrsPolicyRules.push({
          ruleId: null,
          pctShiftHoursThreshold: '',
          daysToDeduct: ''
        });
      }
      else {
        Swal.fire('info', 'Please enter last rule completely!', 'warning');
      }
    } else {
      this.workingHrsPolicyRules.push({
        ruleId: null,
        pctShiftHoursThreshold: '',
        daysToDeduct: ''
      });
    }
  }
  deleteworkingHrsPolicy(i) {
    if (this.workingHrsPolicyRules[i].ruleId == null) {
      this.workingHrsPolicyRules.splice(i, 1);
    } else {
      this.workingHrsPolicyRules[i]['status'] = 'DELETED';
    }
  }
  deleteDeductRule(i) {
    if (this.lateArrivalPolicyRules[i].ruleId == null) {
      this.lateArrivalPolicyRules.splice(i, 1);
    } else {
      this.lateArrivalPolicyRules[i]['status'] = 'DELETED';
    }
  }
  // tab1() {
  //   this.displayLateArrival = true;
  //   this.displayNoAtt = false;
  // }
  // tab2() {
  //   this.displayLateArrival = false;
  //   this.displayNoAtt = true;
  // }
  tab1() {
    this.policyTab = true;
    this.noattendanceTab = false;
    this.LateTab = false;
    this.workHrsTab = false;

  }
  tab2() {
    this.policyTab = false;
    this.noattendanceTab = true;
    this.LateTab = false;
    this.workHrsTab = false;
  }
  tab3() {
    this.policyTab = false;
    this.noattendanceTab = false;
    this.LateTab = true;
    this.workHrsTab = false;

  }
  tab4() {
    this.policyTab = false;
    this.noattendanceTab = false;
    this.LateTab = false;
    this.workHrsTab = true;
  }
  previous() {
    this.noattendanceTab ? this.tab1() : (this.LateTab ? this.tab2() : (this.workHrsTab ? this.tab3() : this.tab2()));
  }
  forward() {
    this.policyTab ? this.tab2() : this.noattendanceTab ? this.tab3() : (this.LateTab ? this.tab4() : '');

  }


  submit() {
    this.spinner.show();
    const obj = {
      "trackingPolicy": {
        "policyCode": this.trackingPolicyForm.controls.policyCode.value
      },
      "noShowPolicy": {
        "goDeduct": this.noAttendancePolicyForm.controls.goDeduct.value,
        "deductDaysOfSalary": this.noAttendancePolicyForm.controls.deductDaysOfSalary.value,
        "adjustAgainstLeaves": this.noAttendancePolicyForm.controls.adjustAgainstLeaves.value,
      },
      "lateArrivalPolicy": {
        "penalizeForLateArrival": this.lateArrivalPolicyForm.controls.penalizeForLateArrival.value,
        "graceTimeInMin": this.lateArrivalPolicyForm.controls.graceTimeInMin.value,
        "deductForLateTime": this.lateArrivalPolicyForm.controls.deductForLateTime.value,
        "allowedNoOfTimesLate": this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.value,
        "timeframe": this.lateArrivalPolicyForm.controls.timeframe.value,
        "adjustAgainstLeaves": this.lateArrivalPolicyForm.controls.adjustAgainstLeaves.value,
        "ignorePenalizationIfHrsCovered": this.lateArrivalPolicyForm.controls.ignorePenalizationIfHrsCovered.value,
        "lateArrivalPolicyRules": this.lateArrivalPolicyRules,
      },
      "workingHoursPolicy": {
        "penalizeForLessHours": this.workingHrsPolicyForm.controls.penalizeForLessHours.value,
        "timeframe": this.workingHrsPolicyForm.controls.timeframe.value,
        "deductOnlyForShortage": this.workingHrsPolicyForm.controls.deductOnlyForShortage.value,
        "workingHoursPolicyRules": this.workingHrsPolicyRules
      },
    }
    this.httpPost.create('trackingpolicys', obj).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.trackingPolicyForm.controls.policyCode.value + ' Created',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.trackingPolicyForm.reset();
            this.workingHrsPolicyForm.reset();
            this.lateArrivalPolicyForm.reset();
            this.noAttendancePolicyForm.reset(),
              this.trackingPolicyForm.reset();
            this.basicvalues();
            this.tab1();
            this.back();
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
    const obj = {
      "trackingPolicy": {
        buCode: this.UtilService.editData.trackingPolicy.buCode,
        lateArrivalPolicyId: this.UtilService.editData.trackingPolicy.lateArrivalPolicyId,
        noShowPolicyId: this.UtilService.editData.trackingPolicy.noShowPolicyId,
        policyId: this.UtilService.editData.trackingPolicy.policyId,
        tenantCode: this.UtilService.editData.trackingPolicy.tenantCode,
        workHoursPolicyId: this.UtilService.editData.trackingPolicy.workHoursPolicyId,
        "policyCode": this.trackingPolicyForm.controls.policyCode.value
      },
      "noShowPolicy": {
        "noShowPolicyId": this.UtilService.editData.noShowPolicy.noShowPolicyId,
        "buCode": this.UtilService.editData.noShowPolicy.buCode,
        "tenantCode": this.UtilService.editData.noShowPolicy.tenantCode,
        "goDeduct": this.noAttendancePolicyForm.controls.goDeduct.value,
        "deductDaysOfSalary": this.noAttendancePolicyForm.controls.deductDaysOfSalary.value,
        "adjustAgainstLeaves": this.noAttendancePolicyForm.controls.adjustAgainstLeaves.value,
      },
      "lateArrivalPolicy": {
        "penalizeForLateArrival": this.lateArrivalPolicyForm.controls.penalizeForLateArrival.value,
        "graceTimeInMin": this.lateArrivalPolicyForm.controls.graceTimeInMin.value,
        "deductForLateTime": this.lateArrivalPolicyForm.controls.deductForLateTime.value,
        "allowedNoOfTimesLate": this.lateArrivalPolicyForm.controls.allowedNoOfTimesLate.value,
        "timeframe": this.lateArrivalPolicyForm.controls.timeframe.value,
        "adjustAgainstLeaves": this.lateArrivalPolicyForm.controls.adjustAgainstLeaves.value,
        "ignorePenalizationIfHrsCovered": this.lateArrivalPolicyForm.controls.ignorePenalizationIfHrsCovered.value,
        "lateArrivalPolicyRules": this.lateArrivalPolicyRules,
        "lateArrivalPolicyId": this.UtilService.editData.lateArrivalPolicy.lateArrivalPolicyId,
        "buCode": this.UtilService.editData.lateArrivalPolicy.buCode,
        "tenantCode": this.UtilService.editData.lateArrivalPolicy.tenantCode,
      },
      "workingHoursPolicy": {
        "penalizeForLessHours": this.workingHrsPolicyForm.controls.penalizeForLessHours.value,
        "deductOnlyForShortage": this.workingHrsPolicyForm.controls.deductOnlyForShortage.value,
        "timeframe": this.workingHrsPolicyForm.controls.timeframe.value,
        "workingHoursPolicyRules": this.workingHrsPolicyRules,
        "workHoursPolicyId": this.UtilService.editData.workingHoursPolicy.workHoursPolicyId,
        "buCode": this.UtilService.editData.workingHoursPolicy.buCode,
        "tenantCode": this.UtilService.editData.workingHoursPolicy.tenantCode,
      },
    }
    this.httPut.doPut('trackingpolicys', obj).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.trackingPolicyForm.controls.policyCode.value + ' Updated',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.trackingPolicyForm.reset();
            this.workingHrsPolicyForm.reset();
            this.lateArrivalPolicyForm.reset();
            this.noAttendancePolicyForm.reset(),
              this.trackingPolicyForm.reset();
            this.basicvalues();
            this.tab1();
            this.back();
            // this.cancel();
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
  ngOnDestroy() {
    this.UtilService.editData = null;
    this.UtilService.viewData = null;
  }
}