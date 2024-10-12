import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-create-payroll-type',
  templateUrl: './create-payroll-setup.component.html',
  styleUrls: ['./create-payroll-setup.component.scss'],
})
export class CreatePayrollTypeComponent implements OnInit, OnDestroy {
  @ViewChild('todoList1') todoList1: any; // Define todoList property

  payrollForm: FormGroup;
  // payrollComponentForm: FormGroup;
  // payruleSetupForm: FormGroup;

  overTimeSetupList = [];
  // componentCodeErrorIndex = {
  //   error: false,
  //   componentCode: ''
  // }

  // step = 0;
  // setStep(index: number) {
  //   this.step = index;
  // }
  // stepRules = 0;
  // setStepRules(index: number) {
  //   this.stepRules = index;
  // }
  // ruleCodeErrorIndex = {
  //   error: false,
  //   ruleCode: ''
  // }
  view = false;
  update = false;
  approve = false;
  modifyisDefaultRecord: any;
  designationList = [];
  // config = {
  //   search: true,
  //   displayKey: 'code',
  // };
  leavePlansList = [];
  // updateTimes: any;
  // active = false;
  charLimit: number;

  componentType = ['Recurring', 'Recurring-Conditonal', 'Adhoc'];
  timeframe = [
    { code: 'default', name: 'as per salary cycle' },
    { code: 'daily', name: 'daily' },
  ];
  salaryLabels = [];
  filteredSalaryComponentList = [];

  // payrollsetups = [];
  // pyruleLabels = [];
  // parentMaster = [

  //   { code: 'Total Salary', name: 'Total Salary' },
  //   { code: 'Basic Salary', name: 'Basic Salary' },
  // ];
  comparatorsList = [
    { code: 'GT', name: 'Greaterthan' },
    { code: 'LT', name: 'Lowerthan' },
    { code: 'BETWEEN', name: 'Between' },
  ];
  calcTypes = [
    { code: 'pct', name: 'Percentage' },
    { code: 'fixed', name: 'Fixed' },
    { code: 'remainder', name: 'Remainder' },
  ];
  constructor(
    private fb: FormBuilder,
    private httpPutService: HttpPutService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private globalServ: GlobalvariablesService,
    private httpGetService: HttpGetService
  ) {
    // this.payrollComponentForm = this.fb.group({
    //   payrollComponentFormArray: this.fb.array([]),
    // });
    // this.payruleSetupForm = this.fb.group({
    //   payruleSetupFormArray: this.fb.array([]),
    // });
  }
  salaryMasterList = [];
  // filteredSalaryRole = [];
  paydayCal: any = [
    { header: 'Month', code: 'Calendar Days', name: 'Calendar Days' },
    { header: 'Month', code: 'Working Days', name: 'Working Days' },
    { header: 'Month', code: '30', name: '30 Days in Month' },
    { header: 'Daily', code: '1', name: 'Daily' },
    // { header: 'Week', code: 'Monday', name: 'MONDAY' },
    // { header: 'Week', code: 'Tuesday', name: 'TUESDAY' },
    // { header: 'Week', code: 'Wednesday', name: 'WEDNESDAY' },
    // { header: 'Week', code: 'Thursday', name: 'THURSDAY' },
    // { header: 'Week', code: 'Friday', name: 'FRIDAY' },
    // { header: 'Week', code: 'Saturday', name: 'SATURDAY' },
    // { header: 'Week', code: 'Sunday', name: 'SUNDAY' },
    { header: 'Week', code: '1', name: '1st Day in a week' },
    { header: 'Week', code: '2', name: '2nd Day in a week' },
    { header: 'Week', code: '3', name: '3rd Day in a week' },
    { header: 'Week', code: '4', name: '4th Day in a week' },
    { header: 'Week', code: '5', name: '5th Day in a week' },
    { header: 'Week', code: '6', name: '6th Day in a week' },
    { header: 'Week', code: '7', name: '7th Day in a week' },
  ];
  filteredpayDayCal = [];

