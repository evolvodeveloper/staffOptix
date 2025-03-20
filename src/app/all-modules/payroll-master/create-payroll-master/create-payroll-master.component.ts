import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgStepperComponent } from 'angular-ng-stepper';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, startWith } from 'rxjs/operators';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-create-payroll-master',
  templateUrl: './create-payroll-master.component.html',
  styleUrls: ['./create-payroll-master.component.scss']
})
export class CreatePayrollMasterComponent implements OnInit, OnDestroy {
  @ViewChild('cdkStepper') stepper: NgStepperComponent;
  update = false;
  view = false;
  addPayrollForm: FormGroup;
  designationList = [];
  payrollsetups = [];
  empCat = [];
  empSalaryDetails = [];
  policyCodes = [];
  supervisors = [];
  showComponentCode = false;
  capturesTypes = [];
  departmentsList = [];
  hasRules = false;
  hasDeductions = false;
  totalSalary: number;
  totalearningAmt: number;
  totalDeduction: number;
  employees_list = [];
  filteredEmployees_list: string[] = [];
  pytypes = [
    { code: 'Salaried', name: 'Salaried' },
    { code: 'PieceWork', name: 'PieceWork' },
  ];
  temp = [];
  allowAutoGenerateEmpCode: boolean;
  employeeMaster: any;
  salaryComponents = [];
  emptypes = [
    { code: 'Employee', name: 'Employee' },
    { code: 'Contractor', name: 'Contractor' },
    { code: 'Intern', name: 'Intern' },
    { code: 'TEMP', name: 'Temp' }
  ];
  iAmAdmin = false;
  constructor(
    public globalServ: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private httpPutServ: HttpPutService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private utilServ: UtilService,
    private formBuilder: FormBuilder,
  ) {
  }




