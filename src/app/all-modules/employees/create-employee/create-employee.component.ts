import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, debounceTime } from 'rxjs';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss']
})
export class CreateEmployeeComponent implements OnInit, OnDestroy {
  private subject: Subject<string> = new Subject();
  employeeForm: FormGroup;
  view = false;
  update = false;
  branchList = [];
  active = false;
  showSuccessEmailToolTip: string;
  charLimit: number;
  departmentList = [];
  designationList = [];
  kidDetails = [];
  today: any;
  identificationTypes = [
    { name: 'Aadhar Number', code: 'Aadhar-Number' },
    { name: 'PAN', code: 'PAN' },
  ];

  selectState = [
    { code: "Andhra Pradesh", name: "Andhra Pradesh" },
    { code: "TS", name: "Telangana" },
    { code: "Karnataka", name: "Karnataka" },
    { code: "Kerela", name: "Kerela" }
  ];

  genders = [
    { code: "male", name: "Male" },
    { code: "female", name: "Female" },
    { code: "others", name: "Others" },
  ];

  maritalStatus = [
    { code: "married", name: "Married" },
    { code: "single", name: "Single" },
    // { code: "others", name: "Others" },
  ];


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpPutService: HttpPutService,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private UtilServ: UtilService,
    private globalServ: GlobalvariablesService,
    private httpGetService: HttpGetService

  ) { }


  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      employeeid: [''],
      employeeCode: [''],
      employeeName: ['', [Validators.required, this.httpPostService.customValidator()]],
      designation: [''],
      userName: [''],
      email: ['', Validators.required],
      address: [''],
      deptCode: [''],
      contactNo: ['', Validators.required],
      // [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]
      joinDate: [''],
      isactive: [true],
      isAdmin: [false],

      empDtlId: [null],
      identificationType: [''],
      identificationNumber: [''],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      gender: [''],
      maritalStatus: [''],
      emergencyContactName: [''],
      emergencyContactNumber: [''],
      relationshipWithEmp: [''],
      dob: ['', Validators.required],
      createdby: [''],
      createddate: [''],

      fatherDob: [''],
      fatherName: [''],
      motherDob: [''],
      motherName: [''],
      spouseDob: [''],
      spouseName: [''],

    });
    this.today = moment().format('YYYY-MM-DD');
    // this.today = new Date()
    // const thismonth = today.getMonth() + 1
    // const thisYear = today.getFullYear()
    this.charLimit = this.globalServ.charLimitValue;
    this.subject.pipe(debounceTime(1000)).subscribe((args) => {
      this.checkEmail(args);
    });
    this.employeeForm.controls.joinDate.setValue(moment().format('YYYY-MM-DD'));
    // this.employeeForm.controls.dob.setValue(moment().format('YYYY-MM-DD'));
    this.getdepartmentList();
    this.getDesignations();
    if (this.UtilServ.viewData) {
      this.view = true;
      this.getEmployeeDetails(this.UtilServ.viewData);
      this.employeeForm.controls.address.setValue(
        this.UtilServ.viewData.address
      );
      this.employeeForm.controls.userName.setValue(
        this.UtilServ.viewData.userName
      );
      this.employeeForm.controls.designation.setValue(
        this.UtilServ.viewData.designation
      ); 

      this.employeeForm.controls.employeeCode.setValue(
        this.UtilServ.viewData.employeeCode
      );
      this.employeeForm.controls.contactNo.setValue(
        this.UtilServ.viewData.contactNo
      );
      this.employeeForm.controls.deptCode.setValue(
        this.UtilServ.viewData.deptCode
      );
      this.employeeForm.controls.email.setValue(
        this.UtilServ.viewData.email
      );
      this.employeeForm.controls.employeeName.setValue(
        this.UtilServ.viewData.employeeName
      );
      this.employeeForm.controls.joinDate.setValue(
        moment(this.UtilServ.viewData.joinDate).format('YYYY-MM-DD')
      );
      this.employeeForm.controls.employeeid.setValue(
        this.UtilServ.viewData.employeeid
      );
      this.employeeForm.controls.isactive.setValue(
        this.UtilServ.viewData.isactive
      );
      this.employeeForm.controls.isAdmin.setValue(
        this.UtilServ.viewData.isAdmin
      );


      this.employeeForm.disable();
    } else if (this.UtilServ.editData) {
      this.update = true;
      this.getEmployeeDetails(this.UtilServ.editData);
      this.employeeForm.enable();
      this.employeeForm.controls.employeeName.disable();
      this.employeeForm.controls.employeeid.disable();
      this.employeeForm.controls.deptCode.disable();
      this.employeeForm.controls.joinDate.disable();
      this.employeeForm.controls.designation.disable();
      this.employeeForm.controls.userName.disable();

      this.employeeForm.controls.employeeCode.setValue(
        this.UtilServ.editData.employeeMaster.employeeCode
      );
      this.employeeForm.controls.address.setValue(
        this.UtilServ.editData.employeeMaster.address
      );
      this.employeeForm.controls.contactNo.setValue(
        this.UtilServ.editData.employeeMaster.contactNo
      );
      this.employeeForm.controls.deptCode.setValue(
        this.UtilServ.editData.employeeMaster.deptCode
      );
      this.employeeForm.controls.email.setValue(
        this.UtilServ.editData.employeeMaster.email);
      this.employeeForm.controls.employeeName.setValue(
        this.UtilServ.editData.employeeMaster.employeeName
      );
      this.employeeForm.controls.joinDate.setValue(
        moment(this.UtilServ.editData.employeeMaster.joinDate).format('YYYY-MM-DD')
      );
      this.employeeForm.controls.employeeid.setValue(
        this.UtilServ.editData.employeeMaster.employeeid
      );
      this.employeeForm.controls.isactive.setValue(
        this.UtilServ.editData.employeeMaster.isactive
      );
      this.employeeForm.controls.isAdmin.setValue(
        this.UtilServ.editData.employeeMaster.isAdmin
      );
      this.employeeForm.controls.userName.setValue(
        this.UtilServ.editData.employeeMaster.userName
      );
      this.employeeForm.controls.designation.setValue(
        this.UtilServ.editData.employeeMaster.designation
      );
    }

    if (!this.employeeForm.controls.employeeName.value) {
      this.router.navigateByUrl('emp-profile')
    }
  }
  onEmailChange(args: string) {
    this.showSuccessEmailToolTip = 'EMAIL ALREADY EXIST';
    if (
      this.employeeForm.get('email').valid &&
      this.employeeForm.get('email').value !== ''
    ) {
      this.subject.next(args);
    }
  }
  checkEmail(args) {
    this.httpGetService
      .nonTokenApi('checkemail?email=' + args + '&empCode=' + this.UtilServ.editData?.employeeMaster?.employeeCode)
      .subscribe((res: any) => {
        if (res === false) {
          this.showSuccessEmailToolTip = 'EMAIL NOT EXISTS';
        } else if (res === true) {
          this.showSuccessEmailToolTip = 'EMAIL ALREADY EXIST';
        }
      });
  }

  getEmployeeDetails(row) {
    // this.httpGetService.getMasterList('empdetails?empCode=' + code).subscribe((res: any) => {
    if (row.employeeDetail !== null) {
        if (this.view) {
          this.employeeForm.controls.empDtlId.setValue(
            row.employeeDetail?.empDtlId
          );
          this.employeeForm.controls.employeeCode.setValue(
            row.employeeMaster?.employeeCode
          );
          this.employeeForm.controls.address1.setValue(
            row.employeeDetail?.address1
          );

          this.employeeForm.controls.createdby.setValue(
            row.employeeDetail?.createdby
          );
          this.employeeForm.controls.createddate.setValue(
            row.employeeDetail?.createddate
          );
          this.employeeForm.controls.address2.setValue(
            row.employeeDetail?.address2
          );
          this.employeeForm.controls.city.setValue(
            row.employeeDetail?.city
          );
          this.employeeForm.controls.state.setValue(
            row.employeeDetail?.state
          );
          this.employeeForm.controls.gender.setValue(
            row.employeeDetail?.gender
          );
          this.employeeForm.controls.maritalStatus.setValue(
            row.employeeDetail?.maritalStatus
          );
          this.employeeForm.controls.emergencyContactName.setValue(
            row.employeeDetail?.emergencyContactName
          );
          this.employeeForm.controls.emergencyContactNumber.setValue(
            row.employeeDetail?.emergencyContactNo
          );
          this.employeeForm.controls.dob.setValue(
            moment(row.employeeDetail?.dob).format('YYYY-MM-DD')
          );
          this.employeeForm.controls.identificationNumber.setValue(
            row.employeeDetail?.identificationId
          );
          this.employeeForm.controls.identificationType.setValue(
            row.employeeDetail?.identificationType
          );
          this.employeeForm.controls.relationshipWithEmp.setValue(
            row.employeeDetail?.relationshipWithEmp
          );

          const getEmployeeDetails = JSON.parse(
            row.employeeDetail?.employeeDetails
          );
          this.employeeForm.controls.fatherDob.setValue(
            getEmployeeDetails?.fatherDob
          );
          this.employeeForm.controls.fatherName.setValue(
            getEmployeeDetails?.fatherName
          );
          this.employeeForm.controls.motherDob.setValue(
            getEmployeeDetails?.motherDob
          );
          this.employeeForm.controls.motherName.setValue(
            getEmployeeDetails.motherName
          );
          this.employeeForm.controls.spouseDob.setValue(
            getEmployeeDetails.spouseDob
          );
          this.employeeForm.controls.spouseName.setValue(
            getEmployeeDetails.spouseName
          );

          let i = 1;
          let kid = getEmployeeDetails[`kid${i}Name`];
          while (kid) {
            const kidObj = {
              kid1Name: getEmployeeDetails[`kid${i}Name`],
              kid1Dob: getEmployeeDetails[`kid${i}Dob`],
              kid1Gender: getEmployeeDetails[`kid${i}Gender`],
            };
            this.kidDetails.push(kidObj);
            i++;
            kid = getEmployeeDetails[`kid${i}Name`];
          }
        } else if (this.update) {
          this.employeeForm.controls.empDtlId.setValue(
            row.employeeDetail?.empDtlId
          );
          this.employeeForm.controls.createdby.setValue(
            row.employeeDetail?.createdby
          );
          this.employeeForm.controls.createddate.setValue(
            row.employeeDetail?.createddate
          );
          this.employeeForm.controls.address1.setValue(
            row.employeeDetail?.address1
          );
          this.employeeForm.controls.address2.setValue(
            row.employeeDetail?.address2
          );
          this.employeeForm.controls.city.setValue(
            row.employeeDetail?.city
          );
          this.employeeForm.controls.state.setValue(
            row.employeeDetail?.state
          );
          this.employeeForm.controls.gender.setValue(
            row.employeeDetail?.gender
          );
          this.employeeForm.controls.maritalStatus.setValue(
            row.employeeDetail?.maritalStatus
          );
          this.employeeForm.controls.emergencyContactName.setValue(
            row.employeeDetail?.emergencyContactName
          );
          this.employeeForm.controls.emergencyContactNumber.setValue(
            row.employeeDetail?.emergencyContactNo
          );
          this.employeeForm.controls.dob.setValue(
            moment(row.employeeDetail?.dob).format('YYYY-MM-DD')
          );
          this.employeeForm.controls.identificationNumber.setValue(
            row.employeeDetail?.identificationId
          );
          this.employeeForm.controls.identificationType.setValue(
            row.employeeDetail?.identificationType
          );
          this.employeeForm.controls.relationshipWithEmp.setValue(
            row.employeeDetail?.relationshipWithEmp
          );

          const getEmployeeDetails = JSON.parse(
            row.employeeDetail?.employeeDetails
          );
          this.employeeForm.controls.fatherDob.setValue(
            getEmployeeDetails.fatherDob
          );
          this.employeeForm.controls.fatherName.setValue(
            getEmployeeDetails.fatherName
          );
          this.employeeForm.controls.motherDob.setValue(
            getEmployeeDetails.motherDob
          );
          this.employeeForm.controls.motherName.setValue(
            getEmployeeDetails.motherName
          );
          this.employeeForm.controls.spouseDob.setValue(
            getEmployeeDetails.spouseDob
          );
          this.employeeForm.controls.spouseName.setValue(
            getEmployeeDetails.spouseName
          );
          let i = 1;
          let kid = getEmployeeDetails[`kid${i}Name`];
          while (kid) {
            const kidObj = {
              kid1Name: getEmployeeDetails[`kid${i}Name`],
              kid1Dob: getEmployeeDetails[`kid${i}Dob`],
              kid1Gender: getEmployeeDetails[`kid${i}Gender`],
            };
            this.kidDetails.push(kidObj);
            i++;
            kid = getEmployeeDetails[`kid${i}Name`];
          }
        }
      }
    // },
    // (err) => {
    //   console.error(err.error.status.message);
    // })
  }
  getdepartmentList(): any {
    this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
      this.departmentList = res.response
      this.departmentList.forEach(x => {
        x.selected = false;
      });
    }, (err) => {
      console.error(err.error.status.message);
    })
  }

  getDesignations() {
    this.httpGetService.getMasterList('desgs/active').subscribe(
      (res: any) => {
        this.designationList = res.response;

      }, (err) => {
        console.error(err.error.status.message);
      })
  }

  cancel() {
    // this.router.navigateByUrl('emp-profile');
    this.router.navigateByUrl('/dashboard');

    // employees-list
  }
  addKids() {
    const length = this.kidDetails.length;
    if (length > 0) {
      const isEmpty =
        this.kidDetails[length - 1].kid1Name.length == 0
      if (!isEmpty) {
        this.kidDetails.push({
          kid1Name: '',
          kid1Dob: '',
          kid1Gender: ''
        });
      }
    } else {
      this.kidDetails.push({
        kid1Name: '',
        kid1Dob: '',
        kid1Gender: '',
      });
    }
  }
  removeKids(index) {
    this.kidDetails.splice(index, 1);
  }



  create() {
    const kid = {};
    let getAllfamilyMemebers = {}, familyMemebers = {};
    this.kidDetails.forEach((x: any, i) => {
      kid['kid' + (i + 1) + 'Name'] = x.kid1Name;
      kid['kid' + (i + 1) + 'Dob'] = x.kid1Dob;
      kid['kid' + (i + 1) + 'Gender'] = x.kid1Gender;
    });
    familyMemebers = {
      fatherName: this.employeeForm.controls.fatherName.value,
      fatherDob: this.employeeForm.controls.fatherDob.value,
      motherName: this.employeeForm.controls.motherName.value,
      motherDob: this.employeeForm.controls.motherDob.value,
      spouseDob: this.employeeForm.controls.spouseDob.value,
      spouseName: this.employeeForm.controls.spouseName.value,
      kidDetails: this.kidDetails
    }
    getAllfamilyMemebers = {
      ...familyMemebers,
      ...kid
    };
    const obj = {
      employeeMaster: {
        employeeName: this.employeeForm.controls.employeeName.value.trim(),
        designation: this.employeeForm.controls.designation.value,
        userName: this.employeeForm.controls.userName.value,
        email: this.employeeForm.controls.email.value,
        address: this.employeeForm.controls.address.value,
        deptCode: this.employeeForm.controls.deptCode.value,
        contactNo: this.employeeForm.controls.contactNo.value,
        joinDate: this.employeeForm.controls.joinDate.value,
        isactive:
          this.employeeForm.controls.isactive.value == null
            ? false
            : this.employeeForm.controls.isactive.value,
        isAdmin:
          this.employeeForm.controls.isAdmin.value == null
            ? false
            : this.employeeForm.controls.isAdmin.value,
      },
      employeeDetail: {
        identificationType: this.employeeForm.controls.identificationType.value,
        identificationId: this.employeeForm.controls.identificationNumber.value,
        address1: this.employeeForm.controls.address1.value,
        address2: this.employeeForm.controls.address2.value,
        city: this.employeeForm.controls.city.value,
        state: this.employeeForm.controls.state.value,
        gender: this.employeeForm.controls.gender.value,
        maritalStatus: this.employeeForm.controls.maritalStatus.value,
        emergencyContactName:
          this.employeeForm.controls.emergencyContactName.value,
        emergencyContactNo:
          this.employeeForm.controls.emergencyContactNumber.value,
        relationshipWithEmp:
          this.employeeForm.controls.relationshipWithEmp.value,
        dob: this.employeeForm.controls.dob.value,
        employeeDetails: JSON.stringify(getAllfamilyMemebers),
      },
    };

    this.spinner.show();
    this.httpPostService.create('employeeInfo', JSON.stringify(obj)).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: 'Employee ' + this.employeeForm.controls.employeeName.value + ' Created',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.kidDetails = [];
            this.employeeForm.reset();
            this.router.navigateByUrl('employees-list');
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
  Update() {
    this.spinner.show();
    const kid = {};
    let getAllfamilyMemebers = {},
      familyMemebers = {};
    this.kidDetails.forEach((x: any, i) => {
      kid['kid' + (i + 1) + 'Name'] = x.kid1Name;
      kid['kid' + (i + 1) + 'Dob'] = x.kid1Dob;
      kid['kid' + (i + 1) + 'Gender'] = x.kid1Gender;
    });
    familyMemebers = {
      fatherName: this.employeeForm.controls.fatherName.value,
      fatherDob: this.employeeForm.controls.fatherDob.value,
      motherName: this.employeeForm.controls.motherName.value,
      motherDob: this.employeeForm.controls.motherDob.value,
      spouseDob: this.employeeForm.controls.spouseDob.value,
      spouseName: this.employeeForm.controls.spouseName.value,
      kidDetails: this.kidDetails,
    };
    getAllfamilyMemebers = {
      ...familyMemebers,
      ...kid,
    };
    const obj = {
      employeeMaster: {
        employeeid: this.employeeForm.controls.employeeid.value,
        employeeName: this.employeeForm.controls.employeeName.value.trim(),
        employeeCode: this.employeeForm.controls.employeeCode.value,
        userName: this.employeeForm.controls.userName.value,
        email: this.employeeForm.controls.email.value,
        address: this.employeeForm.controls.address.value,
        deptCode: this.employeeForm.controls.deptCode.value,
        designation: this.employeeForm.controls.designation.value,
        contactNo: this.employeeForm.controls.contactNo.value,
        joinDate: this.employeeForm.controls.joinDate.value,
        isactive:
          this.employeeForm.controls.isactive.value == null
            ? false
            : this.employeeForm.controls.isactive.value,
        isAdmin:
          this.employeeForm.controls.isAdmin.value == null
            ? false
            : this.employeeForm.controls.isAdmin.value,
        createdby: this.UtilServ.editData.employeeMaster.createdby,
        createddate: this.UtilServ.editData.employeeMaster.createddate,
        companyCode: this.UtilServ.editData.employeeMaster.companyCode,
        branchCode: this.UtilServ.editData.employeeMaster.branchCode,
      },
      employeeDetail: {
        empDtlId: this.employeeForm.controls.empDtlId.value,
        empCode: this.employeeForm.controls.employeeCode.value,
        tenantCode: this.UtilServ.editData.employeeMaster.companyCode,
        identificationType: this.employeeForm.controls.identificationType.value,
        identificationId: this.employeeForm.controls.identificationNumber.value,
        address1: this.employeeForm.controls.address1.value,
        address2: this.employeeForm.controls.address2.value,
        city: this.employeeForm.controls.city.value,
        state: this.employeeForm.controls.state.value,
        gender: this.employeeForm.controls.gender.value,
        maritalStatus: this.employeeForm.controls.maritalStatus.value,
        emergencyContactName:
          this.employeeForm.controls.emergencyContactName.value,
        emergencyContactNo:
          this.employeeForm.controls.emergencyContactNumber.value,
        relationshipWithEmp:
          this.employeeForm.controls.relationshipWithEmp.value,
        dob: this.employeeForm.controls.dob.value,
        createdby: this.employeeForm.controls.createdby.value,
        createddate: this.employeeForm.controls.createddate.value,
        employeeDetails: JSON.stringify(getAllfamilyMemebers),
      },
    };
    this.httpPutService.doPut('employeeInfo', obj).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.employeeForm.controls.employeeName.value + ' Updated',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.router.navigateByUrl('/dashboard');
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
        console.error(err.error.status.message);
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
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
  }
}
