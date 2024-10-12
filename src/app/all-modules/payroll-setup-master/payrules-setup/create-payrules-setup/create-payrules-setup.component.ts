import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-payrules-setup',
  templateUrl: './create-payrules-setup.component.html',
  styleUrls: ['./create-payrules-setup.component.scss']
})
export class CreatePayrulesSetupComponent implements OnInit {
  @Input() public fromParent;
  payruleSetupForm: FormGroup;
  salaryMasterList = [];
  payrollsetups = [];
  filteredSalaryList = [];
  active = false;
  charLimit: number;
  update = false;
  view = false;
  stepRules = 0;
  setStepRules(index: number) {
    this.stepRules = index;
  }
  parentMaster = [
    { code: 'Total Salary', name: 'Total Salary' },
    { code: 'Basic Salary', name: 'Basic Salary' },
  ];
  comparatorsList = [
    { code: 'GT', name: 'Greater than' },
    { code: 'GTE', name: 'Greater than or Equals to' },
    { code: 'LT', name: 'Lower than' },
    { code: 'LTE', name: 'Lower than or Equals to' },
    { code: 'BETWEEN', name: 'Between' },
  ];
  calcTypes = [
    { code: 'pct', name: 'Percentage' },
    { code: 'fixed', name: 'Fixed' },
    { code: 'remainder', name: 'Remainder' },
  ];
  labels = [];
  constructor(private fb: FormBuilder,
    private httpPost: HttpPostService,
    public activeModal: NgbActiveModal,

    private httpGet: HttpGetService,
    private router: Router,
    private globalServ: GlobalvariablesService,
    private utilServ: UtilService,
    private spinner: NgxSpinnerService,
    private httpPut: HttpPutService
  ) {

    this.payruleSetupForm = this.fb.group({
      isConditional: false,
      calcType: [null, Validators.required],
      parentComponentCode: null,
      percentage: [null],
      fixedAmount: [null],
      payruleSetupFormArray: this.fb.array([]),
    });
  }

  cancel() {
    this.activeModal.close(this.fromParent.prop3);
  }
  getSalaryMaster() {
    this.httpGet.getMasterList('salarycomponents/active').subscribe((res: any) => {
      const salaryMasterList = res.response;
      this.salaryMasterList = salaryMasterList.filter(c => !this.utilServ.theseComponentsShouldBeHiden.includes(c.componentCode));
      if (this.utilServ.viewData) {
        this.onPayrollcodeChange(this.utilServ.viewData.payrollCode)
      } else if (this.utilServ.editData) {
        this.onPayrollcodeChange(this.utilServ.editData.payrollCode)
      }
    },
      (err) => {
        console.error(err.error.status.message);
      })
  }

  payrulesLabels() {
    this.spinner.show();
    this.globalServ.getLabels('payrulesForm').subscribe((res: any) => {
      this.labels = res.response;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      console.error(err.error.status.message);
    });
  }
  getLabelDescription(divId: string): string {
    const label = this.labels?.find(item => item.colCode === divId);
    return label ? label.labelDescription : '';
  }
  ngOnInit() {

    // this.payrulesLabels();
    // this.payrulesForm = this.fb.group({
    //   ruleCode: [null],
    //   payrollCode: [null],
    //   componentCode: [null, Validators.required],
    //   parentComponentCode: [""],
    //   isConditional: [false],
    //   comparator: [""],
    //   comparatorComponent: [""],
    //   param1Value: [null],
    //   param2Value: [null],
    //   calcType: [null],
    //   percentage: [null],
    //   fixedAmount: [null],
    //   isactive: true,
    //   isApproved: [false],
    // })
    this.charLimit = this.globalServ.charLimitValue;
    this.init();
    this.getSalaryMaster();
  }

