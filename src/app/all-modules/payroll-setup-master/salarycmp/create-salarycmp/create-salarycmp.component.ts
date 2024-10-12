import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { CreatePayrulesSetupComponent } from '../../payrules-setup/create-payrules-setup/create-payrules-setup.component';

@Component({
  selector: 'app-create-salarycmp',
  templateUrl: './create-salarycmp.component.html',
  styleUrls: ['./create-salarycmp.component.scss']
})
export class CreateSalarycmpComponent implements OnInit, OnDestroy {
  className = 'CreateSalarycmpComponent';
  salaryStructureForm: FormGroup;
  payrollsetups = [];
  update = false;
  view = false;
  active = false;
  charLimit: number;
  labels = [];
  rulesList: any;
  salaryComponentisDeduction = false;

  componentType = ['Recurring', 'Recurring-Conditonal', 'Adhoc'];
  timeframe = [
    { code: 'default', name: 'as per salary cycle' },
    { code: 'daily', name: 'daily' },
  ];
  constructor(
    private fb: FormBuilder,
    private httpGetService: HttpGetService,
    private httpPost: HttpPostService,
    private router: Router,
    private modalService: NgbModal,

    private globalServ: GlobalvariablesService,
    private utilServ: UtilService,
    private httpPut: HttpPutService,
    private spinner: NgxSpinnerService
  ) { }
  deduction() {
    if (this.salaryStructureForm.controls.isDeduction.value == true) {
      this.salaryStructureForm.controls.isTaxable.setValue(false);
      this.salaryStructureForm.controls.isTaxable.disable();
      this.salaryStructureForm.controls.isDeductionCompanyPayable.enable();
    } else {
      this.salaryStructureForm.controls.isDeductionCompanyPayable.setValue(false);
      this.salaryStructureForm.controls.isDeductionCompanyPayable.disable();
      this.salaryStructureForm.controls.isTaxable.enable();
    }
  }
  maxLimitInYrQuestions() {
    if (this.salaryStructureForm.controls.maxLimitInYrQuestion.value == true) {
      // this.salaryStructureForm.controls.maxLimitInYr.setValue(null);
      if (!this.utilServ.editData || !this.utilServ.viewData) {
        this.salaryStructureForm.controls.xfrUnusedToAllowance.setValue(true);
      }
      if (this.view) {
        this.salaryStructureForm.controls.maxLimitInYr.disable();
        this.salaryStructureForm.controls.xfrUnusedToAllowance.disable();
      } else {
        this.salaryStructureForm.controls.xfrUnusedToAllowance.enable();
        this.salaryStructureForm.controls.maxLimitInYr.enable();

      }
    } else {
      this.salaryStructureForm.controls.maxLimitInYr.setValue(null);
      this.salaryStructureForm.controls.maxLimitInYr.disable();
      this.salaryStructureForm.controls.xfrUnusedToAllowance.setValue(false);
      this.salaryStructureForm.controls.xfrUnusedToAllowance.disable();
    }
  }
  addRules() {
    if (this.salaryStructureForm.controls.componentCode.value) {
      const data = {
        prop1: this.salaryStructureForm.controls.componentCode.value,
        prop2: this.className,
        prop3: this.rulesList
      };
      const modalRef = this.modalService.open(CreatePayrulesSetupComponent, {
        // disableClose: true,
        // hasBackdrop: true,
        scrollable: true,
        windowClass: 'myCustomModalClass',
        size: 'xl',
        backdrop: 'static',
      });
      modalRef.componentInstance.fromParent = data;
      modalRef.result.then(
        (result) => {
          this.rulesList = [];
          this.rulesList = result;
          if (this.rulesList.array.length > 0) {
            this.rulesList.array.forEach(element => {
              element.componentCode = this.salaryStructureForm.controls.componentCode.value
            });
          }
        },
      );
    } else {
      Swal.fire({
        icon: 'info',
        text: 'Please enter Component Name',
        showConfirmButton: true,
        // timer: 1500,
      });
    }
  }
  salaryLabels() {
    this.spinner.show();
    this.globalServ.getLabels('salaryComponent').subscribe((res: any) => {
      this.labels = res.response;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      console.error(err.error.status.message);
    });
  }

