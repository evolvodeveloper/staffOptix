import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subject, debounceTime } from 'rxjs';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { ProfilePicComponent } from '../../profile-pic/profile-pic.component';

@Component({
  selector: 'app-register2',
  templateUrl: './register2.component.html',
  styleUrls: ['./register2.component.scss'],
})
export class Register2Component implements OnInit, OnDestroy {
  showComponentCode = false;
  private subject: Subject<string> = new Subject();

  hasTabs = false;
  tabData = [];
  rulesQuestion = false;
  disableSalary = true;
  salaryCalculation: number;
  salary = null;
  update = false;
  view = false;
  empSalaryDetails = [];
  logoModified = false;
  salaryComponents = [];

  hasRules = false;
  hasDeductions = false;
  emp: any = {
    fileName: '',
    fileType: '',
    image: '',
    imageByte: '',
  }
  mstfrmclmn = [];
  mstNew = [];

  showSuccessEmailToolTip: string;

  filteredForm = [];

  fields: any;
  payrollEmp = false;

  constructor(
    private globalServ: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private httpPutServ: HttpPutService,
    public dialog: MatDialog,
    private router: Router,
    private utilServ: UtilService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    // this.payrollEmp = this.utilServ.userProfileData.roles.includes('PROLL_MGR') || this.utilServ.userProfileData.roles.includes('PROLL_USER') || this.utilServ.userProfileData.roles.includes('ADMIN');
    this.update = this.utilServ.editData ? true : false;
    this.view = this.utilServ.viewData ? true : false;
    // this.getmstfrmclmn();
    this.getNewMst();



    this.subject.pipe(debounceTime(1000)).subscribe((args) => {
      this.checkEmail(args);
    });

    if (this.view || this.update) {

      this.init();
    }

  }
  init() {
    const a = 3;
    const c = a;
  }


  back() {
    this.router.navigateByUrl('/setup');
  }

