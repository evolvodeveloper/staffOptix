import { ChangeDetectorRef, Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';

import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subject, debounceTime } from 'rxjs';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { CreateOfficelocationComponent } from '../../timesetup-master/officelocation/create-officelocation/create-officelocation.component';
import { ProfilePicComponent } from '../profile-pic/profile-pic.component';
@Component({
  selector: 'app-add-employee',
  templateUrl: './add-payroll-employee.component.html',
  styleUrls: ['./add-payroll-employee.component.scss'],
})
export class AddPayrollEmployeeComponent implements OnInit, OnDestroy {
  capturesTypes: any;
  @HostListener('document:keydown.enter', ['$event']) onEnter(event: KeyboardEvent): void {
    event.preventDefault();
  }
  className = 'AddPayrollEmployeeComponent';
  showComponentCode = false;
  departmentForm: FormGroup;
  designationForm: FormGroup;
  projectForm: FormGroup;
  policyCodes = [];
  locationForm: FormGroup;
  PreviewObject: any;
  groupedDocuments = [];
  private subject: Subject<string> = new Subject();
  showsubmitPayrollQuestion = false;
  update = false;
  view = false;
  locationList = [];
  empSalaryDetails = [];
  logoModified = false;
  salaryComponents = [];
  designationList = [];
  deptCodes = [];
  totalSalary: number;
  totalearningAmt: number;
  totalDeduction: number;
  payrollsetups = [];
  supervisors = [];
  pytypes = [
    { code: 'Salaried', name: 'Salaried' },
    { code: 'PieceWork', name: 'PieceWork' },
  ];
  projectTypes = [
    { id: '1', name: 'Fixed Cost' },
    { id: '2', name: 'T&M' },
  ];
  hasRules = false;
  hasDeductions = false;
  empCat = [];
  emp: any = {
    fileName: '',
    fileType: '',
    image: '',
    imageByte: '',
  }
  empDoc = [];
  mstfrmclmn = [];
  roleTypes = [
    { id: '1', name: 'Owners' },
    { id: '2', name: 'Managers' },
    { id: '3', name: 'Users' },
  ];
  bothAreSame = false;
  showSuccessEmailToolTip: string;
  emptypes = [
    { code: 'Employee', name: 'Employee' },
    { code: 'Contractor', name: 'Contractor' },
    { code: 'Intern', name: 'Intern' },
    { code: 'TEMP', name: 'Temp' }
  ];
  filteredForm = [];
  addEmployeeForm: FormGroup;
  othersForm: FormGroup;
  payrollForm: FormGroup;
  fields: any;
  payrollEmp = false;
  iAmAdmin = false;
  genders = [
    { code: 'Male', name: 'Male' },
    { code: 'Female', name: 'Female' },
    { code: 'others', name: 'Others' }
  ];
  allowAutoGenerateEmpCode: boolean;
  charLimit: number;
  roleAccessArray = [];
  userNames = [];
  projectPlaceholder = [];
  roleAccessArrayProject = [];

