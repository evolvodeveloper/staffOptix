import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-mapping',
  templateUrl: './create-mapping.component.html',
  styleUrl: './create-mapping.component.scss'
})
export class CreateMappingComponent implements OnInit, OnDestroy{
  ids: any;
  selectedId: any;
  disableEmpCode: any;
  ngOnDestroy(): void {
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
  }
  stopSpinner = true;
  employees_list: Array<{ mergeName: string, employeeCode: string }> = []; // Define your employee structure
  employeeCode = '';
  mappingForm: FormGroup;
  view = false;
  update = false;
  List = [];
  departments: any;
  selectedOption: string = '';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private httpPost: HttpPostService,
    private httpGetService: HttpGetService,
    private UtilServ: UtilService,
    private sanitizer: DomSanitizer,
    private globalServ: GlobalvariablesService,
    private httpPut: HttpPutService,
  ) { 
  }

  get empcodes() {
    return this.mappingForm.get('empCodes') as FormArray;
  }
  ngOnInit(): void {
    this.getVisitConfigs();
this.getAllEmps();
    this.getDepartments();   
    this.disableEmpCode = this.UtilServ.allVisitConfigs;   
    this.mappingForm = this.formBuilder.group({
      visitConfigIds: [null, [Validators.required]],
      empCode: [[]], 
      deptCode: [null],
      
    });

    if (this.UtilServ.viewData) {
      this.view = true;
      this.update = false;
      this.mappingForm.disable();

      const viewData = this.UtilServ.viewData;

      if(this.UtilServ.viewData.empcodes.length > 0){
        this.selectedOption = 'employee'
      } else if(this.UtilServ.viewData.deptCode){
        this.selectedOption = 'department'
      }
      
      this.employees_list = viewData?.empcodes?.map(empCode => ({
        mergeName: empCode, // This will be displayed in the select
        employeeCode: empCode // This will be the value of the select
      }));
      this.mappingForm.controls.empCode.setValue(viewData?.empcodes);
      this.mappingForm.controls.deptCode.setValue(
        this.UtilServ.viewData.deptCode
      );
      this.mappingForm.controls.visitConfigIds.setValue(
        this.UtilServ.viewData.visitConfigId
      );


    } else if (this.UtilServ.editData) {
      this.update = true;
      this.view = false;
      this.mappingForm.enable();

      const editData = this.UtilServ.editData;
      if (editData.empcodes.length > 0) {       
        this.selectedOption = 'employee'
      } else if (editData.deptCode) {       
        this.selectedOption = 'department'
      }

      
      this.employees_list = editData?.empcodes?.map(empCode => ({
        mergeName: empCode, // This will be displayed in the select
        employeeCode: empCode // This will be the value of the select
      }));
      this.mappingForm.controls.empCode.setValue(editData?.empcodes);
      // this.mappingForm.controls.empCode.setValue(
      //   this.UtilServ.editData.empCode
      // );
      this.mappingForm.controls.deptCode.setValue(
        editData.deptCode
      );
      this.mappingForm.controls.visitConfigIds.setValue(
        editData.visitConfigId
      );


    }
 
  }

  selectOption(option: string): void {
    this.selectedOption = option;
  }

  getVisitConfigs() {
    // this.stopSpinner = true;
    this.httpGetService.getMasterList('visit').subscribe((res: any) => {
    this.ids = res.response;
      // this.stopSpinner = false; 
    },
      err => {
        // this.stopSpinner = false;
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      })
  }

  getAllEmps() {
    this.employees_list = [];
    // this.stopSpinner = true;
    // employeesByCatAndDept?department=ALL&category=ALL
    this.httpGetService.getMasterList('employeesByCatAndDept?department=all&category=ALL').subscribe(
      (res: any) => {
        const val = res.response.map(x => {
          x.mergeName = `${x.employeeName} - ${x.employeeCode}`;
          return x
        })
        // if (res.response.length > 0) {
        //   val.unshift({
        //     employeeCode: 'ALL',
        //     employeeName: 'ALL',
        //     mergeName: 'ALL'
        //   })
        // }
        // this.stopSpinner = false;
        this.employees_list = val;
      },
      err => {
        // this.stopSpinner = false;
        console.error(err.error.status.message);
      })
  }

  getDepartments() {
    // this.spinner.show();
    this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
      const rows = res.response;
      this.departments = rows;

      // this.spinner.hide();
    }, err => {
      // this.spinner.hide();
      Swal.fire({
        title: 'Error!',
        text: err.error.status.message,
        icon: 'error',
        timer: 3000,
      });
    }
    )
  }

  createMapping() {
    this.spinner.show();
    const deptCodeList = this.mappingForm.value.deptCode ? [this.mappingForm.value.deptCode] : [];

    const data = {
      visitConfigId: this.mappingForm.value.visitConfigIds,
      empCode: this.mappingForm.value.empCode,
      deptCode: deptCodeList,
    }
    this.httpPost.create('emp/visit/mapping', data).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.mappingForm.reset();
        Swal.fire({
          title: 'Success!',
          text: res.status.message,
          icon: 'success',
          timer: 3000,
        });
        this.router.navigateByUrl('/setup/visit-mapping');
      },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }

  updateMapping() {
    this.spinner.show();
    const deptCodeList = this.mappingForm.value.deptCode ? [this.mappingForm.value.deptCode] : [];
    const data = {
      // id: this.UtilServ.editData.id,
      visitConfigId: this.mappingForm.value.visitConfigIds,
      empCode: this.mappingForm.value.empCode,
      deptCode: deptCodeList,
      // companyCode: this.UtilServ.editData.companyCode,
      // branchCode: this.UtilServ.editData.branchCode,
    }    
    this.httpPut.doPut('emp/visit/mapping', data).subscribe(
      (res: any) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Success!',
          text: res.status.message,
          icon: 'success',
          timer: 3000,
        });
        this.router.navigateByUrl('/setup/visit-mapping');
      },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }

  back() {
    this.router.navigateByUrl('/setup/visit-mapping');
  }


}