  ngOnInit(): void {
    this.allowAutoGenerateEmpCode = this.globalServ.allowAutoGenerateEmpCode === 'N' ? true : false;

    this.addPayrollForm = this.formBuilder.group({
      employeeCode: [null, this.allowAutoGenerateEmpCode ? [Validators.required, this.httpPostService.customValidator()] : null],
      employeeRefCode: [null,[this.httpPostService.customValidator()]],
      employeeName: ['', [Validators.required, this.httpPostService.customValidator()]],
      lastName: [null, [this.httpPostService.customValidator()]],
      designation: [null],
      deptCode: [null, Validators.required],
      payrollType: [null, Validators.required],
      payrollCode: [null, Validators.required],
      projectCode: [null],
      salary: [null],
      policyCode: [null],
      employeeType: [null],
      bankAccountNo: [null],
      bankName: [null],
      aliasName: [null],
      bankCode: [null],
      isActive: true,
      bankBranch: [null],
      lastWorkingDate: null,
      bankAddress: [null], rulesQuestion: [false],
      supervisor: [null],
      supervisorId: [null],
      capturePolicy: [null],
    });
    this.iAmAdmin = this.utilServ.userProfileData.roles.includes('ADMIN');

    this.addPayrollForm.controls.rulesQuestion.setValue(false);
    if (!this.utilServ.viewData && !this.utilServ.editData) {
      this.addPayrollForm.controls.payrollType.setValue(this.pytypes[0].code);
      this.addPayrollForm.controls.employeeType.setValue(this.emptypes[0].code);
    }
    this.getPayrollCodes();

    if (this.utilServ.activedepartmentList.length > 0) {
      this.departmentsList = this.utilServ.activedepartmentList;
      if (this.utilServ.activedepartmentList.length == 1 && !this.utilServ.viewData && !this.utilServ.editData) {
        this.addPayrollForm.controls.deptCode.setValue(this.utilServ.activedepartmentList[0].deptCode)
      }
    } else {
      this.getdepartments();
    }
    this.getPolicyCode();
    this.getDesignation();
    this.getCapturepolicies();
    this.getEmpCategory();
    this.getSupervisors();
    this.getEmpDetails();
    if (this.utilServ.viewData || this.utilServ.editData) {
      this.init();
    }
  }
  init() {
    if (this.utilServ.viewData) {
      this.view = true; this.update = false;
      this.addPayrollForm.controls.payrollCode
      this.addPayrollForm.controls.employeeCode.setValue(this.utilServ.viewData.employeeCode);
      this.addPayrollForm.controls.employeeRefCode.setValue(this.utilServ.viewData.employeeRefCode);
      this.addPayrollForm.controls.employeeName.setValue(this.utilServ.viewData.employeeName);
      this.addPayrollForm.controls.aliasName.setValue(this.utilServ.viewData.aliasName);
      this.addPayrollForm.controls.lastName.setValue(this.utilServ.viewData.lastName); 
      this.addPayrollForm.controls.designation.setValue(this.utilServ.viewData.designation);
      this.addPayrollForm.controls.deptCode.setValue(this.utilServ.viewData.deptCode);
      this.addPayrollForm.controls.lastWorkingDate.setValue(this.utilServ.viewData.lastWorkingDate);
      this.addPayrollForm.controls.payrollType.setValue(this.utilServ.viewData.payrollType);
      this.addPayrollForm.controls.policyCode.setValue(this.utilServ.viewData.policyCode);      
      this.addPayrollForm.controls.payrollCode.setValue(this.utilServ.viewData.payrollCode);
      this.addPayrollForm.controls.projectCode.setValue(this.utilServ.viewData.projectCode);
      this.addPayrollForm.controls.employeeType.setValue(this.utilServ.viewData.employeeType);
      this.addPayrollForm.controls.bankAccountNo.setValue(this.utilServ.viewData.bankAccountNo);
      this.addPayrollForm.controls.bankName.setValue(this.utilServ.viewData.bankName);
      this.addPayrollForm.controls.bankCode.setValue(this.utilServ.viewData.bankCode);
      this.addPayrollForm.controls.bankBranch.setValue(this.utilServ.viewData.bankBranch);
      this.addPayrollForm.controls.bankAddress.setValue(this.utilServ.viewData.bankAddress);
      this.addPayrollForm.controls.supervisor.setValue(this.utilServ.viewData.supervisor);
      this.addPayrollForm.controls.supervisorId.setValue(this.utilServ.viewData.supervisorId);
      this.addPayrollForm.controls.capturePolicy.setValue(this.utilServ.viewData.capturePolicy);

      this.addPayrollForm.controls.isActive.setValue(this.utilServ.viewData.isActive);
      this.addPayrollForm.disable();
    }
    else if (this.utilServ.editData) {
      this.view = false; this.update = true;
      this.addPayrollForm.controls.payrollCode
      this.addPayrollForm.controls.employeeCode.setValue(this.utilServ.editData.employeeCode);
      this.addPayrollForm.controls.employeeRefCode.setValue(this.utilServ.editData.employeeRefCode);
      this.addPayrollForm.controls.employeeName.setValue(this.utilServ.editData.employeeName);
      this.addPayrollForm.controls.aliasName.setValue(this.utilServ.editData.aliasName);

      this.addPayrollForm.controls.lastName.setValue(this.utilServ.editData.lastName);
      this.addPayrollForm.controls.designation.setValue(this.utilServ.editData.designation);
      this.addPayrollForm.controls.policyCode.setValue(this.utilServ.editData.policyCode);      
      this.addPayrollForm.controls.lastWorkingDate.setValue(this.utilServ.editData.lastWorkingDate);
      this.addPayrollForm.controls.deptCode.setValue(this.utilServ.editData.deptCode);
      this.addPayrollForm.controls.payrollType.setValue(this.utilServ.editData.payrollType);
      this.addPayrollForm.controls.capturePolicy.setValue(this.utilServ.editData.capturePolicy);
      this.addPayrollForm.controls.payrollCode.setValue(this.utilServ.editData.payrollCode);
      this.addPayrollForm.controls.projectCode.setValue(this.utilServ.editData.projectCode);
      this.addPayrollForm.controls.employeeType.setValue(this.utilServ.editData.employeeType);
      this.addPayrollForm.controls.bankAccountNo.setValue(this.utilServ.editData.bankAccountNo);
      this.addPayrollForm.controls.bankName.setValue(this.utilServ.editData.bankName);
      this.addPayrollForm.controls.bankCode.setValue(this.utilServ.editData.bankCode);
      this.addPayrollForm.controls.bankBranch.setValue(this.utilServ.editData.bankBranch);
      this.addPayrollForm.controls.bankAddress.setValue(this.utilServ.editData.bankAddress);
      this.addPayrollForm.controls.supervisor.setValue(this.utilServ.editData.supervisor);
      this.addPayrollForm.controls.isActive.setValue(this.utilServ.editData.isActive);
      this.addPayrollForm.controls.supervisorId.setValue(this.utilServ.editData.supervisorId);

      this.addPayrollForm.enable();
      if (!this.iAmAdmin) {
        this.addPayrollForm.controls.employeeName.disable();
      }
      this.addPayrollForm.controls.employeeCode.disable();
      if (this.addPayrollForm.controls.payrollCode.value) {
        this.addPayrollForm.controls.payrollCode.disable();
      }
    }
    this.getsalaryComp();
  }

