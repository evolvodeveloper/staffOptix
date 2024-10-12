import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  selector: 'app-create-vist-config',
  templateUrl: './create-vist-config.component.html',
  styleUrl: './create-vist-config.component.scss'
})
export class CreateVistConfigComponent implements OnInit, OnDestroy {

  visitConfig: FormGroup;
  visitMappingConfig: FormGroup;
  view = false;
  update = false;
  List = [];
  departments: any;
  selectedOption: string = '';
  purposes  = [
    {name: 'DELIVERY'},
    {name: 'SALES'},
  ];
  stopSpinner = false;
  employees_list: Array<{
    [x: string]: any; mergeName: string, employeeCode: string ,disabled: boolean 
}> = []; // Define your employee structure
selectedEmployees: any[] = [];
  employeeCode = '';
  mappingForm: FormGroup;
  ids: any;
  rows: any;
  isEmployeeSelectDisabled = false;
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
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.selectedEmployees = navigation.extras.state['selectedEmployees'] || [];
    }
  }
  ngOnDestroy() {
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
  }


  ngOnInit() {
   
    
    this.getAllEmps();
    this.getDepartments();
    this.visitConfig = this.formBuilder.group({
      purpose: [null, [Validators.required]],
      empCode : [null],
      depCode: [null],
      otpAuth: false,
      capturePayment: false,
      goodsImages: false,
      visitImages: false,
    });

    this.mappingForm = this.formBuilder.group({
      empCode: [[]],
    });

    if (this.UtilServ.viewData) {
      this.view = true;
      this.update = false;
      this.visitConfig.disable();

      this.visitConfig.controls.purpose.setValue(
        this.UtilServ.viewData.purpose
      );
      this.visitConfig.controls.otpAuth.setValue(
        this.UtilServ.viewData.otpAuth
      );
      this.visitConfig.controls.capturePayment.setValue(
        this.UtilServ.viewData.capturePayment
      );
      this.visitConfig.controls.goodsImages.setValue(
        this.UtilServ.viewData.goodsImages
      );
      this.visitConfig.controls.visitImages.setValue(
        this.UtilServ.viewData.visitImages
      );
      this.visitConfig.controls.empCode.setValue(
        this.UtilServ.viewData.empCode
      );
      this.visitConfig.controls.depCode.setValue(
        this.UtilServ.viewData.depCode
      );


      this.employees_list = this.UtilServ.viewData?.empVisitList.map(emp => ({
        empCode: emp.empCode
      }));
      this.mappingForm.controls.empCode.setValue(this.employees_list.map(emp => emp.empCode));
      this.mappingForm.controls.empCode.disable();
      


    } else if (this.UtilServ.editData) {
      if(this.UtilServ.allVisitConfigs.length > 0){
        this.selectedEmployees = this.UtilServ.allVisitConfigs;
     }
    console.log('selectedEmployees',this.selectedEmployees);

      this.update = true;
      this.view = false;
      this.visitConfig.enable();
      this.visitConfig.controls.purpose.disable();

      this.visitConfig.controls.purpose.setValue(
        this.UtilServ.editData.purpose
      );
      this.visitConfig.controls.otpAuth.setValue(
        this.UtilServ.editData.otpAuth
      );
      this.visitConfig.controls.capturePayment.setValue(
        this.UtilServ.editData.capturePayment
      );
      this.visitConfig.controls.goodsImages.setValue(
        this.UtilServ.editData.goodsImages
      );
      this.visitConfig.controls.visitImages.setValue(
        this.UtilServ.editData.visitImages
      );

      if(this.UtilServ.editData.empVisitList.length > 0){
        this.employees_list = this.UtilServ.editData?.empVisitList.map(emp => ({
          empCode: emp.empCode
        }));
        this.mappingForm.controls.empCode.setValue(this.employees_list.map(emp => emp.empCode));
      }



      // this.employees_list = this.UtilServ.editData?.empVisitList?.map(empCode => ({
      //   mergeName: empCode, // This will be displayed in the select
      //   employeeCode: empCode // This will be the value of the select
      // }));
      console.log(this.employees_list);
      
      // this.mappingForm.controls.empCode.setValue(this.UtilServ.editData?.empVisitList);


      // this.mappingForm.controls.empCode.setValue(
      //   this.UtilServ.this.UtilServ.editData.empCode
      // );



    }

  }


  getAllEmps() {
    this.employees_list = [];
    this.spinner.show();

    // employeesByCatAndDept?department=ALL&category=ALL
    this.httpGetService.getMasterList('employeesByCatAndDept?department=all&category=ALL').subscribe(
      (res: any) => {
        this.spinner.hide();
        const val = res.response.map(x => {
          x.mergeName = `${x.employeeName} - ${x.employeeCode}`;
          x.deptCode = x.deptCode;
          return x
        });
        const filterEmps = val.filter(emp => 
          !this.selectedEmployees.some(selectedEmp => selectedEmp.empCode === emp.employeeCode)
        );
        this.employees_list = filterEmps;
        console.log(this.employees_list);

      },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);
      })
  }

  getDepartments() {
    // this.spinner.show();
    this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
      const depval = res.response.map(x => {
        x.mergeName = `${x.deptCode}`;
        return x
      })

      this.departments = depval;
        console.log(this.departments);
        
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

 // Method to update the selected option
selectOption(option: string) {
  this.selectedOption = option;
}


  back() {
    this.router.navigateByUrl('/setup/visit-config');
  }

  create() {
    if (this.visitConfig.invalid) {
      for (const control of Object.keys(this.visitConfig.controls)) {
        this.visitConfig.controls[control].markAsTouched();
      }
      return;
    } else {
      this.spinner.show();
      // this.spinner.show();
      // const deptCodeList = this.mappingForm.value.deptCode.map(deptCode => ({
      //   deptCode: deptCode,
      //   id: null,
      //   isActive: true,
      // }));
      const empCodeList = this.mappingForm.value.empCode.map(empCode => ({
        empCode: empCode
      }));

      const data = {
        purpose: this.visitConfig.value.purpose,
        otpAuth: this.visitConfig.value.otpAuth,
        capturePayment: this.visitConfig.value.capturePayment,
        goodsImages: this.visitConfig.value.goodsImages,
        visitImages: this.visitConfig.value.visitImages,
        visitConfigId: this.visitConfig.value.purpose,
        empVisitList: empCodeList,

      };
      console.log(data);
      
      
      this.httpPost.create('hr/visit', data).subscribe((res: any) => {
        console.log(res.status.message);
        console.log(res);
        this.spinner.hide();

        if(res.status.code === 1019){
          Swal.fire({
            title: 'Error!',
            text: 'Purpose Already Exists',
            icon: 'error',
          });
        }
        
        
        if (res.status.message == 'SUCCESS' && res.response.id) {
          Swal.fire({
            title: 'Success',
            text: 'Visit Config Created',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            this.router.navigateByUrl('/setup/visit-config');
            this.visitConfig.reset();
          });
          this.UtilServ.visitConfigIds = res.response;
          // this.createEmpMapping(res.response.id);
        }
      },
        (err) => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
          console.error(err.error.status.message);
        });

    }
  }

  createEmpMapping(visitConfigId) {
    this.spinner.show();
    console.log(visitConfigId);
    

    const data = {
      empCode: this.visitConfig.value.empCode,
      deptCode: this.visitConfig.value.depCode,
      visitConfigId: visitConfigId,
    };
    console.log(data);
    
    this.httpPost.create('emp/visit/mapping', data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success',
          text: 'Visit Config Created',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          this.router.navigateByUrl('/setup/visit-config');
          this.visitConfig.reset();
        });
      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
        console.error(err.error.status.message);
      });
  }

  Update(){
    this.spinner.show();
console.log(this.visitConfig.value);
console.log(this.UtilServ.editData);

const oldEmpVisitList = this.UtilServ.editData.empVisitList || [];

  // New list of employee codes from the form
  const newEmpVisitList = this.mappingForm.value.empCode || [];

  // Step 1: Process the old employee list (preserve ids and other fields)
  const updatedEmpVisitList = oldEmpVisitList.map(emp => {
    // If the old employee code is not in the new list, set isActive to false
    if (!newEmpVisitList.includes(emp.empCode)) {
      return { ...emp, isActive: false };  // Mark as inactive but keep other fields (id, empCode, etc.)
    } else {
      return { ...emp, isActive: true };   // Mark as active and keep other fields
    }
  });

  console.log(updatedEmpVisitList);
  

  newEmpVisitList.forEach(empCode => {
    // Check if this empCode already exists in updatedEmpVisitList
    const existingEmp = updatedEmpVisitList.find(emp => emp.empCode === empCode);

    // If it's a new employee (does not exist in oldEmpVisitList), add it
    if (!existingEmp) {
      updatedEmpVisitList.push({
        empCode: empCode,
        visitConfigId: this.UtilServ.editData.id,
        id: null,  // New employees may not have an ID yet, so set to null or leave it out
        isActive: true,
        companyCode: this.UtilServ.editData.companyCode,
        branchCode: this.UtilServ.editData.branchCode,
        // Add any additional fields required for a new employee here, if needed
      });
    }
  });


    const data = {
      id: this.UtilServ.editData.id,
      purpose: this.UtilServ.editData.purpose,
      otpAuth: this.visitConfig.value.otpAuth,
      capturePayment: this.visitConfig.value.capturePayment,
      goodsImages: this.visitConfig.value.goodsImages,
      visitImages: this.visitConfig.value.visitImages,
      companyCode: this.UtilServ.editData.companyCode,
      branchCode: this.UtilServ.editData.branchCode,
      empVisitList: updatedEmpVisitList,

    };
    console.log(data);
    
    this.httpPut.doPut('hr/visit', data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success',
          text: this.visitConfig.controls.purpose.value + ' Updated',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          this.router.navigateByUrl('/setup/visit-config');
          this.visitConfig.reset();
          this.mappingForm.reset();
        });
      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }
//   updateDisabledEmployees() {
//     // Clear previously selected employees
   
// console.log(this.selectedDepartments);

//     this.filteredEmployees = this.employees_list.map(employee => {
//       if (this.selectedDepartments.includes(employee.deptCode)) {
//       return { ...employee, disabled: true };
//       }
//       return { ...employee, disabled: false }; 
//     });
//     console.log('filteredEmployees',this.filteredEmployees);
    
//   }
  // isEmployeeDisabled(employeeCode: string): boolean {
  //   const employee = this.filteredEmployees.find(emp => emp.employeeCode === employeeCode);
  //   return employee ? employee.disabled : false;
  // }

}