  salaryType = [
    { code: 'Total Salary', name: 'Total Salary' },
    { code: 'CTC', name: 'CTC' },
  ];
  ctcForPeriod = [
    { header: 'Total Salary', code: 'Daily', name: 'Daily' },
    { header: 'Total Salary', code: 'Weekly', name: 'Weekly' },
    //   { header: 'Total Salary', code: 'fortnight', name: 'Fortnight' },
    //   { header: 'Total Salary', code: 'Half-month', name: 'Half-Month' },
    { header: 'Total Salary', code: 'Month', name: 'Monthly' },
    { header: 'CTC', code: 'Year', name: 'Yearly' },
  ];
  salaryFrequency = [
    { code: 'Daily', name: 'Daily' },
    { code: 'Week', name: 'Week' },
    { code: 'Month', name: 'Month' },

  ];
  // errorstep: number;
  salryCalDates = [
    { header: 'Daily', code: 'Daily', name: 'Daily' },
    { header: 'Week', code: 'Monday', name: 'MONDAY' },
    { header: 'Week', code: 'Tuesday', name: 'TUESDAY' },
    { header: 'Week', code: 'Wednesday', name: 'WEDNESDAY' },
    { header: 'Week', code: 'Thursday', name: 'THURSDAY' },
    { header: 'Week', code: 'Friday', name: 'FRIDAY' },
    { header: 'Week', code: 'Saturday', name: 'SATURDAY' },
    { header: 'Week', code: 'Sunday', name: 'SUNDAY' },
    { header: 'Fortnight', code: 'Monday', name: 'MONDAY' },
    { header: 'Fortnight', code: 'Tuesday', name: 'TUESDAY' },
    { header: 'Fortnight', code: 'Wednesday', name: 'WEDNESDAY' },
    { header: 'Fortnight', code: 'Thursday', name: 'THURSDAY' },
    { header: 'Fortnight', code: 'Friday', name: 'FRIDAY' },
    { header: 'Fortnight', code: 'Saturday', name: 'SATURDAY' },
    { header: 'Fortnight', code: 'Sunday', name: 'SUNDAY' },
    { header: 'Month', code: 'MonthEnd', name: 'Month End' },
    { header: 'Month', code: 'MonthStart', name: 'Month Start' },
  ];
  filteredsalryCalDates = [];
  salryGeneratedDates = [
    { header: 'Daily', code: 'Daily', name: 'Daily' },
    { header: 'Week', code: 'Monday', name: 'MONDAY' },
    { header: 'Week', code: 'Tuesday', name: 'TUESDAY' },
    { header: 'Week', code: 'Wednesday', name: 'WEDNESDAY' },
    { header: 'Week', code: 'Thursday', name: 'THURSDAY' },
    { header: 'Week', code: 'Friday', name: 'FRIDAY' },
    { header: 'Week', code: 'Saturday', name: 'SATURDAY' },
    { header: 'Week', code: 'Sunday', name: 'SUNDAY' },
    { header: 'Month', code: 'MonthEnd', name: 'Month End' },
    { header: 'Month', code: 'firstday', name: '1st day of the Month' },
    { header: 'Month', code: 'firstWeek', name: '1st week of the Month' },
    { header: 'Month', code: '1-OfMonth', name: 'Half of the Month' },
  ];
  filteredsalryGeneratedDates = [];
  weeks = [
    { code: 'MONDAY', name: 'MONDAY' },
    { code: 'TUESDAY', name: 'TUESDAY' },
    { code: 'WEDNESDAY', name: 'WEDNESDAY' },
    { code: 'THURSDAY', name: 'THURSDAY' },
    { code: 'FRIDAY', name: 'FRIDAY' },
    { code: 'SATURDAY', name: 'SATURDAY' },
    { code: 'SUNDAY', name: 'SUNDAY' },
  ];
  Weekend: any;
  t: any;
  done = [];
  drop1(event: CdkDragDrop<string[]>) {
    if (event.previousContainer.id == 'cdk-drop-list-0') {  
      let notFound = false;
      let requiredParentCmp = [], requiredPRules = [];
      let strReq = [];
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex); 
        event.container.data.forEach(x => {
          if (x['payRules']) {
            x['payRules'].forEach(element => {
              if (element.parentComponentCode !== null && element.componentCode == x['payrollComponent'].componentCode && element.payrollCode == null) {
                if (!this.done.some(doneItem => doneItem.payrollComponent.componentCode === element.parentComponentCode)) {
                  requiredParentCmp.push(x)
                  requiredPRules.push(element)
                  strReq.push(element.parentComponentCode)
                }
              }
            });
          }
        })
        requiredPRules.forEach(parentCode => {
          if (!this.done.some(doneItem => doneItem.payrollComponent.componentCode === parentCode.parentComponentCode)) {
            notFound = true;
            return;
          }
        });
        if (!notFound) {
          requiredParentCmp = [], requiredPRules = [], strReq = [];
        } else {
          const unIqueStrReq = Array.from(new Set(strReq));
          Swal.fire({
            icon: 'info',
            html: 'This component is dependant on ' + '<b>' + unIqueStrReq.join(', ') + '. </b> Please add that first',
            showConfirmButton: true,
            // timer: 1500,
          });
          this.salaryMasterList.push(requiredParentCmp[0])
          event.container.data.splice(event.currentIndex, 1);         
        }
        requiredParentCmp = [], requiredPRules = [], strReq = [];
      }
    }
    else {
      let notFound = false;
      let requiredParentCmp = [], requiredPRules = [];
      let strReq = [], reqStr = [];
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);      
        event.previousContainer.data.forEach(x => {
          if (x['payRules']) {
            x['payRules'].forEach(element => {
              if (element.parentComponentCode !== null && element.componentCode == x['payrollComponent'].componentCode && element.payrollCode == null) {
                if (!this.done.some(doneItem => doneItem.payrollComponent.componentCode === element.parentComponentCode)) {

                  requiredParentCmp.push(x)
                  requiredPRules.push(element)
                
                  strReq.push(element.componentCode)
                  reqStr.push(element.parentComponentCode)
                }
              }
            });
          }
        })
        requiredPRules.forEach(comp => {
          if (!this.done.some(doneItem => doneItem.payrollComponent.componentCode === comp.parentComponentCode)) {
            notFound = true; 
            return; // Exit loop early if any value is not found
          }
        });
        if (!notFound) {
          requiredParentCmp = [], requiredPRules = [], strReq = [], reqStr = [];
          // this.salaryMasterList.push(requiredParentCmp)
        } else {
          const unIqueStrReq = Array.from(new Set(strReq));
          Swal.fire({
            icon: 'info',
            html: 'You cant remove this component because ' + '<b>' + unIqueStrReq.join(', ') + '</b> has dependency',
            showConfirmButton: true,
            // timer: 1500,
          });
          reqStr.forEach(re => {
            const id = this.salaryMasterList.findIndex(x => x.payrollComponent.componentCode == re)
            if (id >= 0) {
              const found = event.previousContainer.data.findIndex((x) => x['payrollComponent'].componentCode == re)
              if (found == -1) {
                event.previousContainer.data.push(this.salaryMasterList[id])
                event.container.data.splice(id, 1);
              }
            }
          })
          // requiredParentCmp = [], requiredPRules = [], strReq = [], reqStr= [];
        } 
      }
    }
  }
 
  onOvertime() {
    if (this.payrollForm.controls.allowOvertime.value == true) {
      if (this.overTimeSetupList.length > 0) {
        // this.payrollForm.controls.overtimeCode.setValue(null);
        this.payrollForm.controls.overtimeCode.enable();
      } else {
        this.payrollForm.controls.overtimeCode.disable();
        this.payrollForm.controls.allowOvertime.setValue(false);
        Swal.fire({
          icon: 'info',
          html: 'OvertimeCode in not defined.' + '<br>' + 'Please go to Setup -- > TimeSetup-- > OT Setup for setting up Overtime.',
          showConfirmButton: true,
          // timer: 1500,
        });
      }
    }
    else {
      this.payrollForm.controls.overtimeCode.setValue(null);
      this.payrollForm.controls.overtimeCode.disable();
      this.payrollForm.controls.allowOvertime.setValue(false);

    }
  }

  getSalaryMaster() {
    const filteredROws = [];
    this.httpGetService.getMasterList('payrollcomponentsetups/payrules').subscribe((res: any) => {
      res.response.forEach(element => {
        if (element.payrollComponent.payrollCode == null && element.payrollComponent.isInternal === false && (element.payrollComponent.componentCode !== 'CTC' && element.payrollComponent.componentCode !== 'Total Salary' && element.payrollComponent.componentCode !== 'Gross Earnings')) {
          element.payrollComponent.checkedComponent = false;
          element.payrollComponent.sortOrder = element.payrollComponent.sortOrder
          const filteredPayRules = element.payRules.filter(rule => rule.payrollCode === null && (rule.parentComponentCode !== 'CTC' && rule.parentComponentCode !== 'Total Salary' && rule.parentComponentCode !== 'Gross Earnings'));
          // Assign filtered payrules back to the element         
          element.payRules = filteredPayRules;
          filteredROws.push(element);
        }
      });  
      this.salaryMasterList = filteredROws
      if (this.utilServ.viewData ) {
        const obj = this.utilServ.viewData.payrollSetupComponents;
        obj.forEach(element => {
          if (element.componentCode !== 'CTC' && element.componentCode !== 'Total Salary') {
            const find = this.salaryMasterList.findIndex(x => x.payrollComponent.componentCode === element.componentCode)
            if (find > -1) {
              this.salaryMasterList[find].payrollComponent.sortOrder = element.sortOrder
              this.done.push(this.salaryMasterList[find]);
              this.salaryMasterList.splice(find, 1)
            }
          }
        });
      } else if (this.utilServ.editData) {
        const obj = this.utilServ.editData.payrollSetupComponents
        obj.forEach(element => {
          if (element.componentCode !== 'CTC' && element.componentCode !== 'Total Salary') {
            const find = this.salaryMasterList.findIndex(x => x.payrollComponent.componentCode === element.componentCode)
            if (find > -1) {
              this.salaryMasterList[find].payrollComponent.sortOrder = element.sortOrder

              this.done.push(this.salaryMasterList[find]);
              this.salaryMasterList.splice(find, 1)
            }
          }
        });
        this.done = this.done.sort((a, b) => {
          return a.payrollComponent.sortOrder - b.payrollComponent.sortOrder
        });
      }
    },
      (err) => {
        console.error(err.error.status.message);
      })
  }

  runPayrollAutocheck() {
    if (this.payrollForm.controls.runPayrollAuto.value == true) {
      this.payrollForm.controls.salaryGeneratedDate.enable();
      this.payrollForm.controls.onHoliday.enable();
    }
    else {
      this.payrollForm.controls.salaryGeneratedDate.disable();
      this.payrollForm.controls.onHoliday.disable();
      this.payrollForm.controls.onHoliday.setValue(null);
      this.payrollForm.controls.salaryGeneratedDate.setValue(null);
    }
  }
  onsalaryFrequencyChange() {
    if (!this.utilServ.viewData && !this.utilServ.editData) {
      this.payrollForm.controls.payDayCalc.setValue(null);
      this.payrollForm.controls.salaryCalculationDate.setValue(null);
    }
    this.filteredsalryCalDates = [];
    this.filteredsalryGeneratedDates = [];
    this.filteredpayDayCal = [];
    this.filteredsalryCalDates = this.salryCalDates.filter(x => x.header == this.payrollForm.controls.salaryFrequency.value);
    this.filteredsalryGeneratedDates = this.salryGeneratedDates.filter(x => x.header == this.payrollForm.controls.salaryFrequency.value);
    this.filteredpayDayCal = this.paydayCal.filter(x => x.header == this.payrollForm.controls.salaryFrequency.value);
    if (this.payrollForm.controls.salaryFrequency.value == 'Daily') {
      this.payrollForm.controls.salaryCalculationDate.setValue('Daily');
      this.payrollForm.controls.payDayCalc.setValue('1')
    }
    if (this.payrollForm.controls.salaryFrequency.value == 'Week') {
      this.payrollForm.controls.salaryCalculationDate.setValue('Saturday');
    }
    if (this.payrollForm.controls.salaryFrequency.value == 'Half-Month') {
      for (let index = 16; index >= 1; index--) {
        const dayOrDays = index === 1 ? 'Day' : 'Days';
        this.filteredsalryCalDates.push({ code: index, name: `${index}  ${dayOrDays}  in Month` });
        this.filteredsalryGeneratedDates.push({ code: index, name: `${index}  ${dayOrDays}  in Month` });
      }
    }
    if (this.payrollForm.controls.salaryFrequency.value == 'Month') {
      for (let index = 31; index >= 1; index--) {
        const dayOrDays = index === 1 ? 'Day' : 'Days';
        // this.filteredsalryCalDates.push({ code: index, name: `${index}  ${dayOrDays}  in Month` });
        this.filteredsalryGeneratedDates.push({ code: index, name: `${index}  ${dayOrDays}  in Month` });
        this.filteredpayDayCal.push({ code: index, name: `${index}  ${dayOrDays}  in Month` });
     }
      this.payrollForm.controls.salaryCalculationDate.setValue('MonthEnd');
      this.payrollForm.controls.payDayCalc.setValue('30');
      for (let index = 1; index < 31; index++) {
        let suffix = 'th';
        if (index === 1) {
          suffix = 'st';
        } else if (index === 2) {
          suffix = 'nd';
        } else if (index === 3) {
          suffix = 'rd';
        }
        this.filteredsalryCalDates.push({ code: index, name: `${index}${suffix} of Month` });
      }
    }
    if (this.payrollForm.controls.salaryFrequency.value == 'FortNight') {
      for (let index = 15; index >= 1; index--) {
        const dayOrDays = index === 1 ? 'Day' : 'Days';
        this.filteredsalryCalDates.push({ code: index, name: `${index}  ${dayOrDays}  in Month` });
        this.filteredsalryGeneratedDates.push({ code: index, name: `${index}  ${dayOrDays}  in Month` });
      }
      for (let index = 1; index < 31; index++) {
        let suffix = 'th';
        if (index === 1) {
          suffix = 'st';
        } else if (index === 2) {
          suffix = 'nd';
        } else if (index === 3) {
          suffix = 'rd';
        }
        this.filteredsalryCalDates.push({ code: index, name: `${index}${suffix} of Month` });
      }
    }

    this.runPayrollAutocheck();

  }
 
  back() {
    this.router.navigateByUrl('payrollsetup/payroll-setup');
  }
  
  ngOnInit(): void {
    // this.getSalarylabels();
    // this.getPayrulesLabels();
    this.payrollForm = this.fb.group({
      payrollCode: [null, [Validators.required, this.httpPostService.customValidator()]],
      salaryFrequency: ['Month', Validators.required],
      salaryCalculationDate: ['MonthEnd', Validators.required],
      payDayCalc: ['30'],
      excludeWeekoffs: [false],
      excludeHolidays: [false],
      leavePlanCode: [null, Validators.required],
      allowOvertime: [false],
      overtimeCode: [null],
      isDefault: [false],

      // doYouWantToAddPayrules: [true],
      runPayrollAuto: [false],
      salaryGeneratedDate: [null],
      onHoliday: [null],
      uom: [null],
      weekendDeduction: [null],
      salaryType: [null],
      ctcForPeriod: [null],
      hasProbation: [false],
      probationCode: [null],
      isApproved: false,
    });
    this.getSalaryMaster();
    if (!this.utilServ.viewData && !this.utilServ.editData) {
      // this.addSalaryItem();
      // this.addPayruleSetupItem();
      this.payrollForm.controls.salaryFrequency.setValue('Month');
      this.onOvertime();
      this.payrollForm.controls.overtimeCode.disable();

      this.onsalaryFrequencyChange();
    }

    this.charLimit = this.globalServ.charLimitValue;
    if (!this.utilServ.viewData && !this.utilServ.editData) {
      this.payrollForm.controls.probationCode.disable();
      this.payrollForm.controls.overtimeCode.enable();
      this.payrollForm.controls.salaryGeneratedDate.disable();
      this.payrollForm.controls.onHoliday.disable();
    }
    if (this.utilServ.leavePlanbackup.length > 0) {
      this.leavePlansList = this.utilServ.leavePlanbackup;
      if (this.utilServ.leavePlanbackup.length == 1 && !this.view && !this.update) {
        this.payrollForm.controls.leavePlanCode.setValue(this.utilServ.leavePlanbackup[0].leavePlanCode)
      }
    } else {
      this.getleavePlans();
    }
    this.getoverTimesetups();
    this.init();
  }

  init() {
    
    if (this.utilServ.viewData) {
      this.payrollForm.disable();
      this.view = true;

      this.payrollForm.controls.payrollCode.setValue(
        this.utilServ.viewData.payrollSetup.payrollCode
      );
      this.payrollForm.controls.payDayCalc.setValue(
        this.utilServ.viewData.payrollSetup.payDayCalc
      );
      this.payrollForm.controls.salaryType.setValue(
        this.utilServ.viewData.payrollSetup.salaryType
      );
      this.payrollForm.controls.ctcForPeriod.setValue(
        this.utilServ.viewData.payrollSetup.salaryForPeriod
      );
      this.payrollForm.controls.salaryFrequency.setValue(
        this.utilServ.viewData.payrollSetup.salaryFrequency
      );
      this.payrollForm.controls.salaryCalculationDate.setValue(
        this.utilServ.viewData.payrollSetup.salaryCalculationDate
      );
      this.payrollForm.controls.salaryGeneratedDate.setValue(
        this.utilServ.viewData.payrollSetup.salaryGeneratedDate
      );
      this.payrollForm.controls.leavePlanCode.setValue(
        this.utilServ.viewData.payrollSetup.leavePlanCode
      );
      this.payrollForm.controls.runPayrollAuto.setValue(
        this.utilServ.viewData.payrollSetup.runPayrollAuto
      );
      this.payrollForm.controls.hasProbation.setValue(
        this.utilServ.viewData.payrollSetup.hasProbation
      );
      this.payrollForm.controls.probationCode.setValue(
        this.utilServ.viewData.payrollSetup.probationCode
      );
      this.payrollForm.controls.overtimeCode.setValue(
        this.utilServ.viewData.payrollSetup.overtimeCode
      );
      this.payrollForm.controls.allowOvertime.setValue(
        this.utilServ.viewData.payrollSetup.allowOvertime
      );
      this.payrollForm.controls.uom.setValue(
        this.utilServ.viewData.payrollSetup.uom
      );
      this.payrollForm.controls.onHoliday.setValue(
        this.utilServ.viewData.payrollSetup.onHoliday
      );
      this.payrollForm.controls.isApproved.setValue(
        this.utilServ.viewData.payrollSetup.isApproved
      );
      this.payrollForm.controls.isDefault.setValue(
        this.utilServ.viewData.payrollSetup.isDefault
      );
      this.payrollForm.controls.excludeWeekoffs.setValue(
        this.utilServ.viewData.payrollSetup.excludeWeekoffs
      );
      this.payrollForm.controls.excludeHolidays.setValue(
        this.utilServ.viewData.payrollSetup.excludeHolidays
      );

      this.payrollForm.controls.weekendDeduction.setValue(
        this.utilServ.viewData.payrollSetup.weekendDeduction
      );
      this.onsalaryFrequencyChange();

      // this.setDataForPayrollComp(this.utilServ.viewData.payrollComponents)
      // this.setDataForpayruleSetups(this.utilServ.viewData.payruleSetups)
      // this.payruleSetupForm.controls.payruleSetupFormArray.disable();
      // this.payrollComponentForm.controls.payrollComponentFormArray.disable();

    } else if (this.utilServ.editData) {
      this.update = true;
      this.payrollForm.enable();

      this.payrollForm.controls.payrollCode.setValue(
        this.utilServ.editData.payrollSetup.payrollCode
      );
      this.payrollForm.controls.payDayCalc.setValue(
        this.utilServ.editData.payrollSetup.payDayCalc
      );
      this.payrollForm.controls.salaryType.setValue(
        this.utilServ.editData.payrollSetup.salaryType
      );
      this.payrollForm.controls.ctcForPeriod.setValue(
        this.utilServ.editData.payrollSetup.salaryForPeriod
      );
      this.payrollForm.controls.salaryFrequency.setValue(
        this.utilServ.editData.payrollSetup.salaryFrequency
      );
      this.payrollForm.controls.salaryCalculationDate.setValue(
        this.utilServ.editData.payrollSetup.salaryCalculationDate
      );
      this.payrollForm.controls.salaryGeneratedDate.setValue(
        this.utilServ.editData.payrollSetup.salaryGeneratedDate
      );
      this.payrollForm.controls.leavePlanCode.setValue(
        this.utilServ.editData.payrollSetup.leavePlanCode
      );
      this.payrollForm.controls.runPayrollAuto.setValue(
        this.utilServ.editData.payrollSetup.runPayrollAuto
      );
      this.payrollForm.controls.hasProbation.setValue(
        this.utilServ.editData.payrollSetup.hasProbation
      );
      this.payrollForm.controls.probationCode.setValue(
        this.utilServ.editData.probationCode
      );
      this.payrollForm.controls.overtimeCode.setValue(
        this.utilServ.editData.payrollSetup.overtimeCode
      );
      this.payrollForm.controls.allowOvertime.setValue(
        this.utilServ.editData.payrollSetup.allowOvertime
      );
      this.payrollForm.controls.uom.setValue(
        this.utilServ.editData.payrollSetup.uom
      );
      this.payrollForm.controls.onHoliday.setValue(
        this.utilServ.editData.payrollSetup.onHoliday
      );
      this.payrollForm.controls.isApproved.setValue(
        this.utilServ.editData.payrollSetup.isApproved
      );
      this.payrollForm.controls.isDefault.setValue(
        this.utilServ.editData.payrollSetup.isDefault
      );
      this.payrollForm.controls.weekendDeduction.setValue(
        this.utilServ.editData.payrollSetup.weekendDeduction
      );
      this.payrollForm.controls.excludeWeekoffs.setValue(
        this.utilServ.editData.payrollSetup.excludeWeekoffs
      );
      this.payrollForm.controls.excludeHolidays.setValue(
        this.utilServ.editData.payrollSetup.excludeHolidays
      );
      this.onsalaryFrequencyChange();

      // this.setDataForPayrollComp(this.utilServ.editData.payrollComponents)
      // this.setDataForpayruleSetups(this.utilServ.editData.payruleSetups)
      this.payrollForm.controls.onHoliday.disable();
      // this.payruleSetupForm.controls.payruleSetupFormArray.enable();
      // this.payrollComponentForm.controls.payrollComponentFormArray.enable();
      this.payrollForm.controls.payrollCode.disable();
      if (this.utilServ.editData.payrollSetup.probationCode == false || this.utilServ.editData.payrollSetup.probationCode == null) {
        this.payrollForm.controls.probationCode.disable();
      }
      if (this.utilServ.editData.payrollSetup.allowOvertime == false || this.utilServ.editData.payrollSetup.allowOvertime == null) {
        this.payrollForm.controls.overtimeCode.disable();
      }
      if (this.utilServ.editData.payrollSetup.runPayrollAuto == false || this.utilServ.editData.payrollSetup.runPayrollAuto == null) {
        this.payrollForm.controls.salaryGeneratedDate.disable();
        this.payrollForm.controls.onHoliday.disable();
      }

    } else if (this.utilServ.approveData) {
      this.approve = true;
      this.payrollForm.enable();
      this.payrollForm.controls.payrollCode.setValue(
        this.utilServ.approveData.payrollCode
      );
      this.payrollForm.controls.payDayCalc.setValue(
        this.utilServ.approveData.payDayCalc
      );
      this.payrollForm.controls.salaryType.setValue(
        this.utilServ.approveData.salaryType
      );
      this.payrollForm.controls.ctcForPeriod.setValue(
        this.utilServ.approveData.salaryForPeriod
      );
      this.payrollForm.controls.salaryFrequency.setValue(
        this.utilServ.approveData.salaryFrequency
      );
      this.payrollForm.controls.salaryCalculationDate.setValue(
        this.utilServ.approveData.salaryCalculationDate
      );
      this.payrollForm.controls.salaryGeneratedDate.setValue(
        this.utilServ.approveData.salaryGeneratedDate
      );
      this.payrollForm.controls.leavePlanCode.setValue(
        this.utilServ.approveData.leavePlanCode
      );
      this.payrollForm.controls.runPayrollAuto.setValue(
        this.utilServ.approveData.runPayrollAuto
      );
      this.payrollForm.controls.hasProbation.setValue(
        this.utilServ.approveData.hasProbation
      );
      this.payrollForm.controls.probationCode.setValue(
        this.utilServ.approveData.probationCode
      );
      this.payrollForm.controls.overtimeCode.setValue(
        this.utilServ.approveData.overtimeCode
      );
      this.payrollForm.controls.allowOvertime.setValue(
        this.utilServ.approveData.allowOvertime
      );
      this.payrollForm.controls.uom.setValue(
        this.utilServ.approveData.uom
      );
      this.payrollForm.controls.onHoliday.setValue(
        this.utilServ.approveData.onHoliday
      );
      this.payrollForm.controls.isApproved.setValue(
        this.utilServ.approveData.isApproved
      );
      this.payrollForm.controls.isDefault.setValue(
        this.utilServ.approveData.isDefault
      );
      this.payrollForm.controls.weekendDeduction.setValue(
        this.utilServ.approveData.weekendDeduction
      );
    }
  }

  getleavePlans() {
    this.utilServ.leavePlanbackup = [];
    this.spinner.show();
    this.httpGetService.getMasterList('leavePlans').subscribe(
      (res: any) => {
        this.spinner.hide();
        this.leavePlansList = res.response;
        this.utilServ.leavePlanbackup = res.response
      },
      (err) => {
        console.error(err.error.status.message,)
        this.spinner.hide();
      });
  }
  getoverTimesetups() {
    this.httpGetService.getMasterList('overtimesetups').subscribe(
      (res: any) => {
        this.overTimeSetupList = res.response;
      },
      (err) => {
        console.error(err.error.status.message,)
      });
  }
  checkCondition(val) {
    if (val.controls.isConditional.value === false) {
      val.comparator.setValue(null);
      val.get('comparator').setValue(null);
      val.get('comparatorComponent').setValue(null);
      val.get('param1Value').setValue(null);
      val.get('param2Value').setValue(null);

      val.get('comparator').clearValidators();
      val.get('comparatorComponent').clearValidators();
      val.get('param1Value').clearValidators();
      val.get('param2Value').clearValidators();
    }
    else {
      val.get('comparator').setValidators([Validators.required]);
      val.get('comparatorComponent').setValidators([Validators.required]);
      val.get('param1Value').setValidators([Validators.required]);
      if (val.controls.comparator.value === 'BETWEEN') {
        val.get('param2Value').setValidators([Validators.required]);
      }
      else {
        val.get('param2Value').clearValidators();
        val.get('param2Value').setValue(null);
      }
    }
    this.cdr.detectChanges();
  }

  checkCompartor(val) {
    if (val.controls.comparator.value === 'BETWEEN') {
      val.get('param2Value').setValidators([Validators.required]);
    }
    else {
      val.get('param1Value').setValidators([Validators.required]);
      val.get('param2Value').clearValidators();
      val.get('param2Value').setValue(null);
    }
    this.cdr.detectChanges();
  }

  createPayroll() {
    this.spinner.show();
    const deductions = [];
    const earnings = [];
    this.done.forEach(x => {
      if (x.payrollComponent.isDeduction == true) {
        deductions.push({
          componentCode: x.payrollComponent.componentCode,
          sortOrder: null,
          isactive:true
        } )
      } else if (x.payrollComponent.isDeduction == false) {
        earnings.push({
          componentCode: x.payrollComponent.componentCode,
          sortOrder: null,
          isactive: true
        })
      }
    })

    // Assign sort number starting from 1 for each array
    deductions.forEach((item, index) => {
      item.sortOrder = index + 1;
    });
    earnings.forEach((item, index) => {
      item.sortOrder = index + 1;
    });
    const payrollSetupComponents = [...earnings, ...deductions]

    this.payrollForm.get('payrollCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.payrollForm.controls.payrollCode.value), { emitEvent: false });
      // this.spinner.show();
    const obj = {
      "payrollSetup": {
        payrollCode: this.payrollForm.controls.payrollCode.value.trim(),
        salaryFrequency: this.payrollForm.controls.salaryFrequency.value,
        salaryCalculationDate: this.payrollForm.controls.salaryCalculationDate.value,
        payDayCalc: this.payrollForm.controls.payDayCalc.value,
        excludeHolidays: this.payrollForm.controls.excludeHolidays.value,
        excludeWeekoffs: this.payrollForm.controls.excludeWeekoffs.value,
        leavePlanCode: this.payrollForm.controls.leavePlanCode.value,
        allowOvertime: this.payrollForm.controls.allowOvertime.value == null ? false : this.payrollForm.controls.allowOvertime.value,
        overtimeCode: this.payrollForm.controls.overtimeCode.value,
        isDefault: this.payrollForm.controls.isDefault.value,
      },
     payrollSetupComponents
    }   
      this.httpPostService
        .create('payrollsetup', JSON.stringify(obj))
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            if (this.modifyisDefaultRecord) {
              this.updateIsDefaultRecord();
            }
            Swal.fire({
              title: 'Success!',
              text: this.payrollForm.controls.payrollCode.value + ' Created',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.payrollForm.reset();
              this.utilServ.payrollSetupResBackup = [];
              this.back();
            });
          }
          else {
            Swal.fire({
              title: 'Error!',
              text: res.status.message,
              icon: 'warning',
              showConfirmButton: true,
            })
          }
        },
          err => {
            this.spinner.hide();
            Swal.fire({
              title: 'error!',
              text: err.error.status.message,
              icon: 'error',
              timer: 10000,
            })
          });

  }
  
  updatePayroll() {
    this.spinner.show();
    const deductions = [];
    const earnings = [];
    this.done.forEach(x => {
      if (x.payrollComponent.isDeduction == true) {
        deductions.push({
          componentCode: x.payrollComponent.componentCode,
          sortOrder: null,
          isactive: true
        })
      } else if (x.payrollComponent.isDeduction == false) {
        earnings.push({
          componentCode: x.payrollComponent.componentCode,
          sortOrder: null,
          isactive: true
        })
      }
    })

    // Assign sort number starting from 1 for each array
    deductions.forEach((item, index) => {
      item.sortOrder = index + 1;
    });
    earnings.forEach((item, index) => {
      item.sortOrder = index + 1;
    });
    const payrollSetupComponents = [...earnings, ...deductions]
    const obj = {
      "payrollSetup": {
        allowOvertime: this.payrollForm.controls.allowOvertime.value,
        approvedby: this.utilServ.editData.payrollSetup.approvedby,
        approveddate: this.utilServ.editData.payrollSetup.approveddate,
        branchCode: this.utilServ.editData.payrollSetup.branchCode,
        companyCode: this.utilServ.editData.payrollSetup.companyCode,
        createdby: this.utilServ.editData.payrollSetup.createdby,
        createddate: this.utilServ.editData.payrollSetup.createddate,
        excludeHolidays: this.payrollForm.controls.excludeHolidays.value,
        excludeWeekoffs: this.payrollForm.controls.excludeWeekoffs.value,
        hasProbation: this.payrollForm.controls.hasProbation.value,
        id: this.utilServ.editData.payrollSetup.id,
        isApproved: this.utilServ.editData.payrollSetup.isApproved,
        isDefault: this.payrollForm.controls.isDefault.value,
        lastmodifiedby: this.utilServ.editData.payrollSetup.lastmodifiedby,
        lastmodifieddate: this.utilServ.editData.payrollSetup.lastmodifieddate,
        leavePlanCode: this.payrollForm.controls.leavePlanCode.value,
        onHoliday: this.payrollForm.controls.onHoliday.value,
        overtimeCode: this.payrollForm.controls.overtimeCode.value,
        payDayCalc: this.payrollForm.controls.payDayCalc.value,
        payrollCode: this.payrollForm.controls.payrollCode.value,
        probationCode: this.payrollForm.controls.probationCode.value,
        runPayrollAuto: this.payrollForm.controls.runPayrollAuto.value,
        salaryCalculationDate: this.payrollForm.controls.salaryCalculationDate.value,
        salaryFrequency: this.payrollForm.controls.salaryFrequency.value,
        salaryGeneratedDate: this.payrollForm.controls.salaryGeneratedDate.value,
        salaryType: this.payrollForm.controls.salaryType.value,
        salaryForPeriod: this.payrollForm.controls.ctcForPeriod.value,
        uom: this.payrollForm.controls.uom.value,
        weekendDeduction: this.payrollForm.controls.weekendDeduction.value,
      },
      payrollSetupComponents
    }
      this.httpPutService
        .doPut('payrollsetup', JSON.stringify(obj))
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            if (this.modifyisDefaultRecord) {
              this.updateIsDefaultRecord();
            }
            Swal.fire({
              title: 'Success!',
              text: this.payrollForm.controls.payrollCode.value + ' Updated',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.payrollForm.reset();
              this.utilServ.payrollSetupResBackup = [];
              this.back();
            });
          }
          else {
            Swal.fire({
              title: 'Error!',
              text: res.status.message,
              icon: 'warning',
              showConfirmButton: true,
            })
          }
        },
          err => {
            this.spinner.hide();
            Swal.fire({
              title: 'error!',
              text: err.error.status.message,
              icon: 'error',
              timer: 10000,
            })
          });
  }
  Approve() {
    this.spinner.show();

    const obj = {
      id: this.utilServ.approveData.id,
      branchCode: this.utilServ.approveData.branchCode,
      companyCode: this.utilServ.approveData.companyCode,
      payrollCode: this.payrollForm.controls.payrollCode.value,
      payDayCalc: this.payrollForm.controls.payDayCalc.value,
      weekendDeduction: this.payrollForm.controls.weekendDeduction.value,

      // : this.payrollForm.controls..value,
      allowOvertime: this.payrollForm.controls.allowOvertime.value,
      createdby: this.utilServ.approveData.createdby,
      createddate: this.utilServ.approveData.createddate,
      isApproved: true,
      lastmodifiedby: this.utilServ.approveData.lastmodifiedby,
      lastmodifieddate: this.utilServ.approveData.lastmodifieddate,
    };
    this.httpPutService
      .doPut('payrollsetup/approve', JSON.stringify(obj))
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: this.payrollForm.controls.payrollCode.value + 'Approved',
              icon: 'success',
              timer: 3000,
            }).then(() => {
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
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          })
        });
  }
  checkDefault() {
    const row = this.utilServ.payrollSetupResBackup.find(x => x.payrollSetup.isDefault == true);
    if (row) {
      if (row.payrollSetup.payrollCode !== this.payrollForm.controls.payrollCode.value) {
        if (this.payrollForm.controls.isDefault.value) {
          if (this.payrollForm.controls.payrollCode.value != null) {
            if (row) {
              Swal.fire({
                title: 'Are you sure?',
                html:
                  'Do you want to change the default payroll code from ' + '<br><b>' + row?.payrollSetup.payrollCode + '</b>' +
                  ' to <b>' + this.payrollForm.controls.payrollCode.value + '</b> ? ' + '<br>Note: This does not impact existing employees',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.modifyisDefaultRecord = row
                }
                else {
                  this.payrollForm.controls.isDefault.setValue(false);
                }
              })
            }
          } else {
            Swal.fire({
              icon: 'warning',
              text: 'Enter PayrollCode',
              showConfirmButton: true,
            });
            this.payrollForm.controls.isDefault.setValue(false);
          }
        }
        else {
          this.modifyisDefaultRecord = null;
        }
      } else {
        const rows = this.utilServ.payrollSetupResBackup.filter(x => x.payrollSetup.isDefault == true);
        if (rows.length > 1) {
          this.payrollForm.controls.isDefault.setValue(false);
        } else {
          Swal.fire({
            icon: 'warning',
            text: 'We required one Payroll as isDefault',
            showConfirmButton: true,
          });
          this.payrollForm.controls.isDefault.setValue(true);
        }
      }
    }
  }
  updateIsDefaultRecord() {
    const req = this.modifyisDefaultRecord;
    req.payrollSetup.isDefault = false;
    this.httpPutService.doPut('payrollsetup', req).subscribe((res: any) => {
      if (res.status.message == 'SUCCESS') {
        this.sweetAlert('success', req.payrollSetup.payrollCode + '  also Updated!');
        this.modifyisDefaultRecord = null;
        this.back();
      }
      else {
        Swal.fire({
          icon: 'warning',
          title: res.status.message,
          showConfirmButton: true,
        });
      }
    }, (err) => {
      this.spinner.hide();
      this.sweetAlert('error', err.error.status.message);
    });
  }
  sweetAlert(icon, text) {
    Swal.fire({
      icon: icon,
      text: text,
      showConfirmButton: true,
      // timer: 1500,
    });
  }
  ngOnDestroy() {
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
  }
} // drop12(event: CdkDragDrop<string[]>, ev) {
//   if (event.previousContainer.id == 'cdk-drop-list-0') {
//     let notFound = false;
//     let requiredParentCmp = [], requiredPRules = [];
//     let strReq = [];
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       transferArrayItem(event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex);
//       event.container.data.forEach(x => {
//         x['payRules'].forEach(element => {
//           if (element.parentComponentCode !== null && element.componentCode == x['payrollComponent'].componentCode && element.payrollCode == null) {
//             if (!this.done.some(doneItem => doneItem.payrollComponent.componentCode === element.parentComponentCode)) {
//               requiredParentCmp.push(x)
//               requiredPRules.push(element)
//               strReq.push(element.parentComponentCode)
//             }
//           }
//         });
//       })
//       requiredPRules.forEach(parentCode => {
//         if (!this.done.some(doneItem => doneItem.payrollComponent.componentCode === parentCode.parentComponentCode)) {
//           notFound = true;
//           return;
//         }
//       });
//       if (!notFound) {
//         requiredParentCmp = [], requiredPRules = [], strReq = [];
//       } else {
//         Swal.fire({
//           icon: 'info',
//           html: 'This component is dependant on ' + '<b>' + strReq.join(', ') + '. </b> Please add that first',
//           showConfirmButton: true,
//           // timer: 1500,
//         });
//         this.salaryMasterList.push(requiredParentCmp[0])
//         event.container.data.splice(event.currentIndex, 1);

