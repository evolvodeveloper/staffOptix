import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ot-employees',
  templateUrl: './ot-employees.component.html',
  styleUrls: ['./ot-employees.component.scss']
})
export class OtEmployeesComponent implements OnInit {
  private ngUnsubscribe = new Subject<void>();
  empOtForm: FormGroup;
  today: any;
  records = [];
  temp = [];
  searchInEmp: string;
  checkedAll = false;

  payrollCodesList = [];
  constructor(
    private httpGetService: HttpGetService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private global: GlobalvariablesService,
    private utilServ: UtilService,
    private httpPut: HttpPutService,
    private httpGet: HttpGetService,
    private httpPost: HttpPostService
  ) { }
  ngOnInit() {
    this.getPayrollCodes();
    this.empOtForm = this.fb.group({
      payrollCode: [null, Validators.required],
      startDate: [null, Validators.required],
      // endDate: [null, Validators.required],
      employeeData: [[]],

    });
    this.empOtForm.controls.startDate.setValue(moment().format('YYYY-MM-DD'))
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.records = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.records = temp;
    }
  }

  getPayrollCodes() {
    this.httpGet.getMasterList('payrollsetups').subscribe((res: any) => {
      this.payrollCodesList = res.response;
      const row = res.response.find(x => x.isDefault == true);
      if (row) {
        this.empOtForm.controls.payrollCode.setValue(row.payrollCode)
      } else {
        if (res.response.length === 1) {
          this.empOtForm.controls.payrollCode.setValue(res.response[0].payrollCode);
        }
      }
      if (this.empOtForm.controls.payrollCode.value) {
        this.getRecordsBasedOnDatendPayroll();
      }
    })
  }
  cancel() {
    this.router.navigateByUrl('/OtEmployees');
  }
  getRecordsBasedOnDatendPayroll() {
    this.empOtForm.get('employeeData').setValue([]);
    this.records = [];
    if (this.empOtForm.controls.payrollCode.value && this.empOtForm.controls.startDate.value) {
      this.spinner.show();
      this.httpGet.getMasterList('employeesOt?startDate=' + this.empOtForm.controls.startDate.value
        + '&payrollCode=' + this.empOtForm.controls.payrollCode.value).subscribe((res: any) => {
          this.records = res.response;
          this.temp = res.response;
          this.spinner.hide();
        },
          (err) => {
            this.spinner.hide();
            this.records = [];
            this.empOtForm.controls.employeeData.setValue([]);
            this.sweetAlert_topEnd('error', err.error.status.message);
          })
    }
  }

  selectAllEmps(event) {
    this.checkedAll = event.target.checked;
    if (this.checkedAll) {
      this.empOtForm.controls.employeeData.setValue([]);
      this.records.forEach(x => {
        x.checked = true;
        this.empOtForm.controls.employeeData.value.push({
          employeeCode: x.employeeCode,
          employeeName: x.employeeName,
          deptCode: x.deptCode,
          dateCode: this.empOtForm.controls.startDate.value,
          payrollCode: this.empOtForm.controls.payrollCode.value
        });
      })
    } else {
      this.records.forEach((x) => {
        x.checked = false;
        this.empOtForm.controls.employeeData.setValue([]);
      })
    }
    // if (this.checkedAll)
    // this.modifiedRecord.forEach(x=> x.checked == true)
  }

  selectedEmp(val, emps) {
    emps.checked = true;
    const index = this.empOtForm.controls.employeeData.value.findIndex(
      (d) => d.employeeCode == emps.employeeCode
    );
    if (index > -1) {
      this.empOtForm.controls.employeeData.value.splice(index, 1);
    }
    else {
      this.empOtForm.controls.employeeData.value.push({
        employeeCode: emps.employeeCode,
        employeeName: emps.employeeName,
        dateCode: this.empOtForm.controls.startDate.value,
        payrollCode: this.empOtForm.controls.payrollCode.value
      });
    }
  }

  create() {
    this.spinner.show();
    this.httpPost.create('uploadOt', this.empOtForm.controls.employeeData.value).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        this.sweetAlert_topEnd('success', 'OT  has been created successfully!');
        this.empOtForm.reset();
        this.empOtForm.get('employeeData').setValue([]);
        this.records = [];
        this.checkedAll = false;
      }
      else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning',
          showConfirmButton: true,
        });
      }
    },
      (err) => {
        this.spinner.hide();
        this.sweetAlert_topEnd('error', err.error.status.message);
      }
    )
  }

  sweetAlert_topEnd(icon, title) {
    Swal.fire({
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 5000,
    });
  }

}