  formFields: any[] = []; // Loaded dynamically
  dropdownOptions: { [key: string]: any[] } = {};
  constructor(
    public globalServ: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private httpPostService: HttpPostService,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private httpPutServ: HttpPutService,
    public dialog: MatDialog,
    private router: Router,
    // private navEnd: NavigationEnd,
    private cdr: ChangeDetectorRef,
    private utilServ: UtilService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  getUserNames() {
    this.httpGetService.getMasterList('secUser/userName?userType=Employee').subscribe(
      (res: any) => {
        this.userNames = res.response;
      }
    );
  }




  ngOnInit(): void {
    this.payrollEmp = this.utilServ.userProfileData.roles.includes('PROLL_MGR') || this.utilServ.userProfileData.roles.includes('PROLL_USER') || this.utilServ.userProfileData.roles.includes('ADMIN');
    this.iAmAdmin = this.utilServ.userProfileData.roles.includes('ADMIN');
    this.allowAutoGenerateEmpCode = this.globalServ.allowAutoGenerateEmpCode === 'N' ? true : false;
    this.update = this.utilServ.editData ? true : false;
    this.view = this.utilServ.viewData ? true : false;
    this.getmstfrmclmn();
    this.getPolicyCode();
    this.getEmpDocs();
    this.getUserNames();
    this.globalServ.getMyCompLabels('departmentMaster');
    this.globalServ.getMyCompLabels('projectMaster');
    this.globalServ.getMyCompPlaceHolders('employeeMaster');
    this.globalServ.getMyCompPlaceHolders('projectMaster');
    this.globalServ.getMyCompPlaceHolders('departmentMaster');
    this.globalServ.getMyCompLabels('Designation');
    this.globalServ.getMyCompPlaceHolders('Designation');
    this.globalServ.getMyCompLabels('projectMaster');
    this.globalServ.getMyCompPlaceHolders('employeeMaster');
    this.addEmployeeForm = this.formBuilder.group({
      employeeCode: [null, this.allowAutoGenerateEmpCode ? [Validators.required, this.httpPostService.customValidator()] : null],
      employeeName: [null, [Validators.required, this.httpPostService.customValidator()]],
      designation: [null],
      gender: [null, Validators.required],
      lastName: [null],
      deptCode: [null, Validators.required],
      projectCode: [null],
      aliasName: [null],
      // esi: [''],
      imgFiletype: [null],
      userName: [null],
      imgFileName: [null],
      approved: [false],
      isActive: [true],
      // address: [''],
      joinDate: [null],
      contactNo: [null, Validators.required],
      email: [null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      locationCode: [null],
      divisionCode: null,
      alternateEmail: [null, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
      submitPayrollQuestion: true,
      showDoc: true
    });
    this.payrollForm = this.formBuilder.group({
      payrollType: [null, Validators.required],
      payrollCode: [null, Validators.required],
      bankAccountNo: null,
      bankName: null,
      employeeRefCode: [null, [this.httpPostService.customValidator()]],
      bankCode: null,
      bankBranch: null,
      bankAddress: null,
      isActive: [true],
      rulesQuestion: false,
      policyCode: [null],
      lastWorkingDate: [null],
      salary: [null],
      supervisor: [null],
      supervisorId: [null],
      employeeType: [null],
      capturePolicy: [null],
    });
    this.departmentForm = this.formBuilder.group({
      deptCode: [null, [Validators.required, this.httpPostService.customValidator()]],
      deptName: [null, [Validators.required, this.httpPostService.customValidator()]],
      isactive: [true],
    });
    this.designationForm = this.formBuilder.group({
      designation: [null, [Validators.required, this.httpPostService.customValidator()]],
      isManager: [true],
      isactive: [true]
    });
    this.projectForm = this.formBuilder.group({
      categoryCode: [null, [Validators.required, this.httpPostService.customValidator()]],
      shortName: [null],
      description: [null],
      projectType: [null, Validators.required],
      projectOwner: [null],
      isGlobal: false,
      isVisible: true,
      projectUrl: [null],
      isactive: [true],
    });
    this.locationForm = this.formBuilder.group({
      locationCode: [null, Validators.required],
      description: [null],
      address1: [null],
      address2: [null],
      city: [null],
      state: [null],
      country: [null],
      isDefault: [false],
      isActive: [true],
    })
    this.charLimit = this.globalServ.charLimitValue;
    this.othersForm = this.formBuilder.group({});
    this.getLocations();
    this.getPayrollCodes();
    this.getSupervisors();
    this.getCapturepolicies();
    this.payrollForm.controls.rulesQuestion.setValue(false);
    if (!this.view && !this.update) {
      this.payrollForm.controls.employeeType.setValue(this.emptypes[0].code);

    }
    if (this.utilServ.activeDesignations.length > 0) {
      this.designationList = this.utilServ.activeDesignations;
      if (this.utilServ.activeDesignations.length == 1 && !this.view && !this.update) {
        this.addEmployeeForm.controls.designation.setValue(this.utilServ.activeDesignations[0].designation)
      }
    } else {
      this.getDesignation();
    }

    // if (this.utilServ.activeCapturesTypes.length > 0) {
    //   this.capturesTypes = this.utilServ.activeCapturesTypes;
    //   if (this.utilServ.activeCapturesTypes.length == 1 && !this.view && !this.update) {
    //     this.payrollForm.controls.capturePolicy.setValue(this.utilServ.activeCapturesTypes[0].capturePolicy)
    //   }
    // } else {
    //   this.getCapturepolicies();
    // }

    if (this.utilServ.activedepartmentList.length > 0) {
      this.deptCodes = this.utilServ.activedepartmentList;
      if (this.utilServ.activedepartmentList.length == 1 && !this.view && !this.update) {
        this.addEmployeeForm.controls.deptCode.setValue(this.utilServ.activedepartmentList[0].deptCode)
      }
    } else {
      this.getdeptCode();
    }
    if (this.utilServ.allProjects.length > 0) {
      this.empCat = this.utilServ.allProjects;
      if (this.utilServ.allProjects.length == 1 && !this.view && !this.update) {
        this.addEmployeeForm.controls.projectCode.setValue(this.utilServ.allProjects[0].categoryCode)
      }
    } else {
      this.getEmpCategory();
    }
    this.subject.pipe(debounceTime(1000)).subscribe((args) => {
      this.checkEmail(args);
    });

    if (!this.view && !this.update) {
      this.payrollForm.controls.payrollType.setValue(this.pytypes[0].code);
      this.addEmployeeForm.controls.joinDate.setValue(moment().format('YYYY-MM-DD'))
    }
    if (this.view || this.update) {
      this.init();
    }
    // this.loadFormFields();
  }
  // loadFormFields(): void {
  //   // Mock form fields (you may replace this with an API call)
  //   this.formFields = [
  //     {
  //       columnCode: 'id',
  //       columnName: 'designation',
  //       label: 'Designation',
  //       dataType: 'dropdown',
  //       dataSource: 'api',
  //       apiEndpoint: 'desgs/active',
  //     },
  //     {
  //       columnCode: 'categoryCode',
  //       columnName: 'description',
  //       label: 'Category',
  //       dataType: 'dropdown',
  //       dataSource: 'api',
  //       apiEndpoint: 'empcategorys',
  //     },
  //     {
  //       columnCode: 'country',
  //       columnName: 'country',
  //       label: 'Country',
  //       dataType: 'dropdown',
  //       dataSource: 'static',
  //       defaultValues: '{"tags": ["India", "USA", "UK"]}',
  //     },
  //   ];

  //   this.initializeDropdownOptions();
  // }

  // initializeDropdownOptions(): void {
  //   const apiCalls = this.formFields
  //     .filter((field) => field.dataSource === 'api') // Filter fields with API-based options
  //     .map((field) => ({
  //       columnName: field.columnName,
  //       apiCall: this.httpGetService.getMasterList(field.apiEndpoint),
  //     }));

  //   // Handle API calls in parallel using forkJoin
  //   forkJoin(apiCalls.map((call) => call.apiCall)).subscribe(
  //     (responses) => {
  //       // Map responses to their respective dropdown fields
  //       apiCalls.forEach((call, index) => {
  //         const response: any = responses[index];
  //         this.dropdownOptions[call.columnName] = response.response || []; // Adjust based on API response structure
  //       });
  //     },
  //     (error) => {
  //       console.error('Error fetching dropdown data', error);
  //     }
  //   );

  //   // Handle static dropdowns
  //   this.formFields
  //     .filter((field) => field.dataSource === 'static')
  //     .forEach((field) => {
  //       this.dropdownOptions[field.columnName] = JSON.parse(field.defaultValues).tags;
  //     });
  // }



  scorllToTop() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0); // Scroll to the top of the page
      }
    });
  }

  getEmpDocs() {
    this.httpGetService.getMasterList('docs').subscribe(
      (res: any) => {
        const empDoc = res.response;
        empDoc.map(x => ({ ...x, imageByteCode: null, fileName: null, fileType: null, preview: false, fileContent: null }));
        this.empDoc = empDoc;
        const groupedDocuments = empDoc.reduce((acc, doc) => {
          const documentType = doc.documentType;
          if (!acc[documentType]) {
            acc[documentType] = { docType: documentType, documents: [] };
          }
          acc[documentType].documents.push(doc);

          return acc;
        }, {});
        this.groupedDocuments = Object.values(groupedDocuments);
      },
      err => {
        console.error(err?.error?.status?.message);

      }
    );
  }
  removeImg(id, row) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.empDoc.findIndex(x => x.documentId == id);
        if (this.empDoc[index].docId == null || this.empDoc[index].docId == undefined) {
          // this.empDoc.splice(index, 1);
          this.empDoc[index]['isDeleted'] = true;
          this.empDoc[index].fileName = null
          this.empDoc[index].imageByteCode = null
        } else {
          this.empDoc[index]['isDeleted'] = true;
          this.empDoc[index].fileName = null
          this.empDoc[index].imageByteCode = null
        }
      }
    });


  }
  checkEmailsAreSameOrNot() {
    this.bothAreSame = false;
    if (this.addEmployeeForm.controls.email.value == this.addEmployeeForm.controls.alternateEmail.value) {
      this.bothAreSame = true;
    }
  }
  init() {
    let obj: any;
    if (this.view) {
      this.othersForm.disable();
      this.addEmployeeForm.disable();
      this.payrollForm.disable();
      obj = this.utilServ.viewData;
      if (obj.payrollMaster) {
        this.showsubmitPayrollQuestion = true;
        this.addEmployeeForm.controls.submitPayrollQuestion.setValue(true);
      } else {
        this.showsubmitPayrollQuestion = false;
        this.addEmployeeForm.controls.submitPayrollQuestion.setValue(false);
      }
    }
    else if (this.update) {
      this.addEmployeeForm.enable();
      this.othersForm.enable();
      this.payrollForm.enable();
      obj = this.utilServ.editData;
      this.addEmployeeForm.controls.employeeCode.disable();
      // this.addEmployeeForm.controls.employeeRefCode.disable();
      if (!this.iAmAdmin) {
        this.addEmployeeForm.controls.employeeName.disable();
      }
    }
    if (obj.payrollMaster) {
      this.showsubmitPayrollQuestion = true;
      this.addEmployeeForm.controls.submitPayrollQuestion.setValue(true);
    } else {
      this.showsubmitPayrollQuestion = false;
      this.addEmployeeForm.controls.submitPayrollQuestion.setValue(false);
    }



    if (obj?.employeeMaster?.empImage !== null && obj?.employeeMaster?.fileType !== null && obj?.employeeMaster?.empImage !== undefined) {
      this.emp.image = (obj.employeeMaster?.empImage),
        this.emp.imageByte = (obj.employeeMaster?.imageByte),
        this.emp.fileType = obj.employeeMaster?.fileType,
        this.emp.filName = obj.employeeMaster?.fileName
    }
    else {
      this.emp = {
        fileName: '',
        fileType: '',
        image: '',
        imageByte: '',
      }
    }
    this.addEmployeeForm.patchValue({
      employeeName: obj.employeeMaster.employeeName,
      employeeCode: obj.employeeMaster.employeeCode,
      lastName: obj.employeeMaster?.lastName,
      gender: obj.employeeMaster.gender,
      aliasName: obj.payrollMaster?.aliasName,
      address: obj.employeeMaster.address,
      joinDate: obj.employeeMaster?.joinDate == null ? null : moment(obj.employeeMaster?.joinDate).format('YYYY-MM-DD'),
      contactNo: obj.employeeMaster?.contactNo,
      email: obj.employeeMaster?.email,
      alternateEmail: obj.employeeMaster?.alternateEmail,
      locationCode: obj.employeeMaster?.locationCode,
      designation: obj.employeeMaster.designation,
      deptCode: obj.employeeMaster.deptCode,
      userName: obj.employeeMaster?.userName,
      projectCode: obj.employeeMaster.projectCode,
      isActive: obj.employeeMaster.isactive,
      divisionCode: obj.employeeMaster.divisionCode,
    })
    this.payrollForm.patchValue({
      payrollType: obj.payrollMaster?.payrollType,
      payrollCode: obj.payrollMaster?.payrollCode,
      salary: obj.payrollMaster?.salary,
      supervisor: obj.payrollMaster?.supervisor,
      supervisorId: obj.payrollMaster?.supervisorId,
      employeeType: obj.payrollMaster?.employeeType,
      capturePolicy: obj.payrollMaster?.capturePolicy,
      policyCode: obj.payrollMaster?.policyCode,
      bankAccountNo: obj.payrollMaster?.bankAccountNo,
      bankName: obj.payrollMaster?.bankName,
      bankCode: obj.payrollMaster?.bankCode,
      bankBranch: obj.payrollMaster?.bankBranch,

      lastWorkingDate: obj.payrollMaster?.lastWorkingDate == null ? null : moment(obj.payrollMaster?.lastWorkingDate).format('YYYY-MM-DD'),
      bankAddress: obj.payrollMaster?.bankAddress,
      employeeRefCode: obj.payrollMaster?.employeeRefCode,
    });
    if (this.payrollForm.controls.payrollCode.value) {
      this.payrollForm.controls.payrollCode.disable();
    }
    this.getsalaryComp();
    this.getdocuments(this.addEmployeeForm.controls.employeeCode.value);
  }

  back() {
    this.router.navigateByUrl('/all-payroll-employees');
  }
  getLocations() {
    this.httpGetService.getMasterList('officeLocations').subscribe(
      (res: any) => {
        this.utilServ.allOfficeLocationsList = res.response;
        res.response.forEach(element => {
          if (element.isactive == true) {
            this.locationList.push(element);
          }
        });
      },
      err => {
        console.error(err.error.status.message);
      }
    );
  }
  getPolicyCode() {
    this.httpGetService.getMasterList('trackingpolicies').subscribe(
      (res: any) => {
        this.policyCodes = res.response;
      }, (err) => {
        console.error(err.error.status.message);
      });
  }

  OpenLocation() {
    const data = {
      prop4: this.className,
    };
    const modalRef = this.modalService.open(CreateOfficelocationComponent, {
      windowClass: 'myCustomModalClass',
      backdrop: 'static'
    });
    modalRef.componentInstance.fromParent = data;
    modalRef.result.then(
      (x) => {
        if (x) {
          this.getLocations();
          this.addEmployeeForm.controls.locationCode.setValue(x.locationCode)
        }
      },
    );
  }
  addUser() {
    if (!this.departmentForm.controls.deptCode.value) {
      Swal.fire({
        text: 'Please Enter Department Fields',
        icon: 'info',
        timer: 10000,
      });
    } else {
      const length = this.roleAccessArray.length;
      if (length > 0) {
        const isEmpty = this.roleAccessArray[length - 1].deptRoleCode.length == 0;
        if (!isEmpty) {
          this.roleAccessArray.push({
            id: null,
            deptCode: null,
            userType: 'Employee',
            deptRoleCode: null,
            userName: null,
            buCode: null,
            tenantCode: null,
            createdby: null,
            createddate: null,
            lastmodifiedby: null,
            lastmodifieddate: null,
            status: null
          });
        }
      } else {
        this.roleAccessArray.push({
          id: null,
          deptCode: null,
          userType: 'Employee',
          deptRoleCode: null,
          userName: null,
          buCode: null,
          tenantCode: null,
          createdby: null,
          createddate: null,
          lastmodifiedby: null,
          lastmodifieddate: null,
          status: null
        });
      }
    }
  }
  removeItem(index) {
    if (this.roleAccessArray[index].id == null) {
      this.roleAccessArray.splice(index, 1);
    } else {
      this.roleAccessArray[index]['REJECTED'] = true;
      this.roleAccessArray.forEach((x) => {
        x.status =
          typeof x.REJECTED !== 'undefined' && x.REJECTED
            ? 'delete'
            : typeof x.status === 'undefined'
              ? 'NEW'
              : x.status;
      });
    }
  }
  addUserInProject() {
    if (!this.projectForm.controls.categoryCode.value) {
      Swal.fire({
        text: 'Please Enter Project Fields',
        icon: 'info',
        timer: 10000,
      });
    } else {
      const length = this.roleAccessArrayProject.length;
      if (length > 0) {
        const isEmpty = this.roleAccessArrayProject[length - 1].projectRoleCode.length == 0;
        if (!isEmpty) {
          this.roleAccessArrayProject.push({
            id: null,
            projectCode: null,
            userType: 'Employee',
            projectRoleCode: null,
            userName: null,
            buCode: null,
            tenantCode: null,
            createdby: null,
            createddate: null,
            status: null
          });
        }
      } else {
        this.roleAccessArrayProject.push({
          id: null,
          projectCode: null,
          userType: 'Employee',
          projectRoleCode: null,
          userName: null,
          buCode: null,
          tenantCode: null,
          createdby: null,
          createddate: null,
          status: null
        });
      }
    }
  }
  removeItemProjects(index) {
    if (this.roleAccessArrayProject[index].id == null) {
      this.roleAccessArrayProject.splice(index, 1);
    } else {
      this.roleAccessArrayProject[index]['REJECTED'] = true;
      this.roleAccessArrayProject.forEach((x) => {
        x.status =
          typeof x.REJECTED !== 'undefined' && x.REJECTED
            ? 'delete'
            : typeof x.status === 'undefined'
              ? 'NEW'
              : x.status;
      });
    }
  }


  getsalaryComp() {
    if (this.payrollForm.controls.rulesQuestion.value == true) {
      // this.payrollForm.controls.salary.enable();
      if (this.payrollForm.controls.salary.value !== null) {
        this.getsalaryBreakup();
      } else {
        Swal.fire({
          title: 'Info!',
          text: "Please Enter amount in Salary field",
          icon: 'info',
        });
      }
    } else {
      // this.payrollForm.controls.salary.disable();
      this.payrollForm.controls.salary.setValue(null);
      this.getsalaryComponents();
    }
  }
  submit() {
    let proceed = false;
    this.roleAccessArray.forEach(x => {
      proceed = false;
      if (x.userName !== null && x.deptRoleCode !== null) {
        proceed = true
      }
    })
    if (proceed) {
      this.spinner.show();
      // this.departmentForm.get('deptCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.departmentForm.controls.deptCode.value), { emitEvent: false });
      // this.departmentForm.get('deptName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.departmentForm.controls.deptName.value), { emitEvent: false });
      this.spinner.show();
      const obj = {
        deptDto: {
          deptCode: this.departmentForm.controls.deptCode.value.trim(),
          deptName: this.departmentForm.controls.deptName.value.trim(),
          isactive:
            this.departmentForm.controls.isactive.value == null
              ? false
              : this.departmentForm.controls.isactive.value,
        },
        accessDTOs: this.roleAccessArray,
      };
      this.httpPostService
        .create('deptwithaccess', JSON.stringify(obj))
        .subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                title: 'Success!',
                text: this.departmentForm.controls.deptName.value + ' Created',
                icon: 'success',
                timer: 10000,
              }).then(() => {
                this.utilServ.activedepartmentList = [];
                this.departmentForm.reset();
                this.roleAccessArray = [];
                this.departmentForm.controls.isactive.setValue(true);
                this.getdeptCode();
                this.closeDept();
                this.addEmployeeForm.controls.deptCode.setValue(res.response.deptDto.deptCode)

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
            console.error(err.error.status.message);
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
            });
          }
        );
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Select Role code and Username',
        icon: 'error',
      });
    }
  }
  submitDesignation() {
    this.designationForm.get('designation').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.designationForm.controls.designation.value), { emitEvent: false });
    const req = this.designationForm.value;
    req.designation = this.designationForm.controls.designation.value.trim();
    req.isManager =
      this.designationForm.controls.isManager.value == null
        ? false
        : this.designationForm.controls.isManager.value;
    req.isactive =
      this.designationForm.controls.isactive.value == null
        ? false
        : this.designationForm.controls.isactive.value;
    this.spinner.show();
    this.httpPostService
      .create('designation', this.designationForm.value)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: ' Created',
              icon: 'success',
              timer: 50000,
            }).then(() => {
              this.utilServ.activeDesignations = [];
              this.designationForm.reset();
              this.getDesignation();
              this.closeDesig();
              this.addEmployeeForm.controls.designation.setValue(res.response.designation);
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
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        }
      );
  }

  createApi() {
    let proceed = false;
    this.roleAccessArrayProject.forEach(x => {
      proceed = false;
      if (x.userName !== null && x.projectRoleCode !== null) {
        proceed = true
      }
    })
    if (proceed) {
      this.projectForm.get('categoryCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.projectForm.controls.categoryCode.value), { emitEvent: false });
      this.spinner.show();
      const obj = {
        masterDTO: {
          categoryCode: this.projectForm.controls.categoryCode.value,
          shortName: this.projectForm.controls.shortName.value,
          description: this.projectForm.controls.description.value,
          projectType: this.projectForm.controls.projectType.value,
          projectOwner: this.projectForm.controls.projectOwner.value,
          isGlobal: false,
          isVisible: true,
          isactive: true,
        },
        accessDTOs: this.roleAccessArrayProject,
      };
      this.httpPostService
        .create('projwithaccess', JSON.stringify(obj))
        .subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                title: 'Success!',
                text: this.projectForm.controls.categoryCode.value + ' Created',
                icon: 'success',
                timer: 10000,
              }).then(() => {
                this.utilServ.allProjects = [];
                this.getEmpCategory();
                this.roleAccessArrayProject = [];
                this.projectForm.controls.isactive.setValue(true);
                // this.router.navigateByUrl('setup/project');
                this.projectForm.reset();
                this.closeProj();
                this.addEmployeeForm.controls.projectCode.setValue(res.response.masterDTO.categoryCode)
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
            console.error(err);
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
            });
          }
        );
    }
    else {
      Swal.fire({
        title: 'Error!',
        text: 'Select Role code and Username',
        icon: 'error',
      });
    }
  }
  getsalaryComponents() {
    this.spinner.show();
    this.hasRules = false;
    this.hasDeductions = false;
    this.showComponentCode = false;
    this.salaryComponents = [];
    this.httpGetService.getMasterList('salarycomponents?payrollCode=' + this.payrollForm.controls.payrollCode.value).subscribe(
      (res: any) => {
        res.response.map(x => { x.pct = null, x.checkedSalary = false })
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
        const trueRecord = filteredData.find(x => x.hasRules === true);
        const hasDeductions = filteredData.find(x => x.isDeduction === true)
        if (hasDeductions) {
          this.hasDeductions = true;
        }
        if (trueRecord) {
          this.hasRules = true;
        }
        else {
          this.hasRules = false;
        }
        const sortData = filteredData.sort((a, b) => a.sortOrder - b.sortOrder);
        this.salaryComponents = sortData
        this.showComponentCode = true;
        this.spinner.hide();
        if (this.utilServ.editData || this.utilServ.viewData) {
          this.getEmpSalaryDetails(this.addEmployeeForm.controls.employeeCode.value);
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
    this.httpGetService.getMasterList('getsalbreakup?payrollCode=' + this.payrollForm.controls.payrollCode.value + '&sal=' + this.payrollForm.controls.salary.value).subscribe(
      (res: any) => {
        this.salaryComponents.forEach(x => {
          const found = res.response.find(y => y.componentCode == x.componentCode);
          if (found) {
            x.amount = found.amount
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
        this.payrollForm.controls.salary.setValue(this.totalearningAmt);
        this.salaryValue();
        this.showComponentCode = true;
        this.spinner.hide();
        // if (this.utilServ.editData || this.utilServ.viewData) {
        //   this.getEmpSalaryDetails(this.addEmployeeForm.controls.employeeCode.value);
        // }
      },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);
        // Swal.fire({
        //   title: 'Error!',
        //   text: err.error.status.message,
        //   icon: 'error',
        // });
      }
    );
  }

  // mstfrmclmn/SrtSubOrdr
  // mstformcolumns?formCode=employeeDetails
  //mst/form?formCode=employeeDetails
  async getmstfrmclmn() {
    const mstfrmclmn = [];
    this.httpGetService.getMasterList('mst/form?formCode=employeeDetails').subscribe((res: any) => {
      res.response.formColumns.forEach(element => {
        if (element.form == 'employeeDetails') {
          mstfrmclmn.push(element)
        }
      });

      // this.mstfrmclmn = res.response;
      const temporyData = [];
      const jsonList = [];
      mstfrmclmn.forEach(element => {
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
                form: element.form,
              })
            }
          });
        }
      })
      const array = mstfrmclmn.concat(jsonList)
      array.forEach(element => {
        if (element.subheadName === null) {
          temporyData.push({
            "id": element.id,
            columnCode: element.columnCode,
            columnName: element.columnName,
            array: []
          })
        }
        const index = temporyData.findIndex(x => x.columnCode === element.subheadName);
        if (index !== -1) {
          temporyData[index].array.push(element);
        }
      });
      temporyData.forEach((x) => {
        x.array.sort((a, b) => { return a.sortOrder - b.sortOrder })
      })
      this.filteredForm = temporyData
      array.forEach(field => {
        if (field.dataType == 'checkbox') {
          this.othersForm.addControl(field.columnName,
            this.formBuilder.control(false)
          );
        }
        this.othersForm.addControl(field.columnName,
          this.formBuilder.control('', field.isMandatory ? [Validators.required] : [])
        );
      });
      this.processData(array).then(() => {
        // The dropDownData should be populated now
      });
      let obj: any;
      if (this.view) {
        this.othersForm.disable();
        obj = this.utilServ.viewData;
      } else if (this.update) {
        this.othersForm.enable();
        obj = this.utilServ.editData;
      }
      if (this.update || this.view) {
        array.forEach(field => {
          if (obj.employeeDetails) {
            if (field.columnName in obj.employeeDetails) {
              if (field.columnName == 'dob') {
                this.othersForm.controls[field.columnName].setValue(moment(obj.employeeDetails[field.columnName]).format('YYYY-MM-DD'));
              }
              else {
                this.othersForm.controls[field.columnName].setValue(obj.employeeDetails[field.columnName])
              }
            }
            if (obj.employeeDetails?.employeeDetails) {
              const child = JSON.parse(obj.employeeDetails?.employeeDetails)
              if (field.columnName in child) {
                if (field.columnName == 'dob') {
                  this.othersForm.controls[field.columnName].setValue(moment(child[field.columnName]).format('YYYY-MM-DD'));
                }
                else {
                  this.othersForm.controls[field.columnName].setValue(child[field.columnName])
                }
              }
            }
          }
        });
      }

    })
  }
  getData(val): Observable<any> {
    return this.httpGetService.generalApiRequestFromDynamicForm(val);
  }
  async processData(response) {
    for (const element of response) {
      if (element.dataType === "dropdown") {
        element.dropDownData = [];
        element.defaultValues = JSON.parse(element.defaultValues);
        if (element.defaultValues?.url) {
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
      this.payrollForm.controls.salary.setValue(this.totalearningAmt);
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
    // if (this.utilServ.editData || this.utilServ.viewData) {
    //   this.payrollForm.controls.salary.setValue(amount);
    //   this.salaryValue();
    // }
  }

  onChangeBal(flatamt, row) {
    const amount = this.payrollForm.controls.salary.value - flatamt;
    const discountPerc = ((this.payrollForm.controls.salary.value - amount) / this.payrollForm.controls.salary.value) * 100;
    row.pct = parseFloat(discountPerc.toFixed(2));
    this.calCulateSalary();
    this.cdr.detectChanges();
  }
  onChangeperct(discperc, row) {
    const finalAmt = this.payrollForm.controls.salary.value - (this.payrollForm.controls.salary.value * discperc) / 100;
    const discountAmt = this.payrollForm.controls.salary.value - finalAmt;
    row.amount = parseFloat(discountAmt.toFixed(2));
    this.calCulateSalary();
  }

  checkedSalary(val, row) {
    if (this.payrollForm.controls.salary.value == null
      || this.payrollForm.controls.salary.value == undefined) {
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
          row.amount = null,
          row.checkedSalary = false
      } else {
        row.checkedSalary = true
      }
      this.calCulateSalary();
    }
  }

  getEmpCategory() {
    this.utilServ.allProjects = [];
    this.httpGetService.getMasterList('empcategorys').subscribe(
      (res: any) => {
        this.empCat = res.response;
        this.utilServ.allProjects = res.response;
        if (res.response.length == 1 && !this.view && !this.update) {
          this.addEmployeeForm.controls.projectCode.setValue(res.response[0].categoryCode)
        }
      }
    );
  }
  onEmailChange(args: string) {
    this.showSuccessEmailToolTip = 'EMAIL ALREADY EXIST';
    if (
      this.addEmployeeForm.get('email').valid &&
      this.addEmployeeForm.get('email').value !== ''
    ) {
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

  getDesignation() {
    this.httpGetService.getMasterList('desgs/active').subscribe(
      (res: any) => {
        this.designationList = res.response;
        this.utilServ.activeDesignations = res.response;
        if (res.response.length == 1 && !this.view && !this.update) {
          this.addEmployeeForm.controls.designation.setValue(res.response[0].designation)
        }
      }
    );
  }
  getCapturepolicies() {
    this.httpGetService.getMasterList('capturepolicies').subscribe(
      (res: any) => {
        this.capturesTypes = res.response;
        this.utilServ.activeCapturesTypes = res.response;
        if (res.response.length == 1 && !this.view && !this.update) {
          this.payrollForm.controls.capturePolicy.setValue(res.response[0].code)
        }
      }
    );
  }
  getPayrollCodes() {
    if (this.utilServ.payrollSetupBackup.length == 0) {
      this.httpGetService.getMasterList('payrollsetups').subscribe(
        (res: any) => {
          this.payrollsetups = res.response;
          this.utilServ.payrollSetupBackup = res.response;
          if (res.response.length == 1 && !this.view && !this.update) {
            this.payrollForm.controls.payrollCode.setValue(res.response[0].payrollCode);
            this.getsalaryComp();
          }
          else if (res.response.length > 1 && !this.view && !this.update) {
            const row = res.response.find((x) => x.isDefault == true);
            if (row) {
              this.payrollForm.controls.payrollCode.setValue(row.payrollCode)
              this.getsalaryComp();
            }
          }
        });
    } else {
      this.payrollsetups = this.utilServ.payrollSetupBackup;
      if (this.utilServ.payrollSetupBackup.length == 1 && !this.view && !this.update) {
        this.payrollForm.controls.payrollCode.setValue(this.utilServ.payrollSetupBackup[0].payrollCode);
        this.getsalaryComp();
      }
      else if (this.utilServ.payrollSetupBackup.length > 1 && !this.view && !this.update) {
        const row = this.utilServ.payrollSetupBackup.find((x) => x.isDefault == true);
        this.payrollForm.controls.payrollCode.setValue(row?.payrollCode);
        this.getsalaryComp();
      }
    }
  }
  getSupervisors() {
    this.httpGetService.getMasterList('payroll/mgrs').subscribe(
      (res: any) => {
        this.supervisors = res.response;
        if (res.response.length == 1 && !this.view && !this.update) {
          this.payrollForm.controls.supervisor.setValue(res.response[0].employeeName);
          this.payrollForm.controls.supervisorId.setValue(res.response[0].employeeCode);
        }
      }
    );
  }
  onSupervisorChange(value) {
    const row = this.supervisors.find(x => x.employeeCode == value);
    this.payrollForm.controls.supervisor.setValue(row.employeeName)
  }
  getdeptCode() {
    this.httpGetService.getMasterList('depts/active').subscribe(
      (res: any) => {
        this.deptCodes = res.response;
        this.utilServ.activedepartmentList = res.response;
        if (res.response.length == 1 && !this.view && !this.update) {
          this.addEmployeeForm.controls.deptCode.setValue(res.response[0].deptCode)
        }
      },
      (err) => {
        console.error(err.error.status.message);
        // Swal.fire({
        //   title: 'Error!',
        //   text: err.error.status.message,
        //   icon: 'error',
        // });
      }
    );
  }


  onPasswordChange() {
    if (
      this.addEmployeeForm.controls.ConfirmPassword.value ==
      this.addEmployeeForm.controls.Password.value
    ) {
      this.addEmployeeForm.controls.ConfirmPassword.setErrors(null);
    } else {
      this.addEmployeeForm.controls.ConfirmPassword.setErrors({
        mismatch: true,
      });
    }
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
      this.emp.fileName = this.addEmployeeForm.controls.employeeName.value + '_image'
    });
  }

  move() {
    this.scorllToTop();
  }

  saveEmployee(source) {
    if (source == 'onlyEmp') {
      Swal.fire({
        html: "Do you want to save changes without submitting Payroll for this employee ?",
        icon: 'info',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Save",
        cancelButtonText: "No, Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          this.createEmployee(source)

        }
        else {
          this.addEmployeeForm.controls.submitPayrollQuestion.setValue(true);
          this.getsalaryComp();
          // this.showsubmitPayrollQuestion = true;
        }
      })
    }
    else {
      const checkedEmps = this.salaryComponents.filter(x => x.checkedSalary == true)
      if (checkedEmps.length > 0 && this.payrollForm.controls.salary.value !== this.totalearningAmt) {
        Swal.fire({
          title: 'warning!',
          text: 'Total Salary is not equal to the sum of Earning Components ',
          icon: 'warning',
          timer: 10000,
        })
      } else {
        this.createEmployee(source)
      }
    }
  }


  createEmployee(source) {
    this.spinner.show();
    this.addEmployeeForm.get('employeeName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.addEmployeeForm.controls.employeeName.value), { emitEvent: false });
    this.addEmployeeForm.get('lastName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.addEmployeeForm.controls.lastName.value), { emitEvent: false });

    const req = this.othersForm.value;
    req.dob = req.dob == 'Invalid date' ? null : req.dob
    const objToCheck = {} as any; // Initialize an empty object to store the result
    if (this.fields !== null && this.fields !== undefined) {
      for (const field of this.fields['Additional Columns']) {
        const paramName = field.Param;
        // eslint-disable-next-line no-prototype-builtins
        if (req.hasOwnProperty(paramName)) {
          objToCheck[paramName] = req[paramName];
        }
      }
    }
    let doc = [];
    doc = this.empDoc.filter(x => x.image)

    const salaryComponents = [];
    this.salaryComponents.forEach(element => {
      if (element.checkedSalary && (element.amount > 0 || element.amount !== null)) {
        salaryComponents.push({
          componentCode: element.componentCode,
          amount: element.amount,
          employeeCode: this.addEmployeeForm.controls.employeeCode.value,
        });
      }
    });

    req.employeeDetails = JSON.stringify(objToCheck)
    const employeeDetails = this.othersForm.value;
    const employeeMaster = {
      image: this.emp.imageByte == '' ? null : this.emp.imageByte,
      fileType: this.emp.fileType == '' ? null : this.emp.fileType,
      fileName: this.emp.imageByte == '' ? null : this.addEmployeeForm.controls.employeeName.value + '_image',
      alternateEmail: this.addEmployeeForm.controls.alternateEmail.value,
      approved: this.addEmployeeForm.controls.approved.value,
      projectCode: this.addEmployeeForm.controls.projectCode.value,
      contactNo: this.addEmployeeForm.controls.contactNo.value,
      deptCode: this.addEmployeeForm.controls.deptCode.value,
      designation: this.addEmployeeForm.controls.designation.value,
      divisionCode: this.addEmployeeForm.controls.divisionCode.value,
      email: this.addEmployeeForm.controls.email.value,
      employeeCode: this.addEmployeeForm.controls.employeeCode.value,
      employeeName: this.addEmployeeForm.controls.employeeName.value.trim(),
      gender: this.addEmployeeForm.controls.gender.value,
      imgFileName: this.addEmployeeForm.controls.imgFileName.value,
      imgFiletype: this.addEmployeeForm.controls.imgFiletype.value,
      isactive: this.addEmployeeForm.controls.isActive.value,
      joinDate: this.addEmployeeForm.controls.joinDate.value,
      lastName: this.addEmployeeForm.controls.lastName?.value?.trim(),
      locationCode: this.addEmployeeForm.controls.locationCode.value,
      userName: this.addEmployeeForm.controls.userName.value,
    };
    const payrollMaster = {
      employeeCode: this.addEmployeeForm.controls.employeeCode.value,
      employeeRefCode: this.payrollForm.controls.employeeRefCode.value,
      divisionCode: this.addEmployeeForm.controls.divisionCode.value,
      lastName: this.addEmployeeForm.controls.lastName.value,
      bankAccountNo: this.payrollForm.controls.bankAccountNo.value,
      bankName: this.payrollForm.controls.bankName.value,
      lastWorkingDate: this.payrollForm.controls.lastWorkingDate.value,
      bankCode: this.payrollForm.controls.bankCode.value,
      bankBranch: this.payrollForm.controls.bankBranch.value,
      bankAddress: this.payrollForm.controls.bankAddress.value,
      designation:
        this.addEmployeeForm.controls.designation.value,
      deptCode:
        this.addEmployeeForm.controls.deptCode.value,
      projectCode:
        this.addEmployeeForm.controls.projectCode.value,
      employeeName: this.addEmployeeForm.controls.employeeName.value,
      aliasName: this.addEmployeeForm.controls.aliasName.value,
      employeeType: this.payrollForm.controls.employeeType.value,
      capturePolicy: this.payrollForm.controls.capturePolicy.value,
      policyCode: this.payrollForm.controls.policyCode.value,
      payrollType: this.payrollForm.controls.payrollType.value,
      payrollCode:
        this.payrollForm.controls.payrollCode.value,
      supervisor: this.payrollForm.controls.supervisor.value,
      supervisorId: this.payrollForm.controls.supervisorId.value,
      //supervisorId: this.payrollMasterForm.controls.supervisorId.value,
      // companyCode: this.utilServ.editData.payrollMaster?.companyCode,
      // branchCode: this.utilServ.editData.payrollMaster?.branchCode,
      salary: 0,
      approved: this.addEmployeeForm.controls.approved.value,
      isActive:
        this.addEmployeeForm.controls.isActive.value == null
          ? false
          : this.addEmployeeForm.controls.isActive.value,
      // createdby: this.utilServ.editData.payrollMaster?.createdby,
      //  createddate: this.utilServ.editData.payrollMaster?.createddate,
    };

    // salaryComponents
    let obj = {}
    if (source == 'onlyEmp') {
      obj = {
        employeeDetails, employeeMaster,
        documents: doc
      }
    }
    else {
      obj = {
        employeeDetails, employeeMaster,
        payrollMaster, salaryComponents,
        documents: doc
      }
    }
    this.httpPostService.create('employeeInfo', JSON.stringify(obj)).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: 'Employee ' + this.addEmployeeForm.controls.employeeName.value + ' Created',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.addEmployeeForm.reset();
            this.othersForm.reset();
            this.utilServ.AllEmployees = [];
            this.showComponentCode = false;
            this.salaryComponents = [];
            this.showSuccessEmailToolTip = '';
            this.addEmployeeForm.controls.isActive.setValue(true);
            this.addEmployeeForm.controls.submitPayrollQuestion.setValue(true);
            this.addEmployeeForm.controls.joinDate.setValue(moment().format('YYYY-MM-DD'))
            this.payrollForm.controls.payrollType.setValue(this.pytypes[0].code);
            this.update = false;
            this.addEmployeeForm.enable();
            this.othersForm.enable();
            this.payrollForm.enable();
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
      });

  }

  updateEmployeeandPayroll(source) {
    if (source !== 'onlyEmp') {
      const checkedEmps = this.salaryComponents.filter(x => x.checkedSalary == true)
      if (checkedEmps.length > 0 && this.payrollForm.controls.salary.value !== this.totalearningAmt) {
        Swal.fire({
          title: 'warning!',
          text: 'Total Salary is not equal to the sum of Earning Components ',
          icon: 'warning',
          timer: 10000,
        })
      } else {
        this.updateEmployee(source);
      }
    }
    else {
      this.updateEmployee(source);
    }
  }

  updateEmployee(source) {
    this.spinner.show();
    this.addEmployeeForm.get('employeeName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.addEmployeeForm.controls.employeeName.value), { emitEvent: false });
    this.addEmployeeForm.get('lastName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.addEmployeeForm.controls.lastName.value), { emitEvent: false });
    const req = this.othersForm.value;
    req.dob = req.dob == 'Invalid date' ? null : req.dob;
    const objToCheck = {} as any; // Initialize an empty object to store the result
    if (this.fields !== null && this.fields !== undefined) {
      for (const field of this.fields['Additional Columns']) {
        const paramName = field.Param;
        // eslint-disable-next-line no-prototype-builtins
        if (req.hasOwnProperty(paramName)) {
          objToCheck[paramName] = req[paramName];
        }
      }
    }
    let doc = [];
    doc = this.empDoc.filter(x => x.image)
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
          employeeCode: this.utilServ.editData.employeeMaster?.employeeCode,
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
          employeeCode: this.utilServ.editData.employeeMaster?.employeeCode,
          "componentCode": payrollComp.componentCode,
          "amount": payrollComp.amount
        })
      }
    }
    req.employeeDetails = JSON.stringify(objToCheck)
    // const obj = {
    const employeeDetails = this.othersForm.value;
    const employeeMaster = {
      image: this.emp.imageByte == '' ? null : this.emp.imageByte,
      fileType: this.emp.fileType == '' ? null : this.emp.fileType,
      fileName: this.emp.imageByte == '' ? null : this.addEmployeeForm.controls.employeeName.value + '_image',
      alternateEmail: this.addEmployeeForm.controls.alternateEmail.value,
      approved: this.addEmployeeForm.controls.approved.value,
      projectCode: this.addEmployeeForm.controls.projectCode.value,
      contactNo: this.addEmployeeForm.controls.contactNo.value,
      deptCode: this.addEmployeeForm.controls.deptCode.value,
      designation: this.addEmployeeForm.controls.designation.value,
      divisionCode: this.utilServ.editData.employeeMaster.divisionCode,
      email: this.addEmployeeForm.controls.email.value,
      employeeCode: this.addEmployeeForm.controls.employeeCode.value,
      employeeName: this.addEmployeeForm.controls.employeeName.value.trim(),
      gender: this.addEmployeeForm.controls.gender.value,
      imgFileName: this.addEmployeeForm.controls.imgFileName.value,
      imgFiletype: this.addEmployeeForm.controls.imgFiletype.value,
      isactive: this.addEmployeeForm.controls.isActive.value,
      joinDate: this.addEmployeeForm.controls.joinDate.value,
      lastName: this.addEmployeeForm.controls.lastName?.value?.trim(),
      locationCode: this.addEmployeeForm.controls.locationCode.value,
      userName: this.addEmployeeForm.controls.userName.value,
      branchCode: this.utilServ.editData.employeeMaster.branchCode,
      companyCode: this.utilServ.editData.employeeMaster.companyCode,
      createdby: this.utilServ.editData.employeeMaster.createdby,
      employeeid: this.utilServ.editData.employeeMaster.employeeid,
      isAdmin: this.utilServ.editData.employeeMaster.isAdmin,
      createddate: this.utilServ.editData.employeeMaster.createddate,
    };
    const payrollMaster = {
      employeeid: this.utilServ.editData.payrollMaster?.employeeid,
      employeeCode: this.addEmployeeForm.controls.employeeCode.value,
      employeeRefCode: this.payrollForm.controls.employeeRefCode.value,
      divisionCode: this.addEmployeeForm.controls.divisionCode.value,
      lastName: this.addEmployeeForm.controls.lastName.value,
      bankAccountNo: this.payrollForm.controls.bankAccountNo.value,
      bankName: this.payrollForm.controls.bankName.value,
      bankCode: this.payrollForm.controls.bankCode.value,
      bankBranch: this.payrollForm.controls.bankBranch.value,
      bankAddress: this.payrollForm.controls.bankAddress.value,
      designation:
        this.addEmployeeForm.controls.designation.value,
      deptCode:
        this.addEmployeeForm.controls.deptCode.value,
      projectCode:
        this.addEmployeeForm.controls.projectCode.value,
      employeeName: this.addEmployeeForm.controls.employeeName.value,
      aliasName: this.addEmployeeForm.controls.aliasName.value,
      employeeType: this.payrollForm.controls.employeeType.value,
      capturePolicy: this.payrollForm.controls.capturePolicy.value,
      policyCode: this.payrollForm.controls.policyCode.value,

      payrollType: this.payrollForm.controls.payrollType.value,
      payrollCode:
        this.payrollForm.controls.payrollCode.value,
      lastWorkingDate: this.payrollForm.controls.lastWorkingDate.value,
      supervisor: this.payrollForm.controls.supervisor.value,
      supervisorId: this.payrollForm.controls.supervisorId.value,

      //supervisorId: this.payrollMasterForm.controls.supervisorId.value,
      companyCode: this.utilServ.editData.payrollMaster?.companyCode,
      branchCode: this.utilServ.editData.payrollMaster?.branchCode,
      salary: 0,
      approved: this.addEmployeeForm.controls.approved.value,
      isActive: this.utilServ.editData.payrollMaster?.isActive,
      createdby: this.utilServ.editData.payrollMaster?.createdby,
      createddate: this.utilServ.editData.payrollMaster?.createddate,
    };
    // salaryComponents
    let obj = {}
    if (source == 'onlyEmp') {
      obj = {
        employeeDetails, employeeMaster,
        documents: doc
      }
    }
    else {
      obj = {
        employeeDetails, employeeMaster,
        payrollMaster, salaryComponents,
        documents: doc
      }
    }
    this.httpPutServ.doPut('employeeInfo', JSON.stringify(obj)).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: 'Employee ' + this.addEmployeeForm.controls.employeeName.value + ' Updated',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.addEmployeeForm.reset();
            this.othersForm.reset();
            this.utilServ.AllEmployees = [];
            this.showComponentCode = false;
            this.salaryComponents = [];
            this.showSuccessEmailToolTip = '';
            this.addEmployeeForm.controls.isActive.setValue(true);
            this.addEmployeeForm.controls.submitPayrollQuestion.setValue(true);
            this.addEmployeeForm.controls.joinDate.setValue(moment().format('YYYY-MM-DD'))
            this.payrollForm.controls.payrollType.setValue(this.pytypes[0].code);
            this.update = false;
            this.addEmployeeForm.enable();
            this.othersForm.enable();
            this.payrollForm.enable();
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
      });
  }

  ngOnDestroy() {
    this.update = false;
    this.view = false;
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
    this.salaryComponents = [];
  }

  closeDept() {
    const closeButton = document.querySelector('.closeDept') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  }
  closeProj() {
    const closeButton = document.querySelector('.closePrj') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  }
  closeDesig() {
    const closeButton = document.querySelector('.closeDesig') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  }
  extractMimeType(dataUrl: string): string {
    const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    return match ? match[1] : '';
  }
  openFileInput(inputId: string) {
    document.getElementById(inputId).click();
  }
  previewRow(data) {
    this.PreviewObject = data
  }

  getBase64(ev: any, row: any) {
    const maxSize = 10485760; // 10 MB in bytes

    const found = this.empDoc.findIndex(x => { x.documentName == row.documentName && (x.image !== null || x.image !== undefined) })
    let base64Result: any;
    if (ev.target.files.length > 0 && ev.target.files[0].size < maxSize) {
      // const file = ev.target.files[0];
      const file = ev.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // output.src = reader.result;
        base64Result = reader.result;
        if (base64Result !== null) {
          // const base64 = base64Result?.replace('data:application/pdf;base64,', '');
          // const base64 = base64Result?.replace(/^[^,]+,/, '');
          const base64 = base64Result?.replace(/^data:.*?;base64,/, '');
          const mimeType = this.extractMimeType(base64Result);
          if (found == -1) {
            const obj = this.empDoc.find(x => x.documentName == row.documentName);
            obj.imageByteCode = base64Result;
            obj.image = base64;
            obj.isDeleted = false;
            obj.fileName = file.name;
            obj.documentType = mimeType,
              obj.fileType = file.name.split('.').pop();
            obj.fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(base64Result);
          } else {
            const index = this.empDoc.findIndex(x => x.documentName == row.documentName)
            this.empDoc[index].imageByteCode = base64Result;
            this.empDoc[index].image = base64;
            this.empDoc[index].fileName = file.name;
            this.empDoc[index].isDeleted = false;
            this.empDoc[index].documentType = mimeType,
              this.empDoc[index].documentName = row.documentName,
              this.empDoc[index].fileType = file.name.split('.').pop();
            this.empDoc[index].fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(base64Result);
          }
        }
      }
    }
    else {
      Swal.fire({
        title: 'Info',
        html: 'File size exceeds the limit of 10 Mb',
        icon: 'warning',
      })
    }
  }

  getdocuments(empCode) {
    this.httpGetService.getMasterList('empDocuments?empCode=' + empCode).subscribe((res: any) => {
      const docRes = res.response;
      this.empDoc.forEach((element) => {
        const find = docRes.find(x => x.documentName == element.documentName)
        if (find) {
          element.image = find.image;
          element.documentType = find.documentType
          element.fileName = find.fileName
          element.fileType = find.fileType
          element.imageByteCode = 'data:' + find.documentType + ';base64,' + find.image
          element.docId = find.docId
          element.createddate = find.createddate
          element.createdby = find.createdby
          element.branchCode = find.branchCode
          element.companyCode = find.companyCode
          element.fileContent = this.sanitizer.bypassSecurityTrustResourceUrl(element.imageByteCode);
        }
      })
    })
  }

}