//       }
//       requiredParentCmp = [], requiredPRules = [], strReq = [];
//     }
//   }
//   else {
//     let notFound = false;
//     let requiredParentCmp = [], requiredPRules = [];
//     let strReq = [], reqStr = [];
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       transferArrayItem(event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex);
//       event.previousContainer.data.forEach(x => {
//         x['payRules'].forEach(element => {
//           if (element.parentComponentCode !== null && element.componentCode == x['payrollComponent'].componentCode && element.payrollCode == null) {
//             if (!this.done.some(doneItem => doneItem.payrollComponent.componentCode === element.parentComponentCode)) {

//               requiredParentCmp.push(x)
//               requiredPRules.push(element)

//               strReq.push(element.componentCode)
//               reqStr.push(element.parentComponentCode)
//             }
//           }
//         });
//       })
//       requiredPRules.forEach(comp => {
//         if (!this.done.some(doneItem => doneItem.payrollComponent.componentCode === comp.parentComponentCode)) {
//           notFound = true;
//           return; // Exit loop early if any value is not found
//         }
//       });
//       if (!notFound) {
//         requiredParentCmp = [], requiredPRules = [], strReq = [], reqStr = [];

//       } else {
//         Swal.fire({
//           icon: 'info',
//           html: 'You cant remove this component because' + '<b>' + strReq.join(', ') + '</b> has dependency',
//           showConfirmButton: true,
//           // timer: 1500,
//         });
//         reqStr.forEach(re => {
//           const id = this.salaryMasterList.findIndex(x => x.payrollComponent.componentCode == re)
//           if (id >= 0) {
//             event.previousContainer.data.push(this.salaryMasterList[id])
//             event.container.data.splice(id, 1);
//           }
//         })
//       }