  ngOnInit() {
    // this.salaryLabels();
    this.salaryStructureForm = this.fb.group({
      componentCode: [null, [Validators.required, this.httpPost.customValidator()]],
      componentType: [null, Validators.required],
      payrollCode: [null],
      isTaxable: [false],
      "timeframe": ['default'],

      calcBasedOn: null,
      excludeWeekends: false,
      excludeHolidays: false,

      maxLimitInYrQuestion: false,
      "maxLimitInYr": null,
      includeInTotalSalCalc: [true],
      includeInCtcCalc: [true],
      isDeduction: [false],
      isDerived: [true],
      isProrata: [false],


      followsSalaryFrequency: false,
      runsEvery: null,

      isCommission: [false],
      "xfrUnusedToAllowance": false,
      isDeductionCompanyPayable: [false],
      isApproved: [false],
      isactive: true,
    })
    // this.getPayrollCodes();
    if (!this.utilServ.viewData || !this.utilServ.editData) {
      this.salaryStructureForm.controls.componentType.setValue('Recurring');
      this.salaryStructureForm.controls.timeframe.setValue('default');
      this.maxLimitInYrQuestions();
      this.deduction();
    }
    this.init();
    this.charLimit = this.globalServ.charLimitValue;
  }

  init() {
    if (this.utilServ.editData) {
      this.update = true;
      this.view = false;
      this.salaryStructureForm.enable();
      this.salaryStructureForm.controls.componentCode.setValue(this.utilServ.editData.payrollComponent.componentCode);
      this.salaryStructureForm.controls.componentType.setValue(this.utilServ.editData.payrollComponent.componentType);
      this.salaryStructureForm.controls.payrollCode.setValue(this.utilServ.editData.payrollComponent.payrollCode);
      this.salaryStructureForm.controls.isTaxable.setValue(this.utilServ.editData.payrollComponent.isTaxable);
      this.salaryStructureForm.controls.isDeduction.setValue(this.utilServ.editData.payrollComponent.isDeduction);
      this.salaryStructureForm.controls.isDerived.setValue(this.utilServ.editData.payrollComponent.isDerived);
      this.salaryStructureForm.controls.includeInTotalSalCalc.setValue(this.utilServ.editData.payrollComponent.includeInTotalSalCalc);
      this.salaryStructureForm.controls.includeInCtcCalc.setValue(this.utilServ.editData.payrollComponent.includeInCtcCalc);
      this.salaryStructureForm.controls.isProrata.setValue(this.utilServ.editData.payrollComponent.isProrata);
      this.salaryStructureForm.controls.isCommission.setValue(this.utilServ.editData.payrollComponent.isCommission);
      this.salaryStructureForm.controls.isDeductionCompanyPayable.setValue(this.utilServ.editData.payrollComponent.isDeductionCompanyPayable);
      this.salaryStructureForm.controls.isApproved.setValue(this.utilServ.editData.payrollComponent.isApproved);
      this.salaryStructureForm.controls.timeframe.setValue(this.utilServ.editData.payrollComponent.timeframe);
      this.salaryStructureForm.controls.maxLimitInYr.setValue(this.utilServ.editData.payrollComponent.maxLimitInYr);
      this.salaryStructureForm.controls.xfrUnusedToAllowance.setValue(this.utilServ.editData.payrollComponent.xfrUnusedToAllowance);
      this.salaryStructureForm.controls.isactive.setValue(this.utilServ.editData.payrollComponent.isactive);
      this.salaryStructureForm.controls.componentCode.disable();
      if (this.salaryStructureForm.controls.maxLimitInYr.value !== null) {
        this.salaryStructureForm.controls.maxLimitInYrQuestion.setValue(true);
        this.maxLimitInYrQuestions();
      } else {
        this.salaryStructureForm.controls.maxLimitInYrQuestion.setValue(false);
        this.maxLimitInYrQuestions();
      }
      if (this.utilServ.editData.payRules.length > 1) {
        this.rulesList = {
          array: (this.utilServ.editData.payRules),
          form: {
            calcType: null,
            fixedAmount: null,
            isConditional: true,
            payruleSetupFormArray: this.utilServ.editData.payRules,
            percentage: undefined,

          }
        }
      } else {
        if (this.utilServ.editData.payRules[0]?.isConditional === true) {
          this.rulesList = {
            array: (this.utilServ.editData.payRules),
            form: {
              calcType: null,
              fixedAmount: null,
              isConditional: true,
              payruleSetupFormArray: this.utilServ.editData.payRules,
              percentage: undefined,
            }
          }
        } else {
          this.rulesList = {
            array: [],
            form: {
            calcType: this.utilServ.editData.payRules[0]?.calcType,
            fixedAmount: this.utilServ.editData.payRules[0]?.fixedAmount,
            isConditional: this.utilServ.editData.payRules[0]?.isConditional,
            payruleSetupFormArray: this.utilServ.editData.payRules,
            percentage: this.utilServ.editData.payRules[0]?.percentage,
            "ruleId": this.utilServ.editData.payRules[0]?.ruleId,
            "ruleCode": this.utilServ.editData.payRules[0]?.ruleCode,
            "payrollCode": this.utilServ.editData.payRules[0]?.payrollCode,
            "componentCode": this.utilServ.editData.payRules[0]?.componentCode,
            "parentComponentCode": this.utilServ.editData.payRules[0]?.parentComponentCode,
            "comparator": this.utilServ.editData.payRules[0]?.comparator,
            "comparatorComponent": this.utilServ.editData.payRules[0]?.comparatorComponent,
            "param1Value": this.utilServ.editData.payRules[0]?.param1Value,
            "param2Value": this.utilServ.editData.payRules[0]?.param2Value,
            "isactive": this.utilServ.editData.payRules[0]?.isactive,
            "isApproved": this.utilServ.editData.payRules[0]?.isApproved,
            "buCode": this.utilServ.editData.payRules[0]?.buCode,
            "tenantCode": this.utilServ.editData.payRules[0]?.tenantCode,
            "createdby": this.utilServ.editData.payRules[0]?.createdby,
            "createddate": this.utilServ.editData.payRules[0]?.createddate,
            "lastmodifiedby": this.utilServ.editData.payRules[0]?.lastmodifiedby,
            "lastmodifieddate": this.utilServ.editData.payRules[0]?.lastmodifieddate,
            "approvedby": this.utilServ.editData.payRules[0]?.approvedby,
            "approveddate": this.utilServ.editData.payRules[0]?.approveddate,
            "isDeleted": this.utilServ.editData.payRules[0]?.isDeleted,
          }
        }
      }
      }
      // this.utilServ.editData.payRules.forEach(element => {
      //   this.rulesList.push(element)
      // });
    }
    else if (this.utilServ.viewData) {
      this.update = false;
      this.view = true;
      this.salaryStructureForm.disable();
      this.salaryStructureForm.controls.componentCode.setValue(this.utilServ.viewData.payrollComponent.componentCode);
      this.salaryStructureForm.controls.componentType.setValue(this.utilServ.viewData.payrollComponent.componentType);
      this.salaryStructureForm.controls.payrollCode.setValue(this.utilServ.viewData.payrollComponent.payrollCode);
      this.salaryStructureForm.controls.isTaxable.setValue(this.utilServ.viewData.payrollComponent.isTaxable);
      this.salaryStructureForm.controls.isDeduction.setValue(this.utilServ.viewData.payrollComponent.isDeduction);
      this.salaryStructureForm.controls.isDerived.setValue(this.utilServ.viewData.payrollComponent.isDerived);
      this.salaryStructureForm.controls.includeInTotalSalCalc.setValue(this.utilServ.viewData.payrollComponent.includeInTotalSalCalc);
      this.salaryStructureForm.controls.includeInCtcCalc.setValue(this.utilServ.viewData.payrollComponent.includeInCtcCalc);
      this.salaryStructureForm.controls.isProrata.setValue(this.utilServ.viewData.payrollComponent.isProrata);
      this.salaryStructureForm.controls.isCommission.setValue(this.utilServ.viewData.payrollComponent.isCommission);
      this.salaryStructureForm.controls.isDeductionCompanyPayable.setValue(this.utilServ.viewData.payrollComponent.isDeductionCompanyPayable);
      this.salaryStructureForm.controls.isApproved.setValue(this.utilServ.viewData.payrollComponent.isApproved);
      this.salaryStructureForm.controls.timeframe.setValue(this.utilServ.viewData.payrollComponent.timeframe);
      this.salaryStructureForm.controls.maxLimitInYr.setValue(this.utilServ.viewData.payrollComponent.maxLimitInYr);
      this.salaryStructureForm.controls.isactive.setValue(this.utilServ.viewData.payrollComponent.isactive);

      this.salaryStructureForm.controls.xfrUnusedToAllowance.setValue(this.utilServ.viewData.payrollComponent.xfrUnusedToAllowance);
      if (this.salaryStructureForm.controls.maxLimitInYr.value !== null) {
        this.salaryStructureForm.controls.maxLimitInYrQuestion.setValue(true);
        this.maxLimitInYrQuestions();
      } else {
        this.salaryStructureForm.controls.maxLimitInYrQuestion.setValue(false);
        this.maxLimitInYrQuestions();
      }
      if (this.utilServ.viewData.payRules.length > 1) {
        this.rulesList = {
          array: (this.utilServ.viewData.payRules),
          form: {
            calcType: null,
            fixedAmount: null,
            isConditional: true,
            payruleSetupFormArray: this.utilServ.viewData.payRules,
            percentage: undefined,
          }
        }
      } else {
        if (this.utilServ.viewData.payRules[0]?.isConditional === true) {
          this.rulesList = {
            array: (this.utilServ.viewData.payRules),
            form: {
              calcType: null,
              fixedAmount: null,
              isConditional: true,
              payruleSetupFormArray: this.utilServ.viewData.payRules,
              percentage: undefined,
            }
          }
        } else {
          this.rulesList = {
            array: [],
            form: {
              calcType: this.utilServ.viewData.payRules[0]?.calcType,
              fixedAmount: this.utilServ.viewData.payRules[0]?.fixedAmount,
              isConditional: this.utilServ.viewData.payRules[0]?.isConditional,
              payruleSetupFormArray: this.utilServ.viewData.payRules,
              percentage: this.utilServ.viewData.payRules[0]?.percentage,
              "ruleId": this.utilServ.viewData.payRules[0]?.ruleId,
              "ruleCode": this.utilServ.viewData.payRules[0]?.ruleCode,
              "payrollCode": this.utilServ.viewData.payRules[0]?.payrollCode,
              "componentCode": this.utilServ.viewData.payRules[0]?.componentCode,
              "parentComponentCode": this.utilServ.viewData.payRules[0]?.parentComponentCode,
              "comparator": this.utilServ.viewData.payRules[0]?.comparator,
              "comparatorComponent": this.utilServ.viewData.payRules[0]?.comparatorComponent,
              "param1Value": this.utilServ.viewData.payRules[0]?.param1Value,
              "param2Value": this.utilServ.viewData.payRules[0]?.param2Value,
              "isactive": this.utilServ.viewData.payRules[0]?.isactive,
              "isApproved": this.utilServ.viewData.payRules[0]?.isApproved,
              "buCode": this.utilServ.viewData.payRules[0]?.buCode,
              "tenantCode": this.utilServ.viewData.payRules[0]?.tenantCode,
              "createdby": this.utilServ.viewData.payRules[0]?.createdby,
              "createddate": this.utilServ.viewData.payRules[0]?.createddate,
              "lastmodifiedby": this.utilServ.viewData.payRules[0]?.lastmodifiedby,
              "lastmodifieddate": this.utilServ.viewData.payRules[0]?.lastmodifieddate,
              "approvedby": this.utilServ.viewData.payRules[0]?.approvedby,
              "approveddate": this.utilServ.viewData.payRules[0]?.approveddate,
              "isDeleted": this.utilServ.viewData.payRules[0]?.isDeleted,
            }
          }
        }
      }
    }
  }
  // getPayrollCodes() {
  //   this.httpGetService.getMasterList('payrollsetups').subscribe(
  //     (res: any) => {
  //       this.payrollsetups = res.response;
  //       if (!this.utilServ.viewData || !this.utilServ.editData) {
  //         const hasDefault = res.response.find(x => x.isDefault == true)
  //         if (hasDefault) {
  //           this.salaryStructureForm.controls.payrollCode.setValue(hasDefault.payrollCode)
  //         }
  //         else {
  //           this.salaryStructureForm.controls.payrollCode.setValue(res.response[0].payrollCode)
  //         }
  //       }
  //     },
  //     (err) => {
  //       console.error(err.error.status.message);
  //     }
  //   );
  // }