  getsalaryComp(val, value) {
    if (this.rulesQuestion == true) {
      this.disableSalary = false;
      if (this.salary !== null) {
        this.getsalaryBreakup(value);
      }
    } else {
      this.disableSalary = true;
      this.salary = (null);
      this.getsalaryComponents(value);
    }
  }
  getsalaryComponents(val) {
    this.spinner.show();
    this.hasRules = false;
    this.showComponentCode = false;
    this.salaryComponents = [];
    this.httpGetService.getMasterList('salarycomponents?payrollCode=' + val).subscribe(
      // this.httpGetService.getMasterList('getsalbreakup?payrollCode=' + this.payrollForm.controls.payrollCode.value + '&sal=' + this.payrollForm.controls.salary.value).subscribe(
      (res: any) => {
        res.response.map(x => x.pct = null)
        this.salaryComponents = res.response;
        const falseRecord = res.response.find(x => x.hasRules === false);
        const hasDeductions = res.response.find(x => x.isDeduction === true)
        if (hasDeductions) {
          this.hasDeductions = true;
        }
        if (falseRecord) {
          this.hasRules = false;
        } else {
          this.hasRules = true;
        }
        this.showComponentCode = true;
        this.spinner.hide();
        if (this.utilServ.editData || this.utilServ.viewData) {
          const obj = this.update == true ? this.utilServ.editData : this.utilServ.viewData;
          this.getEmpSalaryDetails(obj.payrollMaster.employeeCode)
        }

      },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);

      }
    );
  }
  getsalaryBreakup(val) {
    this.spinner.show();
    this.showComponentCode = false;
    // this.httpGetService.getMasterList('salarycomponents?payrollCode=' + this.payrollForm.controls.payrollCode.value).subscribe(
    this.httpGetService.getMasterList('getsalbreakup?payrollCode=' + val + '&sal=' + this.salary).subscribe(
      (res: any) => {
        this.salaryComponents.forEach(x => {
          const found = res.response.find(y => y.componentCode == x.componentCode);
          if (found) {
            x.amount = found.amount
          }
        })
        this.showComponentCode = true;
        this.spinner.hide();
      },

      err => {
        this.spinner.hide();
        console.error(err.error.status.message);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
  getEmpSalaryDetails(empCode) {
    this.httpGetService.getMasterList('componentsforemp?empCode=' + empCode).subscribe((res: any) => {
      this.empSalaryDetails = res.response;
      this.salaryComponents.forEach(x => {
        const found = res.response.find(y => y.componentCode == x.componentCode)
        if (found) {
          x.amount = found.amount
        }
      })
      this.calCulateSalary();
    },
      err => {
        console.error(err.error.status.message);

      }
    );
  }

  onChangeBal(flatamt, row) {
    const amount = this.salaryCalculation - flatamt;
    const discountPerc = ((this.salaryCalculation - amount) / this.salaryCalculation) * 100;
    row.pct = parseFloat(discountPerc.toFixed(2));
    this.calCulateSalary();
  }
  onChangeperct(discperc, row) {
    const finalAmt = this.salaryCalculation - (this.salaryCalculation * discperc) / 100;
    const discountAmt = this.salaryCalculation - finalAmt;
    row.amount = parseFloat(discountAmt.toFixed(2));
    this.calCulateSalary();
  }


  calCulateSalary() {
    let deductAmt = 0, earningAmt = 0, amount = 0;
    this.salaryComponents.forEach(x => {
      if (x.isDeduction == true) {
        deductAmt += x.amount ? x.amount : 0;
      } else if (x.isDeduction == false) {
        earningAmt += x.amount ? x.amount : 0;
      }
    })
    amount = earningAmt - deductAmt
    this.salary = (amount)
  }

  async getNewMst() {
    this.hasTabs = false;
    this.httpGetService.getMasterList('mst/form?formCode=employeeMaster').subscribe((res: any) => {
      this.mstNew = res.response.formColumns
      // res.response.formHeader.forEach(element => {
      //   if (element.tab == false && element.tabId !== null) {
      //     this.hasTabs = true
      //     this.tabData.push({
      //       tabId: element.tabId,
      //       header: element.header,
      //       formCode: element.formCode,
      //       array: []
      //     })
      //   } else {
      //     if (res.response.formHeader.length <= 1) {
      //       this.tabData.push({
      //         tabId: element.tabId,
      //         header: element.header,
      //         formCode: element.formCode,
      //         array: []
      //       })
      //     }
      //   }
      // })
      const jsonList = [];

      this.mstNew.forEach(element => {
        if (element.dataType == 'json') {
          this.fields = JSON.parse(element.defaultValues);
          this.fields['Additional Columns'].forEach(ele => {
            if (ele?.Param) {
              jsonList.push({
                'label': ele.Param,
                columnCode: ele.Param,
                columnName: ele.Param,
                'pctSize': ele.pctSize,
                'dataLength': ele.dataLength,
                dataType: ele.dataType,
                isMandatory: ele.isMandatory,
                placeHolder: ele.placeHolder,
                sameLine: ele.sameLine,
                subheadName: element.columnCode,
                form: element.form, tab: element.tab
              })
            }
          });
        }
      })
      const array = this.mstNew.concat(jsonList);
      // const tabNumbers = res.response.formColumns.map(tab => tab.tab);
      // const highestTabNumber = Math.max(...tabNumbers);   
      const groupedByForm = {}
      array.forEach(column => {
        const { tab, form, columnCode } = column;
        const key = `${form}`;
        //  form
        if (!groupedByForm[key]) {
          groupedByForm[key] = {
            tabId: tab,
            formCode: form,
            formGroup1: this.formBuilder.group({}),
            header: form.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            array: [],
          };
        }
        groupedByForm[key].formGroup1.addControl(columnCode, this.formBuilder.control(''));

        groupedByForm[key].array.push(column);
      });
      const resultArray = Object.values(groupedByForm);
      this.tabData = resultArray
      this.tabData = this.tabData.sort((a, b) => { return a.tabId - b.tabId })
      if (this.tabData.length > 1) {
        this.hasTabs = true;
      } else {
        this.hasTabs = false;
      }    

      this.tabData.forEach(tab => {
        const formGroup = this.createFormGroup(tab.formCode, tab.array);
        tab['formGroup'] = formGroup;
      });
      this.processData(array).then(() => {
        // The dropDownData should be populated now
      });
    },
      err => {
        console.error(err.error.status.message);

      }
    );

  }

  patchFormGroup(code, group) {
    const formControls = group.controls;
    const employeeMasterData = this.utilServ.editData;

    for (const key in formControls) {
      // if (employeeMasterData['code'].hasOwnProperty(key)) {
      if (Object.prototype.hasOwnProperty.call(employeeMasterData, key)) {

        // Check if the key exists in employeeMasterData
        formControls[key].setValue(employeeMasterData[key]);
      }
    }
  }


  submitMultiTabDynamicForm(data) {
    // this.spinner.show();
    const newObj = [];
    this.tabData.forEach(x => {
      const controlNames = Object.keys(x.formGroup.controls);
      const formData = {};
      for (const controlName of controlNames) {
        if (controlName == 'empImage') {
          formData[controlName] = this.emp.imageByte;
          formData['fileType'] = this.emp.fileType;
        } else {
          formData[controlName] = x.formGroup.get(controlName).value;
        }
      }
      newObj.push({
        [x.formCode]: formData
      });
    })
    newObj.push({
      salaryComponents: this.salaryComponents
    })
    const mergedObject = newObj.reduce((acc, item) => {
      return { ...acc, ...item };
    }, {});
    // this.httpPostService.create('employeeInfo', mergedObject).subscribe((res: any) => {
    //   this.spinner.hide();
    //   if (res.status.message == 'SUCCESS') {
    //     Swal.fire({
    //       title: 'Success!',
    //       text: 'Employee Created',
    //       icon: 'success',
    //       timer: 10000,
    //     }).then(() => {
    //       this.utilServ.AllEmployees = [];
    //       this.showComponentCode = false;
    //       this.salaryComponents = [];
    //       this.showSuccessEmailToolTip = '';
    //       this.update = false;
    //       this.emp = {
    //         fileName: null,
    //         fileType: null,
    //         image: null,
    //         imageByte: null,
    //       }
    //       this.back();
    //     });
    //   }
    //   else {
    //     Swal.fire({
    //       title: 'Error!',
    //       text: res.status.message,
    //       icon: 'warning', showConfirmButton: true,
    //     });
    //   }
    // }, (err) => {
    //   console.error(err.error.status.message);
    //   this.spinner.hide();
    //   Swal.fire({
    //     title: 'Error!',
    //     text: err.error.status.message,
    //     icon: 'error',
    //   });
    // })
  }

  updatetMultiTabDynamicForm() {
    this.spinner.show();
    const newObj = [];
    this.tabData.forEach(x => {
      const controlNames = Object.keys(x.formGroup.controls);
      const formData = {};
      for (const controlName of controlNames) {
        if (controlName == 'empImage') {
          formData[controlName] = this.emp.imageByte;
          formData['fileType'] = this.emp.fileType;
        } else {
          formData[controlName] = x.formGroup.get(controlName).value;
        }
      }
      newObj.push({
        [x.formCode]: formData
      });
    })
    newObj.push({
      salaryComponents: this.salaryComponents
    })
    const mergedObject = newObj.reduce((acc, item) => {
      return { ...acc, ...item };
    }, {});
    this.httpPutServ.doPut('employeeInfo', mergedObject).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Employee Created',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.utilServ.AllEmployees = [];
          this.showComponentCode = false;
          this.salaryComponents = [];
          this.showSuccessEmailToolTip = '';
          this.update = false;
          this.emp = {
            fileName: null,
            fileType: null,
            image: null,
            imageByte: null,
          }
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
    })
  }


  createFormGroup(formCode: string, formArray: any[]): FormGroup {
    const formGroupControls = {};
    let control: any;
    formArray.forEach(field => {
      if (field.dataType == 'checkbox') {
        control = new FormControl(true, field.isMandatory ? Validators.required : null);
        formGroupControls[field.columnName] = control;
      } else {
        control = new FormControl('', field.isMandatory ? Validators.required : null);
        formGroupControls[field.columnName] = control;
      }
      if (this.view || this.update) {
        const objdata = this.utilServ.editData[formCode];

        // Check if the field exists in objdata and if the control has the same value
        if (objdata && objdata[field.columnName] !== undefined && objdata[field.columnName] !== null && control.value !== objdata[field.columnName]) {
          if (field.columnName == 'empImage') {
            this.emp.image = objdata['empImage'];
            this.emp.fileType = objdata['fileType'];
            // this.emp.imageByte = objdata['empImage'];
          }
          if (field.columnName == 'payrollCode') {
            this.getsalaryComp('', objdata['payrollCode'])
          }
          // if (field.columnName == 'employeeCode') {
          //   this.getEmpSalaryDetails(objdata['employeeCode'])
          // }
          control.setValue(objdata[field.columnName]);
        }
      }
    });
    return this.formBuilder.group(formGroupControls);
  }

  getData(val): Observable<any> {
    return this.httpGetService.generalApiRequestFromDynamicForm(val);
  }
  async processData(response) {
    for (const element of response) {
      if (element.dataType === "dropdown") {
        element.dropDownData = [];
        element.defaultValues = JSON.parse(element.defaultValues);
        if (element.defaultValues?.url && !element.defaultValues?.parameter) {
          this.getData(element.defaultValues.url).subscribe((data) => {
            element.dropDownData = data.response;
          });
        }
        else {
          element.dropDownData = element.defaultValues?.tags
        }
      }
    }
  }




  onEmailChange(args: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the input value matches the email regex

    this.showSuccessEmailToolTip = 'EMAIL ALREADY EXIST';
    // if (
    //   this.addEmployeeForm.get('email').valid &&
    //   this.addEmployeeForm.get('email').value !== ''
    // ) {
    if (emailRegex.test(args)) {
      this.subject.next(args);
    }
  }
  checkEmail(args) {
    this.httpGetService
      .nonTokenApi('checkemail?email=' + args + '&empCode=' + this.utilServ.editData?.employeeMaster?.employeeCode)
      .subscribe((res: any) => {
        if (res === false) {
          this.showSuccessEmailToolTip = 'EMAIL NOT EXISTS';
        } else if (res === true) {
          this.showSuccessEmailToolTip = 'EMAIL ALREADY EXIST';
        }
      });
  }

  open() {
    const dialogRef = this.dialog.open(ProfilePicComponent, {
      disableClose: true,
      hasBackdrop: true,
      data: {
        employee: this.emp,
      },
      width: '30%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.emp = result.event;
      this.logoModified = true;
      this.emp.fileType;
      // this.emp.fileName = this.addEmployeeForm.controls.employeeName.value + '_image'
    });
  }




  ngOnDestroy() {
    this.update = false;
    this.view = false;
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
  }
}