//     }
//   }

// }
// setupFilteredOptions(row, i) {
//   const payrollRow = this.payrollComponentForm.get('payrollComponentFormArray') as FormArray;
//   const componentCodeControl = payrollRow.at(i).get('componentCode'); // Use 'at' method to access controls in FormArray

//   componentCodeControl.valueChanges.pipe(
//     startWith(''),
//     map(value => this._filter(value || ''))
//   ).subscribe(filteredOptions => {
//     this.filteredSalaryRole = filteredOptions;
//   });
// }
// private _filter(value: string): string[] {
//   const filterValue = value.toLowerCase();
//   return this.salaryMasterList.filter(option => option.payrollComponent.componentCode.toLowerCase().includes(filterValue));
// }
// onChangeCompCode(index) {
//   this.maxLimitInYrQuestions(index)
//   const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
//   const payroleArray = this.payrollComponentForm.get('payrollComponentFormArray') as FormArray;

//   this.sendComponents(index, this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.componentCode').value)
//   const row = this.salaryMasterList.filter(option => option.payrollComponent.componentCode ==
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.componentCode').value);
//   if (row && Array.isArray(row) && row.length > 0 && row[0]?.payrollComponent !== undefined && row[0]?.payrollComponent !== null) {
//     // this.setDataForpayruleSetups(row[0].payRules);
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.componentCode').setValue(row[0].payrollComponent.componentCode)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.componentType').setValue(row[0].payrollComponent.componentType)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.isTaxable').setValue(row[0].payrollComponent.isTaxable)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.timeframe').setValue(row[0].payrollComponent.timeframe)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.maxLimitInYr').setValue(row[0].payrollComponent.maxLimitInYr)
//     if (row[0]?.payrollComponent.maxLimitInYr !== null) {
//       this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.maxLimitInYrQuestion').setValue(true);
//       this.maxLimitInYrQuestions(index);
//     } else {
//       this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.maxLimitInYrQuestion').setValue(false);
//       this.maxLimitInYrQuestions(index);
//     }
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.isDeduction').setValue(row[0].payrollComponent.isDeduction)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.isProrata').setValue(row[0].payrollComponent.isProrata)

