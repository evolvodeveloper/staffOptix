import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-work-from-home-setup',
  templateUrl: './work-from-home-setup.component.html',
  styleUrls: ['./work-from-home-setup.component.scss']
})
export class WorkFromHomeSetupComponent implements OnInit {
  displayWFH = true;
  displayOnDuty = false;
  displayCompOff = false;
  wfhForm: FormGroup;
  onDutyForm: FormGroup;
  selectedAllowWfhOn = 'Both';
  constructor(private httpGet: HttpGetService, private router: Router,
    private utilServ: UtilService,
    private httpPost: HttpPostService,
    private render: Renderer2,
    private el: ElementRef,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,
    private httpPut: HttpPutService,
    private fb: FormBuilder) {
  }
  pastDutyReq = [
    { code: 'currentMonth', name: 'current month' },
    { code: '1', name: '1' },
    { code: '2', name: '2' },
    { code: '3', name: '3' }
  ]
  pastDutyReqEnd = [
    { code: 'last Week of month', name: 'last Week of month' },
    { code: 'MonthEnd', name: 'Month End' },
  ];

  notExceeds = [
    { code: 'Week', name: 'Week' },
    { code: 'Month', name: 'Month' },
    { code: 'Year', name: 'Year' }
  ]
  notRaiseIn = [
    { code: 'Weekends', name: 'Weekends' },
    { code: 'Holidays', name: 'Holidays' },
    { code: 'both', name: 'Both' }
  ];

  ngOnInit() {
    this.globalServ.getMyCompLabels('wfhSetup');
    this.globalServ.getMyCompPlaceHolders('wfhSetup');
    this.globalServ.getMyCompLabels('onDutySetup');
    this.globalServ.getMyCompPlaceHolders('onDutySetup');

    this.wfhForm = this.fb.group({
      payrollCode: [null, [Validators.required]],
      allowHalfDay: false,
      isPunchMandatory: true,
      daysAllowedForWfh: 3,
      timeframeForDaysAllowed: 'Month',
      noOfTimesAllowed: 3,
      timeframeForTimesAllowed: 'Month',
      pastdaysRestriction: 5,
      allowWfhOnWe: false,
      allowWfhOn: null,

      calendarDaysNotice: null,
      workingDaysNotice: null,
      requireApprovalForGtDays: null,
      requireApprovalTimeframe: null,
      isactive: false

    })
    this.onDutyForm = this.fb.group({

      payrollCode: [null, [Validators.required]],
      deptCode: [null, [Validators.required]],
      allowHalfDay: false,
      allowHourlyBasis: false,
      isPunchMandatory: false,
      daysAllowedForOd: null,
      timeframeForDaysAllowed: 'Month',
      noOfTimesAllowed: null,
      timeframeForTimesAllowed: 'Month',
      pastdaysRestriction: null,
      allowOdOnWe: false,
      allowOdOn: null,

      calendarDaysNotice: null,
      workingDaysNotice: null,
      requireApprovalForGtDays: null,

      requireApprovalTimeframe: null,
      isactive: false,
    });
    this.wfhForm.controls.allowWfhOn.setValue('both');
  }

  tab1() {
    this.displayCompOff = false;
    this.displayOnDuty = false;
    this.displayWFH = true;
  }
  tab2() {
    this.displayCompOff = false;
    this.displayOnDuty = true;
    this.displayWFH = false;
  }
  tab3() {
    this.displayCompOff = true;
    this.displayOnDuty = false;
    this.displayWFH = false;
  }


  back() {
    this.router.navigateByUrl('/timesetup');
  }


}