  init() {
    // if (this.fromParent.prop3.isConditional !== true) {
    this.payruleSetupForm.controls.calcType.setValue(this.fromParent.prop3?.form.calcType);
    this.payruleSetupForm.controls.isConditional.setValue(this.fromParent.prop3?.form.isConditional);
    this.payruleSetupForm.controls.fixedAmount.setValue(this.fromParent.prop3?.form.fixedAmount);
    this.payruleSetupForm.controls.percentage.setValue(this.fromParent.prop3?.form.percentage);
    this.payruleSetupForm.controls.parentComponentCode.setValue(this.fromParent.prop3?.form.parentComponentCode);
    //  }
    this.fromParent.prop3?.array?.forEach(element => {
      (this.payruleSetupForm.get('payruleSetupFormArray') as FormArray).controls.push(
        this.fb.group({
          ruleCode: element.ruleCode,
          componentCode: this.fromParent.prop1,
          parentComponentCode: element.parentComponentCode,
          isConditional: element.isConditional,
          comparator: element.comparator,
          comparatorComponent: element.comparatorComponent,
          param1Value: element.param1Value,
          param2Value: element.param2Value,
          calcType: element.calcType,
          percentage: element.percentage,
          fixedAmount: element.fixedAmount,
          isApproved: element.isApproved,
          approvedby: element.approvedby,
          approveddate: element.approveddate,
          buCode: element.buCode,
          isDeleted: false,
          isactive: element.isactive,
          createdby: element.createdby,
          createddate: element.createddate,
          lastmodifiedby: element.lastmodifiedby,
          lastmodifieddate: element.lastmodifieddate,
          payrollCode: element.payrollCode,
          ruleId: element.ruleId,
          tenantCode: element.tenantCode,
        }))
    })

  }

  // cancel() {
  //   this.router.navigateByUrl('payrollsetup/rule_setup')
  // }
  onPayrollcodeChange(val) {
    this.filteredSalaryList = this.salaryMasterList.filter((x) => {
      return x.payrollCode == val
    })
  }
  checkCondition(val) {
    if (val === true) {
      const length = this.PayruleSetupItems().value.length;
      if (length < 1) {
        this.addPayruleSetupItem();
      }
    }
    else {
      const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
      payrullArray.controls.forEach((control: AbstractControl, i) => {
        this.removePayruleSetupItem(i);
      })
    }
  }

  PayruleSetupItems(): FormArray {
    return this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
  }
  setValidationsInArray(row) {
    if (row.controls.calcType.value == 'pct') {
      row.get('percentage').setValidators([Validators.required]);
      row.get('parentComponentCode').setValidators([Validators.required]);
      row.get('fixedAmount').clearValidators();
      row.get('fixedAmount').setValue(null);
    }
    else {
      row.get('fixedAmount').setValidators([Validators.required]);
      row.get('percentage').clearValidators();
      row.get('parentComponentCode').clearValidators();
      row.get('parentComponentCode').setValue(null);
      row.get('percentage').setValue(null);
    }
    if (row.controls.calcType.value == 'pct') {
      row.get('percentage').setValidators([Validators.required]);
      row.get('parentComponentCode').setValidators([Validators.required]);
      row.get('fixedAmount').clearValidators();
      row.get('fixedAmount').setValue(null);
    }
    // row.controls
  }