//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.isCommission').setValue(row[0].payrollComponent.isCommission)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.xfrUnusedToAllowance').setValue(row[0].payrollComponent.xfrUnusedToAllowance)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.isDeductionCompanyPayable').setValue(row[0].payrollComponent.isDeductionCompanyPayable)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.includeInTotalSalCalc').setValue(row[0].payrollComponent.includeInTotalSalCalc)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.includeInCtcCalc').setValue(row[0].payrollComponent.includeInCtcCalc)
//     this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.isactive').setValue(row[0].payrollComponent.isactive);
//     // (this.payruleSetupForm.get('payruleSetupFormArray') as FormArray).controls = [];
//     const exists = payrullArray.controls.some((control: AbstractControl) => {
//       return (
//         control.get('componentCode')?.value === row[0]?.payrollComponent?.componentCode);
//     });
//     if (!exists) {
//       this.setDataForpayruleSetups(row[0]?.payRules);
//     }
//   }
// }
// compareBothPayrollAndRule() {
//   const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
//   const payroleArray = this.payrollComponentForm.get('payrollComponentFormArray') as FormArray;
//   for (let i = payrullArray.length - 1; i >= 0; i--) {
//     const payruleControl = payrullArray.at(i);
//     // Check if componentCode exists in payrullArray
//     const componentCodeExists = payroleArray.controls.some((payrollControl: AbstractControl) => {
//       return payrollControl.get('componentCode')?.value === payruleControl.get('componentCode')?.value;
//     });
//     if (!componentCodeExists) {
//       // Remove the control from payroleArray if the componentCode does not exist in payrullArray
//       payrullArray.removeAt(i);
//     }
//   }
//   for (let index = 0; index <= payroleArray.length - 1; index++) {
//     this.sendComponents(index, this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.componentCode').value);
//   }
// }

// deduction(index: number): void {
//   const isDeductionControl = this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.isDeduction');
//   const isTaxableControl = this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.isTaxable');
//   const isDeductionCompanyPayable = this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.isDeductionCompanyPayable');
//   if (isDeductionControl.value) {
//     isTaxableControl.disable();
//     isTaxableControl.setValue(false);
//     isDeductionCompanyPayable.enable();
//     isDeductionCompanyPayable.setValue(true)
//   } else {
//     isTaxableControl.enable();
//     isDeductionCompanyPayable.disable();
//     isDeductionCompanyPayable.setValue(false);
//   }
// }

// maxLimitInYrQuestions(index) {
//   const maxLimitInYrQuestion = this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.maxLimitInYrQuestion');
//   const maxLimitInYr = this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.maxLimitInYr');
//   const xfrUnusedToAllowance = this.payrollComponentForm.get('payrollComponentFormArray.' + index + '.xfrUnusedToAllowance');
//   if (maxLimitInYrQuestion.value) {
//     maxLimitInYr.enable();
//     xfrUnusedToAllowance.enable();
//     xfrUnusedToAllowance.setValue(true)
//   } else {
//     maxLimitInYr.disable();
//     xfrUnusedToAllowance.disable();
//     maxLimitInYr.setValue(null);
//     xfrUnusedToAllowance.setValue(false)
//   }
//   this.cdr.detectChanges();
// }
// hasProbation() {
//   if (this.payrollForm.controls.hasProbation.value == false) {
//     this.payrollForm.controls.probationCode.setValue(null);
//     this.payrollForm.controls.probationCode.disable();
//   }
//   else {
//     this.payrollForm.controls.probationCode.enable();
//   }
// }
// getSalarylabels() {
//   this.globalServ.getLabels('salaryComponent').subscribe((res: any) => {
//     this.salaryLabels = res.response;
//     this.spinner.hide();
//   }, (err) => {
//     this.spinner.hide();
//   });
// }
// getLabelDescription(divId: string): string {
//   const label = this.salaryLabels.find(item => item.colCode === divId);
//   return label ? label.labelDescription : '';
// }


// hasInteger(colCode: string): boolean {
//   const label = this.salaryLabels.find(item => item.colCode === colCode);
//   return label?.labelDescription.includes('{integer}');
// }
// splitLabelDescription(colCode: string): { before: string, after: string } {
//   const label = this.salaryLabels.find(item => item.colCode === colCode);
//   const parts = label.labelDescription.split('{integer}');
//   return {
//     before: parts[0] || '',
//     after: parts[1] || ''
//   };
// }
// getPayrulesLabels() {
//   this.spinner.show();
//   this.globalServ.getLabels('payrulesForm').subscribe((res: any) => {
//     this.pyruleLabels = res.response;
//     this.spinner.hide();
//   }, (err) => {
//     this.spinner.hide();
//   });
// }
// getPayrulesLabelDescription(divId: string): string {
//   const label = this.pyruleLabels?.find(item => item.colCode === divId);
//   return label ? label.labelDescription : '';
// }