  setupFilteredOptions() {
    this.addPayrollForm.controls.employeeName.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    ).subscribe(filteredOptions => {
      this.filteredEmployees_list = filteredOptions;
    });
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.employees_list.filter(option => option.employeeName.toLowerCase().includes(filterValue));
  }
  onSupervisorChange(value) {
    const row = this.supervisors.find(x => x.employeeCode == value);
    this.addPayrollForm.controls.supervisor.setValue(row.employeeName)
  }

  onEmployeeNameChange() {
    this.employeeMaster = null;
    // this.addPayrollForm.controls.employeeName.setValue(val.target.value)
    const emp = this.employees_list.filter(option => option.employeeName == this.addPayrollForm.controls.employeeName.value);
    if (emp.length >= 1) {
      this.employeeMaster = emp;
      this.addPayrollForm.controls.lastName.setValue(emp[0].lastName);
      this.addPayrollForm.controls.employeeCode.setValue(emp[0].employeeCode);
      this.addPayrollForm.controls.employeeRefCode.setValue(emp[0]?.employeeRefCode);

      this.addPayrollForm.controls.designation.setValue(emp[0].designation);
      this.addPayrollForm.controls.projectCode.setValue(emp[0].projectCode);
      this.addPayrollForm.controls.deptCode.setValue(emp[0].deptCode);
      this.addPayrollForm.controls.employeeCode.disable();
      if (emp[0].lastName) {
        this.addPayrollForm.controls.lastName.disable();
      } if (emp[0].designation) {
        this.addPayrollForm.controls.designation.disable();
      } if (emp[0].projectCode) {
        this.addPayrollForm.controls.projectCode.disable();
      } if (emp[0].deptCode) {
        this.addPayrollForm.controls.deptCode.disable();
      }
    }
    else {
      // if (this.addPayrollForm.controls.employeeName.value.length === 0) {
      //   this.addPayrollForm.controls.employeeCode.setValue(null);
      //   this.addPayrollForm.controls.employeeRefCode.setValue(null);
      //   this.addPayrollForm.controls.lastName.setValue(null);
      //   this.addPayrollForm.controls.designation.setValue(null);
      //   this.addPayrollForm.controls.projectCode.setValue(null);
      //   this.addPayrollForm.controls.projectCode.setValue(null);
      // }
      this.addPayrollForm.controls.employeeCode.enable();
      this.addPayrollForm.controls.lastName.enable();
      this.addPayrollForm.controls.designation.enable();
      this.addPayrollForm.controls.projectCode.enable();
      this.addPayrollForm.controls.deptCode.enable();                  
    }
  }

  getsalaryComp() {
    if (this.addPayrollForm.controls.rulesQuestion.value == true) {
      // this.addPayrollForm.controls.salary.enable();
      if (this.addPayrollForm.controls.salary.value !== null) {
        this.getsalaryBreakup();
      } else {
        Swal.fire({
          title: 'Info!',
          text: "Please Enter amount in Salary field",
          icon: 'info',
        });
      }
    } else {
      // this.addPayrollForm.controls.salary.disable();
      this.addPayrollForm.controls.salary.setValue(null);
      this.getsalaryComponents();
    }
  }
  getsalaryComponents() {
    this.spinner.show();
    this.hasRules = false;
    this.showComponentCode = false;
    this.salaryComponents = [];
    this.httpGetService.getMasterList('salarycomponents?payrollCode=' + this.addPayrollForm.controls.payrollCode.value).subscribe(
      // this.httpGetService.getMasterList('getsalbreakup?payrollCode=' + this.payrollForm.controls.payrollCode.value + '&sal=' + this.payrollForm.controls.salary.value).subscribe(
      (res: any) => {

        const filteredData = res.response.filter(item => item.componentCode !== "Total Salary" && item.componentCode !== "CTC");
        const ear = [], ded = [];
        filteredData.forEach(element => {
          if (element.isDeduction == true) {
            ded.push(element)
          } else if (element.isDeduction == false) {
            ear.push(element)
          }
        });
        const diff = ear.length - ded.length
        if (diff < 0) {
          // If the difference is negative, push that many rows into earRows
          for (let i = 0; i < Math.abs(diff); i++) {
            ear.push({
              componentCode: '',
              isDeduction: false
            });
          }
        } else if (diff > 0) {
          // If the difference is positive, push that many rows into dedRows
          for (let i = 0; i < diff; i++) {
            ded.push({
              componentCode: '',
              isDeduction: true
            });
          }
        }
        // const modifiedList = [...ear, ...ded];
        const falseRecord = filteredData.find(x => x.hasRules === true);
        const hasDeductions = filteredData.find(x => x.isDeduction === true)
        if (hasDeductions) {
          this.hasDeductions = true;
        }
        if (falseRecord) {
          this.hasRules = true;
        } else {
          this.hasRules = false;
        }
        const sortData = filteredData.sort((a, b) => a.sortOrder - b.sortOrder);
        this.salaryComponents = sortData

        this.showComponentCode = true;
        this.spinner.hide();
        if (this.utilServ.editData || this.utilServ.viewData) {
          this.getEmpSalaryDetails(this.addPayrollForm.controls.employeeCode.value);
        }

      },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);

      }
    );
  }
  getsalaryBreakup() {
    this.spinner.show();
    this.showComponentCode = false;
    this.httpGetService.getMasterList('getsalbreakup?payrollCode=' + this.addPayrollForm.controls.payrollCode.value + '&sal=' + this.addPayrollForm.controls.salary.value).subscribe(
      (res: any) => {
        this.salaryComponents.forEach(x => {
          x.checkedSalary = false;
          x.amount = null;
          x.pct = null;
          const found = res.response.find(y => y.componentCode == x.componentCode);

          if (found) {
            x.amount = found.amount;
            x.checkedSalary = true;
          }
        })
        let deductAmt = 0, earningAmt = 0, amount = 0;
        this.salaryComponents.forEach(x => {
          if (x.isDeduction == true) {
            deductAmt += x.amount ? x.amount : 0;
          } else if (x.isDeduction == false) {
            earningAmt += x.amount ? x.amount : 0;
          }
        })
        amount = earningAmt - deductAmt
        this.totalDeduction = deductAmt;
        this.totalearningAmt = earningAmt;
        this.totalSalary = amount;
        if (!this.addPayrollForm.controls.rulesQuestion.value) {
          console.log('rulesQuestion', this.addPayrollForm.controls.rulesQuestion.value);
          this.addPayrollForm.controls.salary.setValue(this.totalearningAmt);
        }
        this.salaryValue();
        this.showComponentCode = true;
        this.spinner.hide();
        // if (this.utilServ.editData || this.utilServ.viewData) {
        //   this.getEmpSalaryDetails(this.addPayrollForm.controls.employeeCode.value);
        // }
      },

      err => {
        this.spinner.hide();
        console.error(err.error.status.message);
      }
    );
  }
  getEmpSalaryDetails(empCode) {
    this.httpGetService.getMasterList('componentsforemp?empCode=' + empCode).subscribe((res: any) => {
      this.empSalaryDetails = res.response;
      this.salaryComponents.forEach(x => {
        const found = res.response.find(y => y.componentCode == x.componentCode)
        if (found) {
          if (found.amount !== null && found.amount > 0) {
            x.amount = found.amount;
            x.checkedSalary = true;
          }
          else {
            x.amount = found.amount;
            x.checkedSalary = false;
          }
        }
      })
      let deductAmt = 0, earningAmt = 0, amount = 0;
      this.salaryComponents.forEach(x => {
        if (x.isDeduction == true) {
          deductAmt += x.amount ? x.amount : 0;
        } else if (x.isDeduction == false) {
          earningAmt += x.amount ? x.amount : 0;
        }
      })
      amount = earningAmt - deductAmt
      this.totalDeduction = deductAmt;
      this.totalearningAmt = earningAmt;
      this.totalSalary = amount;
      if (!this.addPayrollForm.controls.rulesQuestion.value) {
        console.log('rulesQuestion',this.addPayrollForm.controls.rulesQuestion.value);
        
        this.addPayrollForm.controls.salary.setValue(this.totalearningAmt);        
      }
      this.salaryValue();
    },
      err => {
        console.error(err.error.status.message);

      }
    );
  }
  salaryValue() {
    this.salaryComponents.forEach(x => {
      if (x.checkedSalary == true) {
        this.onChangeBal(x.amount, x)
      }
    })
  }

  onChangeBal(flatamt, row) {
    const amount = this.addPayrollForm.controls.salary.value - flatamt;
    const discountPerc = ((this.addPayrollForm.controls.salary.value - amount) / this.addPayrollForm.controls.salary.value) * 100;
    row.pct = parseFloat(discountPerc.toFixed(2));
    this.calCulateSalary();
    this.cdr.detectChanges();
  }
  onChangeperct(discperc, row) {
    const finalAmt = this.addPayrollForm.controls.salary.value - (this.addPayrollForm.controls.salary.value * discperc) / 100;
    const discountAmt = this.addPayrollForm.controls.salary.value - finalAmt;
    row.amount = parseFloat(discountAmt.toFixed(2));
    this.calCulateSalary();
  }

  calCulateSalary() {
    let deductAmt = 0, earningAmt = 0, amount = 0;
    this.totalDeduction = 0, this.totalSalary = 0, this.totalearningAmt = 0;

    this.salaryComponents.forEach(x => {
      if (x.isDeduction == true) {
        deductAmt += x.amount ? x.amount : 0;
      } else if (x.isDeduction == false) {
        earningAmt += x.amount ? x.amount : 0;
      }
    })
    amount = earningAmt - deductAmt
    this.totalDeduction = deductAmt;
    this.totalearningAmt = earningAmt;
    this.totalSalary = amount;
  }
  checkedSalary(val, row) {
    if (this.addPayrollForm.controls.salary.value == null
      || this.addPayrollForm.controls.salary.value == undefined) {
      Swal.fire({
        title: 'Info!',
        text: "Please Enter amount in Salary field",
        icon: 'info',
      });
      row.checkedSalary = false;
      val.target.checked = false
    } else {
      if (val.target.checked == false) {
        row.pct = null,
          row.amount = 0,
          row.checkedSalary = false
      } else {
        row.checkedSalary = true
      }
      this.calCulateSalary();
    }
  }
  getSupervisors() {
    this.httpGetService.getMasterList('payroll/mgrs').subscribe(
      (res: any) => {
        this.supervisors = res.response;
      }
    );
  }
  getdepartments() {
    this.httpGetService.getMasterList('depts/active').subscribe(
      (res: any) => {
        this.departmentsList = res.response;
        this.utilServ.activedepartmentList = res.response;
      }, (err) => {
        console.error(err.error.status.message);
      });
  }
  getEmpDetails() {
    this.httpGetService.getMasterList('emps/payroll').subscribe(
      (res: any) => {
        this.employees_list = res.response;
        this.temp = res.response;
        this.setupFilteredOptions()
      }, (err) => {
        console.error(err.error.status.message);
      });
  }
  getPolicyCode() {
    this.httpGetService.getMasterList('trackingpolicies').subscribe(
      (res: any) => {
        this.policyCodes = res.response;
      }, (err) => {
        console.error(err.error.status.message);
      });
  }

  getEmpCategory() {
    this.utilServ.allProjects = [];
    this.httpGetService.getMasterList('empcategorys').subscribe(
      (res: any) => {
        this.empCat = res.response;
        this.utilServ.allProjects = res.response;
      }, (err) => {
        console.error(err.error.status.message);
      });
  }

  getPayrollCodes() {
    if (this.utilServ.payrollSetupBackup.length == 0) {
      this.httpGetService.getMasterList('payrollsetups').subscribe(
        (res: any) => {
          this.payrollsetups = res.response;
          this.utilServ.payrollSetupBackup = res.response;
          if (this.utilServ.payrollSetupBackup.length == 1 && !this.utilServ.viewData && !this.utilServ.editData) {
            this.addPayrollForm.controls.payrollCode.setValue(this.utilServ.payrollSetupBackup[0].payrollCode);
            this.getsalaryComp();

          } else if (this.utilServ.payrollSetupBackup.length > 1 && !this.utilServ.viewData && !this.utilServ.editData) {
            const row = this.utilServ.payrollSetupBackup.find((x) => x.isDefault == true);
            this.addPayrollForm.controls.payrollCode.setValue(row?.payrollCode);
            this.getsalaryComp();
          }
        }, (err) => {
          console.error(err.error.status.message);
        });
    } else {
      this.payrollsetups = this.utilServ.payrollSetupBackup;
      if (this.utilServ.payrollSetupBackup.length == 1 && !this.utilServ.viewData && !this.utilServ.editData) {
        this.addPayrollForm.controls.payrollCode.setValue(this.utilServ.payrollSetupBackup[0].payrollCode);
        this.getsalaryComp();
      }
      else if (this.utilServ.payrollSetupBackup.length > 1 && !this.utilServ.viewData && !this.utilServ.editData) {
        const row = this.utilServ.payrollSetupBackup.find((x) => x.isDefault == true);
        this.addPayrollForm.controls.payrollCode.setValue(row?.payrollCode);
        this.getsalaryComp();
      }
    }

  }

  getDesignation() {
    this.httpGetService.getMasterList('desgs/active').subscribe(
      (res: any) => {
        this.designationList = res.response;
      }, (err) => {
        console.error(err.error.status.message);
      });
  }
  getCapturepolicies() {
    this.httpGetService.getMasterList('capturepolicies').subscribe(
      (res: any) => {
        this.capturesTypes = res.response;
        this.utilServ.activeCapturesTypes = res.response;
        if (res.response.length == 1 && !this.view && !this.update) {
          this.addPayrollForm.controls.capturePolicy.setValue(res.response[0].code)
        }
      }
    );
  }
  back() {
    this.router.navigateByUrl('/payroll-master');
  }

  ngOnDestroy() {
    this.utilServ.viewData = null;
    this.utilServ.editData = null;
    this.view = false;
    this.update = false;
  }

  submit() {
    const checkedEmps = this.salaryComponents.filter(x => x.checkedSalary == true)
    let allowPayroll = false;
    if (this.addPayrollForm.controls.salary.value !== null && checkedEmps.length > 0) {
      if (this.addPayrollForm.controls.salary.value !== this.totalearningAmt) {

      allowPayroll = false;
      Swal.fire({
        title: 'warning!',
        text: 'Total Salary is not equal to the sum of Earning Components ',
        icon: 'warning',
        timer: 10000,
      })
      } else {
        allowPayroll = true;
      }
    } else {
      allowPayroll = true;
    }
    if (allowPayroll) {
      const salaryComponents = [];
      this.salaryComponents.forEach(element => {
        if (element.checkedSalary && (element.amount > 0 || element.amount !== null)) {
          salaryComponents.push({
            componentCode: element.componentCode,
            amount: element.amount,
            employeeCode: this.addPayrollForm.controls.employeeCode.value,
          });
        }
      });
      if (this.employeeMaster) {
        const req = this.employeeMaster[0]
        req.designation = this.addPayrollForm.controls.designation.value;
        req.deptCode = this.addPayrollForm.controls.deptCode.value,
          req.projectCode = this.addPayrollForm.controls.projectCode.value,
          req.lastName = this.addPayrollForm.controls.lastName.value;
      }
      const obj = {
        employeeCode: this.addPayrollForm.controls.employeeCode.value,
        employeeRefCode: this.addPayrollForm.controls.employeeRefCode.value,
        employeeName: this.addPayrollForm.controls.employeeName.value,
        lastName: this.addPayrollForm.controls.lastName.value,
        aliasName: this.addPayrollForm.controls.aliasName.value,
        designation: this.addPayrollForm.controls.designation.value,
        deptCode: this.addPayrollForm.controls.deptCode.value,
        payrollType: this.addPayrollForm.controls.payrollType.value,
        payrollCode: this.addPayrollForm.controls.payrollCode.value,
        projectCode: this.addPayrollForm.controls.projectCode.value,
        salary: 0,
        policyCode: this.addPayrollForm.controls.policyCode.value,
        employeeType: this.addPayrollForm.controls.employeeType.value,
        bankAccountNo: this.addPayrollForm.controls.bankAccountNo.value,
        bankName: this.addPayrollForm.controls.bankName.value,
        capturePolicy: this.addPayrollForm.controls.capturePolicy.value,
        bankCode: this.addPayrollForm.controls.bankCode.value,
        bankBranch: this.addPayrollForm.controls.bankBranch.value,
        bankAddress: this.addPayrollForm.controls.bankAddress.value,
        supervisor: this.addPayrollForm.controls.supervisor.value,
        supervisorId: this.addPayrollForm.controls.supervisorId.value,
        isActive:
          this.addPayrollForm.controls.isActive.value == null
            ? false
            : this.addPayrollForm.controls.isActive.value,
        employeeMaster: this.employeeMaster ? this.employeeMaster[0] : null,
        employeeDetails: null,
        salaryComponents
      }   
      this.spinner.show();
      this.httpPostService
        .create('payrollMaster', JSON.stringify(obj))
        .subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                title: 'Success!',
                text:
                  this.addPayrollForm.controls.employeeName.value + ' Created',
                icon: 'success',
                timer: 10000,
              }).then(() => {
                this.salaryComponents = [];
                this.addPayrollForm.reset();
                this.utilServ.AllEmployees = [];
                this.showComponentCode = false;
                this.addPayrollForm.controls.payrollType.setValue(this.pytypes[0].code);
                this.update = false;
                this.addPayrollForm.enable();
                this.back();
              });
            }
            else {
              Swal.fire({
                title: 'Error!',
                text: res.status.message,
                icon: 'warning', showConfirmButton: true,
              });
            }
          },
          (err) => {
            this.spinner.hide();
            if (err.error.status.message == 'Employee limit reached') {
              Swal.fire({
                title: err.error.status.message,
                text: 'please upgrade your plan',
                icon: 'error',
              });
            }
            else {
              Swal.fire({
                title: 'Error!',
                text: err.error.status.message,
                icon: 'error',
              });
            }
          }
      );
    }
  }




  Update() {
    const checkedEmps = this.salaryComponents.filter(x => x.checkedSalary == true)
    let allowPayroll = false;
    if (this.addPayrollForm.controls.salary.value !== null && checkedEmps.length > 0) {
      if (this.addPayrollForm.controls.salary.value !== this.totalearningAmt) {
        allowPayroll = false;
        Swal.fire({
        title: 'warning!',
        text: 'Total Salary is not equal to the sum of Earning Components ',
        icon: 'warning',
        timer: 10000,
      })
      }
      else {
        allowPayroll = true;
      }
    } else {
      allowPayroll = true;
    }
    if (allowPayroll) {
      const salaryComponents = [];
      for (const payrollComp of this.salaryComponents) {
        const matchingDate = this.empSalaryDetails.find((record) => record.componentCode === payrollComp.componentCode);
        if (matchingDate) {
          salaryComponents.push({
            id: matchingDate.id,
            isApproved: matchingDate.isApproved,
            isactive: payrollComp.checkedSalary == true ? true : false,
            buCode: matchingDate.buCode,
            tenantCode: matchingDate.tenantCode,
            createdby: matchingDate.createdby,
            createddate: matchingDate.createddate,
            employeeCode: this.utilServ.editData.employeeCode,
            "componentCode": matchingDate.componentCode,
            "amount": payrollComp.amount
          })
        }
        else {
          salaryComponents.push({
            id: null,
            isApproved: null,
            isactive: payrollComp.checkedSalary == true ? true : false,
            buCode: null,
            tenantCode: null,
            createdby: null,
            createddate: null,
            employeeCode: this.utilServ.editData.employeeCode,
            "componentCode": payrollComp.componentCode,
            "amount": payrollComp.amount
          })
        }
      }
      const obj = {
        employeeid: this.utilServ.editData.employeeid,
        employeeCode: this.utilServ.editData.employeeCode,
        employeeRefCode: this.addPayrollForm.controls.employeeRefCode.value, 
        divisionCode: this.utilServ.editData.divisionCode,
        lastName: this.addPayrollForm.controls.lastName.value,
        aliasName: this.addPayrollForm.controls.aliasName.value,
        bankAccountNo: this.addPayrollForm.controls.bankAccountNo.value,
        bankName: this.addPayrollForm.controls.bankName.value,
        bankCode: this.addPayrollForm.controls.bankCode.value,
        capturePolicy: this.addPayrollForm.controls.capturePolicy.value,
        bankBranch: this.addPayrollForm.controls.bankBranch.value,
        bankAddress: this.addPayrollForm.controls.bankAddress.value,
        designation:
          this.addPayrollForm.controls.designation.value,
        deptCode:
          this.addPayrollForm.controls.deptCode.value,
        policyCode: this.addPayrollForm.controls.policyCode.value,
        projectCode:
          this.addPayrollForm.controls.projectCode.value,
        employeeName: this.addPayrollForm.controls.employeeName.value,
        employeeType: this.addPayrollForm.controls.employeeType.value,
        payrollType:
          this.addPayrollForm.controls.payrollType.value,
        payrollCode:
          this.addPayrollForm.controls.payrollCode.value,
        lastWorkingDate: this.addPayrollForm.controls.lastWorkingDate.value,
        supervisor: this.addPayrollForm.controls.supervisor.value,
        supervisorId: this.addPayrollForm.controls.supervisorId.value,
        companyCode: this.utilServ.editData.companyCode,
        branchCode: this.utilServ.editData.branchCode,
        salary: 0,
        // approved: this.addPayrollForm.controls.approved.value,
        isActive:
          this.addPayrollForm.controls.isActive.value == null
            ? false
            : this.addPayrollForm.controls.isActive.value,
        createdby: this.utilServ.editData.createdby,
        createddate: this.utilServ.editData.createddate,
        employeeMaster: null,
        salaryComponents,
        employeeDetails: null
      };
      this.spinner.show();
      this.httpPutServ.doPut('payrollMasterWithEmp', JSON.stringify(obj)).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: 'Employee ' + this.addPayrollForm.controls.employeeName.value + ' Updated',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.utilServ.AllEmployees = [];
              this.addPayrollForm.reset();
              this.back();
            });
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
  }
}