  addPayruleSetupItem() {
    // this.setValidationsInArray(row)
    const length = this.PayruleSetupItems().value.length;
    const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
    payrullArray.controls.forEach((control: AbstractControl, i) => {
      control.get('ruleCode')?.setValue(`${this.fromParent.prop1}_rc${i + 1}`);
    })
    if (payrullArray.status == 'INVALID') {
      payrullArray.controls.forEach((formGroup) => {
        Object.values(formGroup['controls']).forEach((control: AbstractControl) => {
          control.markAsTouched();
        });
      });
      return;
    } else {
      if (length > 0) {
        const isEmpty =
          this.PayruleSetupItems().value[length - 1].ruleCode.length == 0;
        if (!isEmpty) {
          this.PayruleSetupItems().push(this.payruleSetupFormArray());
        }
      } else {
        this.PayruleSetupItems().push(this.payruleSetupFormArray());
        const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
        payrullArray.controls.forEach((control: AbstractControl, i) => {

          control.get('ruleCode')?.setValue(`${this.fromParent.prop1}_rc${i + 1}`);
          control.get('calcType')?.setValue(this.payruleSetupForm.controls.calcType.value);
          control.get('parentComponentCode')?.setValue(this.payruleSetupForm.controls.parentComponentCode.value);
          control.get('fixedAmount')?.setValue(this.payruleSetupForm.controls.fixedAmount.value);
          control.get('percentage')?.setValue(this.payruleSetupForm.controls.percentage.value);
        })
        // this.PayruleSetupItems().value[length].ruleCode = `${this.fromParent.prop1}_rc${length + 1}`;
        // this.PayruleSetupItems().value[length].parentComponentCode = this.payruleSetupForm.controls.parentComponentCode.value;
        // this.PayruleSetupItems().value[length].calcType = this.payruleSetupForm.controls.calcType.value;
        // this.PayruleSetupItems().value[length].percentage = this.payruleSetupForm.controls.percentage.value;
        // this.PayruleSetupItems().value[length].fixedAmount = this.payruleSetupForm.controls.fixedAmount.value;

        // const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
        // payrullArray.controls.forEach((control: AbstractControl, i) => {
        //   control.get('ruleCode')?.setValue(`${this.fromParent.prop1}_rc${i + 1}`);
        //   control.get('parentComponentCode')?.setValue(this.payruleSetupForm.controls.parentComponentCode.value);
        //   control.get('calcType')?.setValue(this.payruleSetupForm.controls.calcType.value);
        //   control.get('percentage')?.setValue(this.payruleSetupForm.controls.percentage.value);
        //   control.get('fixedAmount')?.setValue(this.payruleSetupForm.controls.fixedAmount.value);
        // })
      }
      this.stepRules = this.PayruleSetupItems().value.length - 1;
    }
  }
  removePayruleSetupItem(index) {
    if (this.PayruleSetupItems().length == 1) {
      this.payruleSetupForm.controls.isConditional.setValue(false);
      this.PayruleSetupItems().removeAt(index);
    } else {
      this.PayruleSetupItems().removeAt(index);
    }
  }
  submit() {
    // const rulesList = [];
    const payrullArray = this.payruleSetupForm.get('payruleSetupFormArray') as FormArray;
    if (payrullArray.length == 0) {
      if (this.payruleSetupForm.controls.calcType.value == 'pct' && (this.payruleSetupForm.controls.percentage.value == null
        || this.payruleSetupForm.controls.parentComponentCode.value == null)) {
        Swal.fire({
          title: 'Info',
          text: 'Please fill percentage and parent component'
        })
      }
      else if (this.payruleSetupForm.controls.calcType.value == 'fixed' && this.payruleSetupForm.controls.fixedAmount.value == null) {
        Swal.fire({
          title: 'Info',
          text: 'Please fill fixed amount'
        })
      }
      else {
        this.sendDataAndCloseModel(payrullArray)
      }
    } else {
      this.sendDataAndCloseModel(payrullArray)
    }
  }
  sendDataAndCloseModel(payrullArray) {
    const payruleArrayValues = payrullArray.controls.map(control => {
      const controlValue = control.value;
      return controlValue;
    });
    const payruleFormControls = this.payruleSetupForm.controls;
    const payruleFormObject = Object.keys(payruleFormControls).reduce((obj, controlName) => {
      obj[controlName] = payruleFormControls[controlName].value;
      obj['componentCode'] = this.fromParent.prop1
      obj['isactive'] = true
      return obj;
    }, {});

    const obj = {
      form: payruleFormObject,
      array: payruleFormObject['isConditional'] == true ? payruleArrayValues : []
    }
    this.activeModal.close(obj);
  }

  payruleSetupFormArray(): FormGroup {
    return this.fb.group({
      ruleCode: new FormControl(''),
      parentComponentCode: null,
      calcType: [null, Validators.required],
      percentage: null,
      fixedAmount: null,
      isConditional: [false],
      componentCode: [null],
      comparator: [null, Validators.required],
      comparatorComponent: [null, Validators.required],
      param1Value: [null, Validators.required],
      param2Value: [null],
      isApproved: [false],
      approvedby: null,
      approveddate: null,
      buCode: null,
      isactive: true,
      createdby: null,
      createddate: null,
      lastmodifiedby: null,
      isDeleted: false,
      lastmodifieddate: null,
      payrollCode: null,
      ruleId: null,
      tenantCode: null,
    })
  }









  // ngOnDestroy() {
  //   this.utilServ.viewData = null;
  //   this.utilServ.editData = null;
  // }
}