// payrollComponentItems(): FormArray {
//   return this.payrollComponentForm.get('payrollComponentFormArray') as FormArray;
// }
// addSalaryItem() {
//   const length = this.payrollComponentItems().value.length;
//   if (length > 0) {
//     const isEmpty =
//       this.payrollComponentItems().value[length - 1].componentCode.length == 0 || this.payrollComponentItems().value[length - 1].timeframe.length == 0;
//     if (!isEmpty) {
//       this.payrollComponentItems().push(this.payrollComponentFormArray());
//     }
//   } else {
//     this.payrollComponentItems().push(this.payrollComponentFormArray());
//   }
//   this.step = this.payrollComponentItems().value.length - 1;
//   this.deduction(length);
//   this.maxLimitInYrQuestions(length);
//   this.setupFilteredOptions('', length)
// }
// removeSalaryItem(index, val) {
//   // if (this.payrollComponentItems().length == 1) {
//   //   Swal.fire({
//   //     icon: 'info',
//   //     text: 'We required atleast one component details',
//   //     timer: 10000,
//   //   });
//   // } else {
//   if (val.id.value) {
//     // check in payroles for this componentcode and delete them in ts
//     const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
//     const dependencyRuleCode = [];
//     payrullArray.controls.forEach((control: AbstractControl) => {
//       if (control.get('isDeleted')?.value == false) {
//         if (control.get('componentCode')?.value == val.componentCode.value
//           || control.get('parentComponentCode')?.value == val.componentCode.value) {
//           dependencyRuleCode.push(control.get('ruleCode')?.value)
//         }
//       }
//     })
//     if (dependencyRuleCode.length > 0) {
//       Swal.fire({
//         icon: 'info',
//         html: 'you are using ' + '<b>' + val.componentCode.value + '</b>' + ' in ' + '<b>' + (dependencyRuleCode).toString() +
//           '</b>' + ' as Component/Parent Component, So first delete/modify in ' + '<b>' + 'Payrulessetup!' + '<b>',
//       });
//     } else {
//       const payrollComponentFormArray = this.payrollComponentForm.get('payrollComponentFormArray') as FormArray;
//       payrollComponentFormArray.controls.forEach((control: AbstractControl) => {
//         if (control.get('componentCode')?.value == val.componentCode.value && control.get('isDeleted')?.value !== true) {
//           control.get('isDeleted')?.setValue(true)
//         }
//       })
//       const found = this.payrollComponentItems().controls.find(x => x.value.componentCode == val.componentCode.value)
//       if (found) {
//         found.value.isDeleted = true;
//       }
//       const id = this.filteredSalaryComponentList.findIndex(x => x.index == index);
//       this.filteredSalaryComponentList.splice(id, 1);
//     }
//     // value to show in html ends

//   } else {
//     this.payrollComponentItems().removeAt(index);
//     const id = this.filteredSalaryComponentList.findIndex(x => x.index == index);
//     this.filteredSalaryComponentList.splice(id, 1);
//   }
//   // }
// }
// removeSalaryItemAtCreate(index) {
//   if (this.payrollComponentItems().length == 1) {
//     Swal.fire({
//       icon: 'info',
//       text: 'We required atleast one component details',
//       timer: 10000,
//     });
//   } else {
//     this.payrollComponentItems().removeAt(index);
//     const id = this.filteredSalaryComponentList.findIndex(x => x.index == index);
//     this.filteredSalaryComponentList.splice(id, 1);
//     this.step = this.payrollComponentItems().value.length - 1;

//   }
// }
// removePayruleSetupItemAtCreate(index) {
//   if (this.PayruleSetupItems().length == 1) {
//     Swal.fire({
//       icon: 'info',
//       text: 'We required atleast one Rule details',
//       timer: 10000,
//     });
//   } else {
//     this.PayruleSetupItems().removeAt(index);
//     this.step = this.payrollComponentItems().value.length - 1;

//   }
// }
// removePayruleSetupItem(index, val) {
//   // if (this.PayruleSetupItems().length == 1) {
//   //   Swal.fire({
//   //     icon: 'info',
//   //     text: 'We require payrule ',
//   //     timer: 10000,
//   //   });
//   // } else {
//   if (val.ruleId.value) {
//     const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
//     payrullArray.controls.forEach((control: AbstractControl) => {
//       if (control.get('componentCode')?.value == val.componentCode.value
//         || control.get('parentComponentCode')?.value == val.componentCode.value) {
//         control.get('isDeleted')?.setValue(true)
//       }
//     })
//     const found = this.PayruleSetupItems().controls.find(x => x.value.ruleCode == val.ruleCode.value)
//     if (found) {
//       found.value.isDeleted = true;
//     }
//   } else {
//     this.PayruleSetupItems().removeAt(index);
//   }
//   // }
// }
// payrollComponentFormArray(): FormGroup {
//   return this.fb.group({
//     componentCode: new FormControl('', [Validators.required]),
//     componentType: new FormControl('Recurring', [Validators.required]),
//     // payrollCode: new FormControl('', [Validators.required]),
//     isTaxable: [false],
//     "timeframe": new FormControl('as per salary cycle', [Validators.required]),
//     maxLimitInYrQuestion: false,
//     "maxLimitInYr": null,
//     includeInTotalSalCalc: [true],
//     includeInCtcCalc: [true],
//     isDeduction: [false],
//     isProrata: [false],
//     isactive: [true],
//     expanded: true,
//     isCommission: [false],
//     "xfrUnusedToAllowance": false,
//     isDeductionCompanyPayable: [false],
//     isApproved: [false],
//     approvedby: null,
//     approveddate: null,
//     buCode: null,
//     createdby: null,
//     createddate: null,
//     isDeleted: false,
//     id: null,
//     lastmodifiedby: null,
//     lastmodifieddate: null,
//     payrollCode: null,
//     sortOrder: null,
//     tenantCode: null,
//   });
// }
// PayruleSetupItems(): FormArray {
//   return this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
// }


// addPayruleSetupItem() {
//   const length = this.PayruleSetupItems().value.length;
//   const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
//   let inValid = false;
//   payrullArray.controls.forEach((formGroup, i) => {
//     this.setValidationsInArray(formGroup)
//     this.checkCompartor(formGroup);
//     if (formGroup.status == 'INVALID') {
//       inValid = true
//       this.errorstep = i;
//       console.error(i);
//     }
//     else {
//       inValid = false;
//       this.errorstep = null;

//     }
//     Object.values(formGroup['controls']).forEach((control: AbstractControl) => {
//       control.markAsTouched();
//     });
//   });
//   if (inValid) {
//     return;
//   } else {
//     if (length > 0) {
//       const isEmpty = this.PayruleSetupItems().value[length - 1].componentCode.length == 0 ||
//         this.PayruleSetupItems().value[length - 1].calcType.length == 0;
//       if (!isEmpty) {
//         this.PayruleSetupItems().push(this.payruleSetupFormArray());
//       }
//     } else {
//       this.PayruleSetupItems().push(this.payruleSetupFormArray());
//     }
//     this.stepRules = this.PayruleSetupItems().value.length - 1;
//   }
// }
// setValidationsInArray(row) {
//   if (row.controls.calcType.value == 'pct') {
//     row.get('percentage').setValidators([Validators.required]);
//     row.get('parentComponentCode').setValidators([Validators.required]);
//     row.get('fixedAmount').clearValidators();
//     row.get('fixedAmount').setValue(null);
//   }
//   else {
//     row.get('fixedAmount').setValidators([Validators.required]);
//     row.get('percentage').clearValidators();
//     row.get('parentComponentCode').clearValidators();
//     row.get('parentComponentCode').setValue(null);
//     row.get('percentage').setValue(null);
//   }
//   this.cdr.detectChanges();
// }