  getLabelDescription(divId: string): string {
    const label = this.labels.find(item => item.colCode === divId);
    return label ? label.labelDescription : '';
  }

  hasInteger(colCode: string): boolean {
    const label = this.labels.find(item => item.colCode === colCode);
    return label?.labelDescription.includes('{integer}');
  }
  splitLabelDescription(colCode: string): { before: string, after: string } {
    const label = this.labels.find(item => item.colCode === colCode);
    const parts = label.labelDescription.split('{integer}');
    return {
      before: parts[0] || '',
      after: parts[1] || ''
    };
  }

  cancel() {
    this.router.navigateByUrl('payrollsetup/salaryStructure')
  }
  submit() {
    this.salaryStructureForm.get('componentCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.salaryStructureForm.controls.componentCode.value), { emitEvent: false });
    const salaryObj = {
      componentCode: this.salaryStructureForm.controls.componentCode.value.trim(),
      componentType: this.salaryStructureForm.controls.componentType.value,
      payrollCode: this.salaryStructureForm.controls.payrollCode.value,
      isTaxable: this.salaryStructureForm.controls.isTaxable.value == null ? false : this.salaryStructureForm.controls.isTaxable.value,
      isDeduction: this.salaryStructureForm.controls.isDeduction.value == null ? false : this.salaryStructureForm.controls.isDeduction.value,
      isDerived: this.salaryStructureForm.controls.isDerived.value == null ? false : this.salaryStructureForm.controls.isDerived.value,
      maxLimitInYrQuestion: this.salaryStructureForm.controls.maxLimitInYrQuestion.value,
      includeInTotalSalCalc: this.salaryStructureForm.controls.includeInTotalSalCalc.value == null ? false : this.salaryStructureForm.controls.includeInTotalSalCalc.value,
      includeInCtcCalc: this.salaryStructureForm.controls.includeInCtcCalc.value,
      isInternal: false,
      isProrata: this.salaryStructureForm.controls.isProrata.value == null ? false : this.salaryStructureForm.controls.isProrata.value,
      isCommission: this.salaryStructureForm.controls.isCommission.value == null ? false : this.salaryStructureForm.controls.isCommission.value,
      isDeductionCompanyPayable: this.salaryStructureForm.controls.isDeductionCompanyPayable.value == null ? false : this.salaryStructureForm.controls.isDeductionCompanyPayable.value,
      isApproved: this.salaryStructureForm.controls.isApproved.value,
      "timeframe": this.salaryStructureForm.controls.timeframe.value,
      isactive: this.salaryStructureForm.controls.isactive.value,
      "maxLimitInYr": this.salaryStructureForm.controls.maxLimitInYr.value,
      "xfrUnusedToAllowance": this.salaryStructureForm.controls.xfrUnusedToAllowance.value == null ? false : this.salaryStructureForm.controls.xfrUnusedToAllowance.value,
    }
    let rule = [];
    if (this.rulesList?.form.isConditional == true) {
      if (this.rulesList?.array.length >= 1) {
        this.rulesList?.array.forEach((item, index) => {
          // Update the ruleCode property
          item.ruleCode = `${this.salaryStructureForm.controls.componentCode.value}_rc_${index + 1}`,
          item.isConditional = true;
          item.sortOrder = index + 1
          item.componentCode = this.salaryStructureForm.controls.componentCode.value;
        });
      }
    }
    else {
      rule = [{
        "ruleCode": `${this.salaryStructureForm.controls.componentCode.value}_rc1`,
        componentCode: this.salaryStructureForm.controls.componentCode.value,
        parentComponentCode: this.rulesList?.form.parentComponentCode,
        isConditional: false,
        comparator: null,
        comparatorComponent: null,
        payrollCode: null,
        param1Value: null,
        param2Value: null,
        sortOrder: 1,
        calcType: this.rulesList?.form.calcType,
        percentage: this.rulesList?.form.calcType == 'pct' ? this.rulesList?.form.percentage : null,
        fixedAmount: this.rulesList?.form.calcType == 'fixed' ? this.rulesList?.form.fixedAmount : null,
        isApproved: null,
        approvedby: null,
        approveddate: null,
        isactive: true,
        "buCode": null,
        "createdby": null,
        "createddate": null,
        "lastmodifiedby": null,
        "lastmodifieddate": null,
        "ruleId": null,
        "tenantCode": null,
      }]
    }
    const obj = {
      payrollComponent: [salaryObj],
      payRules: this.rulesList?.form.isConditional == true ? this.rulesList?.array : rule
    }
    if (this.rulesList) {
      this.spinner.show();
      this.httpPost.create('salarycomponentsetup', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: 'Components Created',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.utilServ.salaryComponents = [];
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
          console.error(err.error);
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        }
      );
    } else {
      this.spinner.hide();
      Swal.fire({
        title: 'Info',
        text: 'Add some Rules',
        icon: 'info',
      });
    }
  }
  Update() {
    let rule = [];
    this.salaryStructureForm.get('componentCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.salaryStructureForm.controls.componentCode.value), { emitEvent: false });
    this.spinner.show();
    const salaryObj = {
      "id": this.utilServ.editData.payrollComponent.id,
      "componentCode": this.salaryStructureForm.controls.componentCode.value,
      componentType: this.salaryStructureForm.controls.componentType.value,
      "payrollCode": this.salaryStructureForm.controls.payrollCode.value,
      timeframe: this.salaryStructureForm.controls.timeframe.value,
      maxLimitInYr: this.salaryStructureForm.controls.maxLimitInYr.value,
      xfrUnusedToAllowance: this.salaryStructureForm.controls.xfrUnusedToAllowance.value,
      "isTaxable": this.salaryStructureForm.controls.isTaxable.value,
      includeInTotalSalCalc: this.salaryStructureForm.controls.includeInTotalSalCalc.value,
      includeInCtcCalc: this.salaryStructureForm.controls.includeInCtcCalc.value,
      "isDeduction": this.salaryStructureForm.controls.isDeduction.value,
      "isDerived": this.salaryStructureForm.controls.isDerived.value,
      "isProrata": this.salaryStructureForm.controls.isProrata.value,
      "isCommission": this.salaryStructureForm.controls.isCommission.value,
      "isDeductionCompanyPayable": this.salaryStructureForm.controls.isDeductionCompanyPayable.value,
      "isApproved": this.salaryStructureForm.controls.isApproved.value,
      "buCode": this.utilServ.editData.payrollComponent.buCode,
      "tenantCode": this.utilServ.editData.payrollComponent.tenantCode,
      "createdby": this.utilServ.editData.payrollComponent.createdby,
      "createddate": this.utilServ.editData.payrollComponent.createddate,
      isInternal: this.utilServ.editData.payrollComponent.isInternal,
      isactive: this.salaryStructureForm.controls.isactive.value,
      "lastmodifiedby": this.utilServ.editData.payrollComponent.lastmodifiedby,
      "lastmodifieddate": this.utilServ.editData.payrollComponent.lastmodifieddate,
      "approvedby": this.utilServ.editData.payrollComponent.approvedby,
      "approveddate": this.utilServ.editData.payrollComponent.approveddate,

      calcBasenOn: this.utilServ.editData.payrollComponent.apprcalcBasenOnoveddate,
      excludeHolidays: this.utilServ.editData.payrollComponent.excludeHolidays,
      excludeWeekends: this.utilServ.editData.payrollComponent.excludeWeekends,
      followsSalaryFrequency: this.utilServ.editData.payrollComponent.followsSalaryFrequency,
      hasRules: this.utilServ.editData.payrollComponent.hasRules,
      sortOrder: this.utilServ.editData.payrollComponent.sortOrder,
    }
    if (this.rulesList?.form.isConditional == true) {
      if (this.rulesList?.array.length >= 1) {
        this.rulesList?.array.forEach((item, index) => {
          // Update the ruleCode property
          item.ruleCode = `${this.salaryStructureForm.controls.componentCode.value}_rc${index + 1}`,
          item.isConditional = true;
          item.sortOrder = item + 1;
          item.componentCode = this.salaryStructureForm.controls.componentCode.value;

        });
      }
    }
    else {
      rule = [{
        ruleCode: `${this.salaryStructureForm.controls.componentCode.value}_rc1`,
        componentCode: this.salaryStructureForm.controls.componentCode.value,
        parentComponentCode: this.rulesList?.form.parentComponentCode,
        isConditional: false,
        comparator: this.rulesList?.form.comparator,
        comparatorComponent: this.rulesList?.form.comparatorComponent,
        payrollCode: this.rulesList?.form.payrollCode,
        param1Value: this.rulesList?.form.param1Value,
        param2Value: this.rulesList?.form.param2Value,
        calcType: this.rulesList?.form.calcType,
        percentage: this.rulesList?.form.calcType == 'pct' ? this.rulesList?.form.percentage : null,
        fixedAmount: this.rulesList?.form.calcType == 'fixed' ? this.rulesList?.form.fixedAmount : null,
        isApproved: this.utilServ.editData.payRules[0]?.isApproved,
        approvedby: this.utilServ.editData.payRules[0]?.approvedby,
        approveddate: this.utilServ.editData.payRules[0]?.approveddate,
        // sortOrder: this.rulesList?.form.sortOrder,
        isactive: this.rulesList?.form.isactive,
        "buCode": this.utilServ.editData.payRules[0]?.buCode,
        "createdby": this.utilServ.editData.payRules[0]?.createdby,
        "createddate": this.utilServ.editData.payRules[0]?.createddate,
        "lastmodifiedby": this.utilServ.editData.payRules[0]?.lastmodifiedby,
        "lastmodifieddate": this.utilServ.editData.payRules[0]?.lastmodifieddate,
        "ruleId": this.utilServ.editData.payRules[0]?.ruleId,
        "tenantCode": this.utilServ.editData.payRules[0]?.tenantCode,
      }]
    }
    const obj = {
      payrollComponent: [salaryObj],
      payRules: this.rulesList?.form.isConditional == true ? this.rulesList?.array : rule
    }
    this.httpPut.doPut('salarycomponentsetup', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Components Updated',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.cancel();
          this.utilServ.salaryComponents = [];
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
        console.error(err.error);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    )
  }

  onDeductionCheckBoxChanged(evt) {
    this.salaryComponentisDeduction = evt.target.checked
  }
  ngOnDestroy() {
    this.rulesList = null;
    this.utilServ.viewData = null;
    this.utilServ.editData = null;
  }
}