// payruleSetupFormArray(): FormGroup {
//   return this.fb.group({
//     ruleCode: new FormControl(''),
//     // payrollCode: new FormControl('', [Validators.required]),
//     componentCode: new FormControl('', [Validators.required]),
//     parentComponentCode: [null],
//     isConditional: [false],
//     comparator: [null],
//     comparatorComponent: [null],
//     param1Value: [''],
//     param2Value: [''],
//     calcType: ['', [Validators.required]],
//     percentage: [null],
//     fixedAmount: [null],
//     isApproved: [false],
//     approvedby: null,
//     approveddate: null,
//     buCode: null,
//     isactive: true,
//     createdby: null,
//     createddate: null,
//     lastmodifiedby: null,
//     isDeleted: false,
//     lastmodifieddate: null,
//     payrollCode: null,
//     ruleId: null,
//     tenantCode: null,
//   })
// }
// sendComponents(i, code) {
//   this.componentCodeErrorIndex = {
//     error: false,
//     componentCode: ''
//   }
//   this.payrollComponentItems().controls.forEach((x, index) => {
//     if (code == x['controls'].componentCode.value && i !== index) {
//       this.componentCodeErrorIndex = {
//         error: true,
//         componentCode: x['controls'].componentCode.value
//       }
//     }
//   });
//   const componentCodeList = this.payrollComponentItems().controls.map((control: AbstractControl) => {
//     return control.get('componentCode')?.value;
//   });
//   this.filteredSalaryComponentList = componentCodeList
// }
// checkDuplicateRecordsInPayrules(i, code) {
//   this.ruleCodeErrorIndex = {
//     error: false,
//     ruleCode: ''
//   }
//   this.PayruleSetupItems().controls.forEach((x, index) => {
//     if (code == x.value.ruleCode && i !== index) {
//       this.ruleCodeErrorIndex = {
//         error: true,
//         ruleCode: x.value.ruleCode
//       }
//     }
//   })
// }
  // setDataForpayruleSetups(data) {
  //   data.forEach(element => {
  //     (this.payruleSetupForm.get('payruleSetupFormArray') as FormArray).controls.push(
  //       this.fb.group({
  //         ruleCode: element.ruleCode,
  //         componentCode: element.componentCode,
  //         parentComponentCode: element.parentComponentCode,
  //         isConditional: element.isConditional,
  //         comparator: element.comparator,
  //         comparatorComponent: element.comparatorComponent,
  //         param1Value: element.param1Value,
  //         param2Value: element.param2Value,
  //         calcType: element.calcType,
  //         percentage: element.percentage,
  //         fixedAmount: element.fixedAmount,
  //         isApproved: element.isApproved,
  //         approvedby: element.approvedby,
  //         approveddate: element.approveddate,
  //         buCode: element.buCode,
  //         isDeleted: false,
  //         isactive: element.isactive,
  //         createdby: element.createdby,
  //         createddate: element.createddate,
  //         lastmodifiedby: element.lastmodifiedby,
  //         lastmodifieddate: element.lastmodifieddate,
  //         payrollCode: element.payrollCode,
  //         ruleId: element.ruleId,
  //         tenantCode: element.tenantCode,
  //       }))
  //   })
  //   if (this.utilServ.editData) {
  //     const payrollComponentList = this.payruleSetupForm;
  //     const payruleSetupFormArray = payrollComponentList.get('payruleSetupFormArray') as FormArray;
  //     payruleSetupFormArray.controls.forEach((control: AbstractControl) => {
  //       const ruleCode = control.get('ruleCode')?.value;

  //       if (ruleCode === 'ruleCode') {
  //         // Disable the control with the specific componentCode
  //         control.disable();
  //       }
  //     })
  //   }
  // }

  // createPayrollWithSalary() {
  //   this.payrollForm.get('payrollCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.payrollForm.controls.payrollCode.value), { emitEvent: false });
  //   this.spinner.show();
  //   const obj = {
  //     payrollCode: this.payrollForm.controls.payrollCode.value.trim(),
  //     salaryFrequency: this.payrollForm.controls.salaryFrequency.value,
  //     salaryCalculationDate: this.payrollForm.controls.salaryCalculationDate.value,
  //     payDayCalc: this.payrollForm.controls.payDayCalc.value,
  //     excludeHolidays: this.payrollForm.controls.excludeHolidays.value,
  //     excludeWeekoffs: this.payrollForm.controls.excludeWeekoffs.value,
  //     leavePlanCode: this.payrollForm.controls.leavePlanCode.value,
  //     allowOvertime: this.payrollForm.controls.allowOvertime.value == null ? false : this.payrollForm.controls.allowOvertime.value,
  //     overtimeCode: this.payrollForm.controls.overtimeCode.value,
  //     isDefault: this.payrollForm.controls.isDefault.value,
  //     payrollComponents: this.payrollComponentForm.controls.payrollComponentFormArray.value
  //   }
  //   this.httpPostService
  //     .create('payrollsetup', JSON.stringify(obj))
  //     .subscribe((res: any) => {
  //       this.spinner.hide();
  //       if (res.status.message == 'SUCCESS') {
  //         if (this.modifyisDefaultRecord) {
  //           this.updateIsDefaultRecord();
  //         }
  //         Swal.fire({
  //           title: 'Success!',
  //           text: this.payrollForm.controls.payrollCode.value + ' Created',
  //           icon: 'success',
  //           timer: 10000,
  //         }).then(() => {
  //           this.payrollForm.reset();
  //           this.utilServ.payrollSetupResBackup = [];
  //           this.back();
  //         });
  //       }
  //       else {
  //         Swal.fire({
  //           title: 'Error!',
  //           text: res.status.message,
  //           icon: 'warning',
  //           showConfirmButton: true,
  //         })
  //       }
  //     },
  //       err => {
  //         this.spinner.hide();
  //         Swal.fire({
  //           title: 'error!',
  //           text: err.error.status.message,
  //           icon: 'error',
  //           timer: 10000,
  //         })
  //       });

  // }
  // SendTotalSetup() {
  //   const componentCodeCounts = {}; // To track the counts of each componentCode
  //   const payrollArray = this.payrollComponentForm.get('payrollComponentFormArray') as FormArray;
  //   const payruleArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
  //   const payroleArrayValues = payrollArray.controls.map(control => {
  //     control.value.payrollCode = this.payrollForm.controls.payrollCode.value;
  //     const controlValue = control.value;
  //     return controlValue;
  //   });

  //   const payruleArrayValues = payruleArray.controls.map(control => {
  //     const componentCode = control.value.componentCode;
  //     componentCodeCounts[componentCode] = componentCodeCounts[componentCode] || 0;
  //     const ruleCode = `${this.payrollForm.controls.payrollCode.value}_${componentCode}_${componentCodeCounts[componentCode]}`;
  //     componentCodeCounts[componentCode]++;
  //     control.patchValue({ ruleCode: ruleCode });
  //     control.value.payrollCode = this.payrollForm.controls.payrollCode.value;
  //     control.value.ruleId = null;
  //     const controlValue = control.value;
  //     return controlValue;
  //   });
  //   payruleArrayValues.forEach((x, i) => {
  //     x.ruleId = null;
  //     x.payrollCode = this.payrollForm.controls.payrollCode.value;
  //     x.sortOrder = i + 1
  //   })
  //   payroleArrayValues.forEach((x, i) => {
  //     x.sortOrder = i + 1
  //   })
  //   this.payrollForm.get('payrollCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.payrollForm.controls.payrollCode.value), { emitEvent: false });
  //   this.spinner.show();
  //   const obj = {
  //     payrollCode: this.payrollForm.controls.payrollCode.value.trim(),
  //     salaryFrequency: this.payrollForm.controls.salaryFrequency.value,
  //     salaryCalculationDate: this.payrollForm.controls.salaryCalculationDate.value,
  //     payDayCalc: this.payrollForm.controls.payDayCalc.value,
  //     excludeHolidays: this.payrollForm.controls.excludeHolidays.value,
  //     excludeWeekoffs: this.payrollForm.controls.excludeWeekoffs.value,
  //     leavePlanCode: this.payrollForm.controls.leavePlanCode.value,
  //     allowOvertime: this.payrollForm.controls.allowOvertime.value == null ? false : this.payrollForm.controls.allowOvertime.value,
  //     overtimeCode: this.payrollForm.controls.overtimeCode.value,
  //     isDefault: this.payrollForm.controls.isDefault.value,
  //     payrollComponents: payroleArrayValues,
  //     payruleSetups: payruleArrayValues
  //   }
  //   this.httpPostService
  //     .create('payrollsetup', JSON.stringify(obj))
  //     .subscribe((res: any) => {
  //       this.spinner.hide();
  //       if (res.status.message == 'SUCCESS') {
  //         if (this.modifyisDefaultRecord) {
  //           this.updateIsDefaultRecord();
  //         }
  //         Swal.fire({
  //           title: 'Success!',
  //           text: this.payrollForm.controls.payrollCode.value + ' Created',
  //           icon: 'success',
  //           timer: 10000,
  //         }).then(() => {
  //           this.payrollForm.reset();
  //           this.utilServ.payrollSetupResBackup = [];
  //           this.back();
  //         });
  //       }
  //       else {
  //         Swal.fire({
  //           title: 'Error!',
  //           text: res.status.message,
  //           icon: 'warning',
  //           showConfirmButton: true,
  //         })
  //       }
  //     },
  //       err => {
  //         this.spinner.hide();
  //         Swal.fire({
  //           title: 'error!',
  //           text: err.error.status.message,
  //           icon: 'error',
  //           timer: 10000,
  //         })
  //       });
  // }
 
  // UpdateTotalSetup() {
  //   this.spinner.show();
  //   const ruleObj = [], payrollCompObj = [];
  //   const payrollComponentList = this.payrollComponentForm;
  //   const payruleList = this.payruleSetupForm;
  //   const payrollComponentFormArray = payrollComponentList.get('payrollComponentFormArray') as FormArray;
  //   payrollComponentFormArray.controls.forEach((control: AbstractControl, i) => {
  //     payrollCompObj.push({
  //       approvedby: control.get('approvedby')?.value,
  //       approveddate: control.get('approveddate')?.value,
  //       buCode: control.get('buCode')?.value,
  //       componentCode: control.get('componentCode')?.value,
  //       componentType: control.get('componentType')?.value,
  //       createdby: control.get('createdby')?.value,
  //       createddate: control.get('createddate')?.value,
  //       id: control.get('id')?.value,
  //       includeInCtcCalc: control.get('includeInCtcCalc')?.value,
  //       includeInTotalSalCalc: control.get('includeInTotalSalCalc')?.value,
  //       isApproved: control.get('isApproved')?.value,
  //       isCommission: control.get('isCommission')?.value,
  //       isDeduction: control.get('isDeduction')?.value == null ? false : control.get('isDeduction')?.value,
  //       isDeductionCompanyPayable: control.get('isDeductionCompanyPayable')?.value == null ? false : control.get('isDeductionCompanyPayable')?.value,
  //       isDeleted: control.get('isDeleted')?.value,
  //       isProrata: control.get('isProrata')?.value,
  //       isactive: control.get('isactive')?.value,
  //       isTaxable: control.get('isTaxable')?.value,
  //       lastmodifiedby: control.get('lastmodifiedby')?.value,
  //       lastmodifieddate: control.get('lastmodifieddate')?.value,
  //       maxLimitInYr: control.get('maxLimitInYr')?.value,
  //       payrollCode: control.get('payrollCode')?.value,
  //       sortOrder: control.get('sortOrder')?.value == null ? i + 1 : control.get('sortOrder')?.value,
  //       tenantCode: control.get('tenantCode')?.value,
  //       timeframe: control.get('timeframe')?.value,
  //       xfrUnusedToAllowance: control.get('xfrUnusedToAllowance')?.value,
  //     })

  //   });
  //   const payrulesFArray = payruleList.get('payruleSetupFormArray') as FormArray;
  //   payrulesFArray.controls.forEach((control: AbstractControl, i) => {
  //     ruleObj.push({
  //       "ruleCode": control.get('ruleCode')?.value == null || control.get('ruleCode')?.value == ''
  //         ? `${this.payrollForm.controls.payrollCode.value}_${control.get('componentCode')?.value}_${i + 1}` : control.get('ruleCode')?.value,
  //       // `${this.payrollForm.controls.payrollCode.value}_${componentCode}_${componentCodeCounts[componentCode]}`;
  //       "componentCode": control.get('componentCode')?.value,
  //       "parentComponentCode": control.get('parentComponentCode')?.value,
  //       "isConditional": control.get('isConditional')?.value,
  //       "comparator": control.get('comparator')?.value,
  //       "comparatorComponent": control.get('comparatorComponent')?.value,
  //       "param1Value": control.get('param1Value')?.value,
  //       "param2Value": control.get('param2Value')?.value,
  //       "calcType": control.get('calcType')?.value,
  //       isactive: control.get('isactive')?.value,
  //       "percentage": control.get('percentage')?.value,
  //       "fixedAmount": control.get('fixedAmount')?.value,
  //       "isApproved": control.get('isApproved')?.value,
  //       "approvedby": control.get('approvedby')?.value,
  //       "approveddate": control.get('approveddate')?.value,
  //       "buCode": control.get('buCode')?.value,
  //       "isDeleted": control.get('isDeleted')?.value,
  //       sortOrder: control.get('sortOrder')?.value == null ? i + 1 : control.get('sortOrder')?.value,
  //       "createdby": control.get('createdby')?.value,
  //       "createddate": control.get('createddate')?.value,
  //       "lastmodifiedby": control.get('lastmodifiedby')?.value,
  //       "lastmodifieddate": control.get('lastmodifieddate')?.value,
  //       "payrollCode": this.payrollForm.controls.payrollCode.value,
  //       "ruleId": control.get('ruleId')?.value,
  //       "tenantCode": control.get('tenantCode')?.value,
  //     })
  //   })
  //   const obj = {
  //     allowOvertime: this.payrollForm.controls.allowOvertime.value,
  //     approvedby: this.utilServ.editData.approvedby,
  //     approveddate: this.utilServ.editData.approveddate,
  //     branchCode: this.utilServ.editData.branchCode,
  //     companyCode: this.utilServ.editData.companyCode,
  //     createdby: this.utilServ.editData.createdby,
  //     createddate: this.utilServ.editData.createddate,
  //     excludeHolidays: this.payrollForm.controls.excludeHolidays.value,
  //     excludeWeekoffs: this.payrollForm.controls.excludeWeekoffs.value,
  //     hasProbation: this.payrollForm.controls.hasProbation.value,
  //     id: this.utilServ.editData.id,
  //     isApproved: this.utilServ.editData.isApproved,
  //     isDefault: this.payrollForm.controls.isDefault.value,
  //     lastmodifiedby: this.utilServ.editData.lastmodifiedby,
  //     lastmodifieddate: this.utilServ.editData.lastmodifieddate,
  //     leavePlanCode: this.payrollForm.controls.leavePlanCode.value,
  //     onHoliday: this.payrollForm.controls.onHoliday.value,
  //     overtimeCode: this.payrollForm.controls.overtimeCode.value,
  //     payDayCalc: this.payrollForm.controls.payDayCalc.value,
  //     payrollCode: this.payrollForm.controls.payrollCode.value,
  //     probationCode: this.payrollForm.controls.probationCode.value,
  //     runPayrollAuto: this.payrollForm.controls.runPayrollAuto.value,
  //     salaryCalculationDate: this.payrollForm.controls.salaryCalculationDate.value,
  //     salaryFrequency: this.payrollForm.controls.salaryFrequency.value,
  //     salaryGeneratedDate: this.payrollForm.controls.salaryGeneratedDate.value,
  //     salaryType: this.payrollForm.controls.salaryType.value,
  //     salaryForPeriod: this.payrollForm.controls.ctcForPeriod.value,
  //     uom: this.payrollForm.controls.uom.value,
  //     weekendDeduction: this.payrollForm.controls.weekendDeduction.value,
  //     payrollComponents: payrollCompObj,
  //     payruleSetups: ruleObj
  //   }
  //   this.httpPutService
  //     .doPut('payrollsetup', JSON.stringify(obj))
  //     .subscribe((res: any) => {
  //       this.spinner.hide();
  //       if (res.status.message == 'SUCCESS') {
  //         if (this.modifyisDefaultRecord) {
  //           this.updateIsDefaultRecord();
  //         }
  //         Swal.fire({
  //           title: 'Success!',
  //           text: this.payrollForm.controls.payrollCode.value + ' Updated',
  //           icon: 'success',
  //           timer: 10000,
  //         }).then(() => {
  //           this.payrollForm.reset();
  //           this.utilServ.payrollSetupResBackup = [];
  //           this.back();
  //         });
  //       }
  //       else {
  //         Swal.fire({
  //           title: 'Error!',
  //           text: res.status.message,
  //           icon: 'warning',
  //           showConfirmButton: true,
  //         })
  //       }
  //     },
  //       err => {
  //         this.spinner.hide();
  //         Swal.fire({
  //           title: 'error!',
  //           text: err.error.status.message,
  //           icon: 'error',
  //           timer: 10000,
  //         })
  //       });
  // }
  // updatePayrollWithSalary() {
  //   this.spinner.show();
  //   const ruleObj = [], payrollCompObj = [];
  //   const payrollComponentList = this.payrollComponentForm;
  //   const payruleList = this.payruleSetupForm;
  //   const payrollComponentFormArray = payrollComponentList.get('payrollComponentFormArray') as FormArray;
  //   payrollComponentFormArray.controls.forEach((control: AbstractControl) => {
  //     payrollCompObj.push({
  //       approvedby: control.get('approvedby')?.value,
  //       approveddate: control.get('approveddate')?.value,
  //       buCode: control.get('buCode')?.value,
  //       componentCode: control.get('componentCode')?.value,
  //       componentType: control.get('componentType')?.value,
  //       createdby: control.get('createdby')?.value,
  //       createddate: control.get('createddate')?.value,
  //       id: control.get('id')?.value,
  //       includeInCtcCalc: control.get('includeInCtcCalc')?.value,
  //       includeInTotalSalCalc: control.get('includeInTotalSalCalc')?.value,
  //       isApproved: control.get('isApproved')?.value,
  //       isCommission: control.get('isCommission')?.value,
  //       isDeduction: control.get('isDeduction')?.value,
  //       isDeductionCompanyPayable: control.get('isDeductionCompanyPayable')?.value,
  //       isDeleted: control.get('isDeleted')?.value,
  //       isProrata: control.get('isProrata')?.value,
  //       isactive: control.get('isactive')?.value,
  //       isTaxable: control.get('isTaxable')?.value,
  //       lastmodifiedby: control.get('lastmodifiedby')?.value,
  //       lastmodifieddate: control.get('lastmodifieddate')?.value,
  //       maxLimitInYr: control.get('maxLimitInYr')?.value,
  //       payrollCode: control.get('payrollCode')?.value,
  //       sortOrder: control.get('sortOrder')?.value,
  //       tenantCode: control.get('tenantCode')?.value,
  //       timeframe: control.get('timeframe')?.value,
  //       xfrUnusedToAllowance: control.get('xfrUnusedToAllowance')?.value,
  //     })

  //   });
  //   const payrulesFArray = payruleList.get('payruleSetupFormArray') as FormArray;
  //   payrulesFArray.controls.forEach((control: AbstractControl) => {
  //     ruleObj.push({
  //       "ruleCode": control.get('ruleCode')?.value,
  //       "componentCode": control.get('componentCode')?.value,
  //       "parentComponentCode": control.get('parentComponentCode')?.value,
  //       "isConditional": control.get('isConditional')?.value,
  //       "comparator": control.get('comparator')?.value,
  //       "comparatorComponent": control.get('comparatorComponent')?.value,
  //       "param1Value": control.get('param1Value')?.value,
  //       "param2Value": control.get('param2Value')?.value,
  //       "calcType": control.get('calcType')?.value,
  //       isactive: control.get('isactive')?.value,
  //       "percentage": control.get('percentage')?.value,
  //       "fixedAmount": control.get('fixedAmount')?.value,
  //       "isApproved": control.get('isApproved')?.value,
  //       "approvedby": control.get('approvedby')?.value,
  //       "approveddate": control.get('approveddate')?.value,
  //       "buCode": control.get('buCode')?.value,
  //       "isDeleted": true,
  //       "createdby": control.get('createdby')?.value,
  //       "createddate": control.get('createddate')?.value,
  //       "lastmodifiedby": control.get('lastmodifiedby')?.value,
  //       "lastmodifieddate": control.get('lastmodifieddate')?.value,
  //       "payrollCode": control.get('payrollCode')?.value,
  //       "ruleId": control.get('ruleId')?.value,
  //       "tenantCode": control.get('tenantCode')?.value,
  //     })
  //   })
  //   const obj = {
  //     allowOvertime: this.payrollForm.controls.allowOvertime.value,
  //     approvedby: this.utilServ.editData.approvedby,
  //     approveddate: this.utilServ.editData.approveddate,
  //     branchCode: this.utilServ.editData.branchCode,
  //     companyCode: this.utilServ.editData.companyCode,
  //     createdby: this.utilServ.editData.createdby,
  //     createddate: this.utilServ.editData.createddate,
  //     excludeHolidays: this.payrollForm.controls.excludeHolidays.value,
  //     excludeWeekoffs: this.payrollForm.controls.excludeWeekoffs.value,
  //     hasProbation: this.payrollForm.controls.hasProbation.value,
  //     id: this.utilServ.editData.id,
  //     isApproved: this.utilServ.editData.isApproved,
  //     isDefault: this.payrollForm.controls.isDefault.value,
  //     lastmodifiedby: this.utilServ.editData.lastmodifiedby,
  //     lastmodifieddate: this.utilServ.editData.lastmodifieddate,
  //     leavePlanCode: this.payrollForm.controls.leavePlanCode.value,
  //     onHoliday: this.payrollForm.controls.onHoliday.value,
  //     overtimeCode: this.payrollForm.controls.overtimeCode.value,
  //     payDayCalc: this.payrollForm.controls.payDayCalc.value,
  //     payrollCode: this.payrollForm.controls.payrollCode.value,
  //     probationCode: this.payrollForm.controls.probationCode.value,
  //     runPayrollAuto: this.payrollForm.controls.runPayrollAuto.value,
  //     salaryCalculationDate: this.payrollForm.controls.salaryCalculationDate.value,
  //     salaryFrequency: this.payrollForm.controls.salaryFrequency.value,
  //     salaryGeneratedDate: this.payrollForm.controls.salaryGeneratedDate.value,
  //     salaryType: this.payrollForm.controls.salaryType.value,
  //     salaryForPeriod: this.payrollForm.controls.ctcForPeriod.value,
  //     uom: this.payrollForm.controls.uom.value,
  //     weekendDeduction: this.payrollForm.controls.weekendDeduction.value,
  //     payrollComponents: payrollCompObj,
  //     payruleSetups: ruleObj
  //   }
  //   this.httpPutService
  //     .doPut('payrollsetup', JSON.stringify(obj))
  //     .subscribe((res: any) => {
  //       this.spinner.hide();
  //       if (res.status.message == 'SUCCESS') {
  //         if (this.modifyisDefaultRecord) {
  //           this.updateIsDefaultRecord();
  //         }
  //         Swal.fire({
  //           title: 'Success!',
  //           text: this.payrollForm.controls.payrollCode.value + ' Updated',
  //           icon: 'success',
  //           timer: 10000,
  //         }).then(() => {
  //           this.payrollForm.reset();
  //           this.utilServ.payrollSetupResBackup = [];
  //           this.back();
  //         });
  //       }
  //       else {
  //         Swal.fire({
  //           title: 'Error!',
  //           text: res.status.message,
  //           icon: 'warning',
  //           showConfirmButton: true,
  //         })
  //       }
  //     },
  //       err => {
  //         this.spinner.hide();
  //         Swal.fire({
  //           title: 'error!',
  //           text: err.error.status.message,
  //           icon: 'error',
  //           timer: 10000,
  //         })
  //       });
  // }




 
