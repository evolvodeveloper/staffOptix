import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExcelService } from 'src/app/services/excel.service';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { EmployeeListViewComponent } from './employee-list-view/employee-list-view.component';
@Component({
  selector: 'app-all-payroll-employees',
  templateUrl: './all-payroll-employees.component.html',
  styleUrls: ['./all-payroll-employees.component.scss'],
})
export class AllPayrollEmployeesComponent implements OnInit, OnDestroy {
  className = 'AllPayrollEmployeesComponent';
  employees_list = [];
  allEmpRecods = [];
  allEmpRecordsTemp = [];
  temp = [];
  departments_list: any[];
  sortOrderby = 'byEmpName';
  selected_department = 'all';
  selected_departmentinFalse = 'all';

  hasPermissionToApprove = false;
  hasPermissionToUpdate = false;
  config: any;
  employees_listConfig: any;
  sortOrder = 'desc';
  sortColumn = 'employeeName';
  searchedFor: string;
  searchedInfalse: string;
  showGridView = true;
  showListView = false;
  iAmFromDir: boolean;

  // these are for popup starts
  emp: any = {
    fileName: '',
    fileType: '',
    image: '',
    imageByte: '',
  }
  // these are for popup ends
  empList = [];
  constructor(
    public dialog: MatDialog,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private acRoute: ActivatedRoute,
    private excelService: ExcelService,
    private httpGet: HttpGetService,
    private router: Router,
    public globalServ: GlobalvariablesService,
    private httpPutServ: HttpPutService

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.allEmpRecods.length,
    };
    this.employees_listConfig = {
      itemsPerPage: 12,
      currentPage: 1,
      totalItems: this.employees_list.length,
    };

  }

  ngOnInit(): void {
    this.globalServ.getMyCompLabels('employeeMaster');
    this.globalServ.getMyCompPlaceHolders('employeeMaster');
    this.acRoute.data.subscribe(async data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission?.hasPermissionToUpdate
      this.hasPermissionToApprove = permission?.hasPermissionToApprove
    });
    if (this.router.url === '/all-payroll-employees') {
      this.iAmFromDir = true;
      // this.globalServ.getMyCompLabels('departmentMaster');
      // this.globalServ.getMyCompPlaceHolders('departmentMaster');

      // this.globalServ.getMyCompLabels('projectMaster');
      // this.globalServ.getMyCompPlaceHolders('projectMaster');
    }
    else if (this.router.url === '/empList') {
      this.iAmFromDir = false;
    }
    if (this.utilServ.activedepartmentList.length > 0) {
      this.departments_list = this.utilServ.activedepartmentList;
    } else {
      this.getDepartments();
    }

    if (this.utilServ.universalSerchedData?.list == this.iAmFromDir) {
      if (this.className == this.utilServ.universalSerchedData?.componentName) {
        this.searchedFor = this.utilServ.universalSerchedData?.searchedText;
        this.searchedInfalse = this.utilServ.universalSerchedData?.searchedinFalseText;
      }
    } else {
      this.searchedFor = undefined;
      this.searchedInfalse = undefined;
    }
    if (this.utilServ.allPayrollEmpDept?.list == this.iAmFromDir) {
      this.selected_department = this.utilServ.allPayrollEmpDept?.forTrueList == undefined ? 'all' : this.utilServ.allPayrollEmpDept?.forTrueList;
      this.selected_departmentinFalse = this.utilServ.allPayrollEmpDept?.forFalseList == undefined ? 'all' : this.utilServ.allPayrollEmpDept?.forFalseList;
    }

    if (this.iAmFromDir) {
      if (this.utilServ.AllEmployees.length > 0) {
        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.temp = this.utilServ.AllEmployees;
          this.employees_list = this.utilServ.AllEmployees.filter(function (d) {
            return (d.employeeMaster && d.employeeMaster.employeeName.toLowerCase().indexOf(val) !== -1) ||
              (d.employeeMaster && d.employeeMaster.employeeCode.toLowerCase().indexOf(val) !== -1) ||
              (d.payrollMaster && d.payrollMaster.aliasName && d.payrollMaster.aliasName.toLowerCase().indexOf(val) !== -1) ||
              !val;
          });
          this.employees_listConfig.totalItems = this.employees_list.length;
          this.employees_listConfig.currentPage = 1;
        } else {
          this.employees_list = this.utilServ.AllEmployees;
          this.temp = this.utilServ.AllEmployees;
          this.makeSort();
        }
      } else {
        this.employeesByDepartment();
      }
      this.employeesByDepartmentinFalse();
    }
    else {
      this.listOfEmployeesForEMpListMenu(this.selected_department);
    }
  }
  listOfEmployeesForEMpListMenu(dept) {
    this.selected_departmentinFalse = dept;
    this.selected_department = dept;
    this.spinner.show();
    this.httpGet
      .getMasterList('employeeList?dept=' + dept + '&isactive=false&image=true')
      .subscribe(
        (res: any) => {
          const empRecords = res.response.map(x => {
            x.employeeMaster.empShortName = null;
            x.employeeMaster.bgColor = null;
            if (x.employeeMaster.fileType !== null && x.employeeMaster.empImage !== null && x.employeeMaster.empImage !== undefined && x.employeeMaster.empImage !== '') {
              x.employeeMaster.imageByte = x.employeeMaster.empImage
              const header = 'data:image/' + x.employeeMaster.fileType + ';base64,';
              x.employeeMaster.empImage = header.concat(x.employeeMaster.empImage)
            }
            x.employeeMaster.empShortName = this.getInitials(x.employeeMaster?.employeeName, x.employeeMaster?.lastName);
            x.employeeMaster.bgColor = this.getRandomColor();
            return x;
          })
          const empList = empRecords.sort((a, b) => {
            return a.employeeMaster.employeeName - b.employeeMaster.employeeName
          });
          if (this.searchedFor !== '' && this.searchedFor !== undefined) {
            const val = this.searchedFor.toLowerCase();
            this.employees_list = empList.filter(function (d) {
              return (d.employeeMaster && d.employeeMaster.employeeName.toLowerCase().indexOf(val) !== -1) ||
                (d.employeeMaster && d.employeeMaster.employeeCode.toLowerCase().indexOf(val) !== -1) ||
                (d.payrollMaster && d.payrollMaster.aliasName && d.payrollMaster.aliasName.toLowerCase().indexOf(val) !== -1) ||
                !val && d.employeeMaster.isactive == true;
            });
          }
          else {
            this.employees_list = empList.filter(x => x.employeeMaster.isactive == true)
          }

          if (this.searchedInfalse !== '' && this.searchedInfalse !== undefined) {
            const val = this.searchedInfalse.toLowerCase()
            this.allEmpRecods = empList.filter(function (d) {
              return (d.employeeMaster && d.employeeMaster.employeeName.toLowerCase().indexOf(val) !== -1) ||
                (d.employeeMaster && d.employeeMaster.employeeCode.toLowerCase().indexOf(val) !== -1) ||
                (d.payrollMaster && d.payrollMaster.aliasName && d.payrollMaster.aliasName.toLowerCase().indexOf(val) !== -1) ||
                !val
            });
          }
          else {
            this.allEmpRecods = empList
          }
          this.allEmpRecordsTemp = empList;
          this.temp = empList.filter(x => x.employeeMaster.isactive == true);
          this.utilServ.allEmpForList = empRecords;
          this.employees_listConfig.currentPage = 1;
          this.config.currentPage = 1;
          this.makeSort();
          this.spinner.hide();

        },
        (err) => {
          this.spinner.hide();
          console.error(err.error.status.message);
        }
      );
  }
  makeSort(): void {
    const sortOrder = 'asc'
    if (this.sortOrderby == 'byEmpName') {
      this.employees_list = this.employees_list.sort((a, b) => {
        if (a.employeeMaster.employeeName < b.employeeMaster.employeeName) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        return 0;
      });
      this.allEmpRecods = this.allEmpRecods.sort((a, b) => {
        if (a.employeeMaster.employeeName < b.employeeMaster.employeeName) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        return 0;
      });
    }
    else if (this.sortOrderby == 'byEmpCode') {
      this.employees_list = this.employees_list.sort((a, b) => {
        if (a.employeeMaster.employeeCode < b.employeeMaster.employeeCode) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        return 0;
      });
      this.allEmpRecods = this.allEmpRecods.sort((a, b) => {
        if (a.employeeMaster.employeeCode < b.employeeMaster.employeeCode) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        return 0;
      });
    }
    else if (this.sortOrderby == 'byEmpLastName') {
      this.employees_list = this.employees_list.sort((a, b) => {
        if (a?.employeeMaster?.lastName < b?.employeeMaster?.lastName) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        return 0;
      });
      this.allEmpRecods = this.allEmpRecods.sort((a, b) => {
        if (a.employeeMaster.lastName < b.employeeMaster.lastName) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        return 0;
      });

    }
    this.employees_listConfig.currentPage = 1;
    this.config.currentPage = 1;
  }
  sortData(col: string): void {
    if (this.sortColumn === col) {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      }
      else {
        this.sortOrder = 'asc';
      }
    }
    else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.allEmpRecods = this.allEmpRecods.sort((a, b) => {
      if (a.employeeMaster[col] < b.employeeMaster[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a.employeeMaster[col] > b.employeeMaster[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getDepartments() {
    this.httpGet.getMasterList('depts/active').subscribe((res: any) => {
      this.departments_list = res.response;
      this.utilServ.activedepartmentList = res.response;
    },
      err => {
        console.error(err.error.status.message);
      });
  }

  getInitials(firstName: string, lastName: string) {
    const firstInitial = firstName ? firstName?.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`;
  }

  getEmployees() {
    this.spinner.show();
    this.httpGet
      .getMasterList('getEmployeeInfo?isactive=true')
      .subscribe(
        (res: any) => {
          res.response.forEach(x => {
            if (x.employeeMaster !== null) {
              x.employeeMaster.empShortName = null;
              x.employeeMaster.bgColor = null;
              if (x.employeeMaster.fileType !== null && x.employeeMaster.empImage !== null && x.employeeMaster.empImage !== undefined && x.employeeMaster.empImage !== '') {
                x.employeeMaster.imageByte = x.employeeMaster.empImage
                const header = 'data:image/' + x.employeeMaster.fileType + ';base64,';
                x.employeeMaster.empImage = header.concat(x.employeeMaster.empImage)
              }
              x.employeeMaster.empShortName = this.getInitials(x.employeeMaster?.employeeName, x.employeeMaster?.lastName);
              x.employeeMaster.bgColor = this.getRandomColor();
            }
          })
          const employees_list = res.response.sort((a, b) => {
            return a.employeeMaster.employeeName - b.employeeMaster.employeeName
          });
          if (this.searchedFor !== '' && this.searchedFor !== undefined) {
            const val = this.searchedFor.toLowerCase();
            this.employees_list = employees_list.filter(function (d) {
              return (d.employeeMaster && d.employeeMaster.employeeName.toLowerCase().indexOf(val) !== -1) ||
                (d.employeeMaster && d.employeeMaster.employeeCode.toLowerCase().indexOf(val) !== -1) ||
                (d.payrollMaster && d.payrollMaster.aliasName && d.payrollMaster.aliasName.toLowerCase().indexOf(val) !== -1) ||
                !val
            });
          }
          else {
            this.employees_list = employees_list
          }
          this.temp = employees_list
          this.utilServ.AllEmployees = res.response;
          this.employees_listConfig.currentPage = 1;
          this.makeSort();
          this.spinner.hide();

        },
        (err) => {
          this.spinner.hide();
          console.error(err.error.status.message);
        }
      );
  }
  // /api/empswithpayroll / dept ? department = IT - BE & isactive=true & pageNo=3 & noOfRec=3 & image=true

  getEmpList() {
    this.spinner.show();
    if (this.utilServ.universalSerchedData?.list == this.iAmFromDir) {
      this.searchedInfalse = this.utilServ.universalSerchedData?.searchedinFalseText;
    } else {
      this.searchedInfalse = undefined;
    }
    this.httpGet
      .getMasterList('empswithpayroll?dept=' + this.selected_departmentinFalse + '&isactive=false&image=true')
      .subscribe(
        (res: any) => {
          res.response.map(x => {
            if (x.employeeMaster !== null) {
              if (x.employeeMaster.fileType !== null && x.employeeMaster.empImage !== null && x.employeeMaster.empImage !== undefined && x.employeeMaster.empImage !== '') {
                x.employeeMaster.imageByte = x.employeeMaster.empImage
                const header = 'data:image/' + x.employeeMaster.fileType + ';base64,';
                x.employeeMaster.empImage = header.concat(x.employeeMaster.empImage)
              }
            }
          })
          const employees_list = res.response.sort((a, b) => {
            return a.employeeMaster.employeeName - b.employeeMaster.employeeName
          });
          if (this.searchedInfalse !== '' && this.searchedInfalse !== undefined) {
            const val = this.searchedInfalse.toLowerCase()
            this.allEmpRecods = employees_list.filter(function (d) {
              return (d.employeeMaster && d.employeeMaster.employeeName.toLowerCase().indexOf(val) !== -1) ||
                (d.employeeMaster && d.employeeMaster.employeeCode.toLowerCase().indexOf(val) !== -1) ||
                (d.payrollMaster && d.payrollMaster.aliasName && d.payrollMaster.aliasName.toLowerCase().indexOf(val) !== -1) ||
                !val
            });
          }
          else {
            this.allEmpRecods = employees_list
          }
          this.spinner.hide();
          this.allEmpRecordsTemp = res.response;
          this.config.currentPage = 1;
          this.makeSort();
        },
        (err) => {
          this.spinner.hide();
          console.error(err.error.status.message);
        })
  }
  back() {
    this.router.navigateByUrl('/dashboard');
  }
  employeesByDepartment() {
    if (this.iAmFromDir) {
      this.spinner.show();
      if (this.selected_department != 'all') {
        this.utilServ.allPayrollEmpDept = {
          forTrueList: this.selected_department,
          forFalseList: this.selected_departmentinFalse,
          list: this.iAmFromDir
        }
        this.httpGet
          .getMasterList('empswithpayroll?dept=' + this.selected_department + '&image=true')
          .subscribe((res: any) => {
            res.response.map(x => {
              if (x.employeeMaster !== null) {
                x.employeeMaster.empShortName = null;
                x.employeeMaster.bgColor = null;
                if (x.employeeMaster.fileType !== null && x.employeeMaster.empImage !== null && x.employeeMaster.empImage !== undefined && x.employeeMaster.empImage !== '') {
                  x.employeeMaster.imageByte = x.employeeMaster.empImage
                  const header = 'data:image/' + x.employeeMaster.fileType + ';base64,';
                  x.employeeMaster.empImage = header.concat(x.employeeMaster.empImage)
                }
                x.employeeMaster.empShortName = this.getInitials(x.employeeMaster?.employeeName, x.employeeMaster?.lastName);
                x.employeeMaster.bgColor = this.getRandomColor();
              }
            })
            const employees_list = res.response.sort((a, b) => {
              return a.employeeMaster.employeeName - b.employeeMaster.employeeName
            });
            if (this.searchedFor !== '' && this.searchedFor !== undefined) {
              const val = this.searchedFor.toLowerCase();
              this.employees_list = employees_list.filter(function (d) {
                return (d.employeeMaster && d.employeeMaster.employeeName.toLowerCase().indexOf(val) !== -1) ||
                  (d.employeeMaster && d.employeeMaster.employeeCode.toLowerCase().indexOf(val) !== -1) ||
                  (d.payrollMaster && d.payrollMaster.aliasName && d.payrollMaster.aliasName.toLowerCase().indexOf(val) !== -1) ||
                  !val
              });
            } else {
              this.employees_list = employees_list;
            }
            this.temp = employees_list;
            this.utilServ.AllEmployees = employees_list;
            this.employees_listConfig.currentPage = 1;
            this.employees_listConfig.totalItems = employees_list.length;
            this.spinner.hide();
            // this.sortData(this.sortColumn)
          },
            (err) => {
              this.spinner.hide();
              console.error(err.error.status.message);
            });
      } else {
        this.getEmployees();
      }
    } else {
      this.listOfEmployeesForEMpListMenu(this.selected_department)
    }
  }
  employeesByDepartmentinFalse() {
    if (this.iAmFromDir) {
      this.spinner.show();
      if (this.selected_departmentinFalse != 'all') {
        this.utilServ.allPayrollEmpDept = {
          forTrueList: this.selected_department,
          forFalseList: this.selected_departmentinFalse,
          list: this.iAmFromDir
        }
        this.searchedInfalse = this.utilServ.universalSerchedData?.searchedinFalseText;
        this.httpGet.getMasterList('empswithpayroll?isactive=false&dept=' + this.selected_departmentinFalse + '&image=true')
          .subscribe((res: any) => {
            res.response.map(x => {
              if (x.employeeMaster !== null) {
                if (x.employeeMaster.fileType !== null && x.employeeMaster.empImage !== null && x.employeeMaster.empImage !== undefined && x.employeeMaster.empImage !== '') {
                  x.employeeMaster.imageByte = x.employeeMaster.empImage
                  const header = 'data:image/' + x.employeeMaster.fileType + ';base64,';
                  x.employeeMaster.empImage = header.concat(x.employeeMaster.empImage)
                }
              }
            })
            const employees_list = res.response.sort((a, b) => {
              return a.employeeMaster.employeeName - b.employeeMaster.employeeName
            });
            if (this.searchedInfalse !== '' && this.searchedInfalse !== undefined) {
              const val = this.searchedInfalse.toLowerCase();
              this.allEmpRecods = employees_list.filter(function (d) {
                return (d.employeeMaster && d.employeeMaster.employeeName.toLowerCase().indexOf(val) !== -1) ||
                  (d.employeeMaster && d.employeeMaster.employeeCode.toLowerCase().indexOf(val) !== -1) ||
                  (d.payrollMaster && d.payrollMaster.aliasName && d.payrollMaster.aliasName.toLowerCase().indexOf(val) !== -1) ||
                  !val
              });
            }
            else {
              this.allEmpRecods = employees_list
            }
            // this.allEmpRecods = employees_list;
            this.allEmpRecordsTemp = employees_list;
            this.config.currentPage = 1;
            // this.sortData(this.sortColumn)
            this.makeSort();
            this.spinner.hide();

          });
      } else {
        this.getEmpList();
      }
    }
    else {
      this.listOfEmployeesForEMpListMenu(this.selected_departmentinFalse)
    }
  }

  create() {
    // this.router.navigateByUrl('setup/empList/reg1')
    this.router.navigateByUrl('all-payroll-employees/addEmployee');
  }

  editEmployee(obj) {
    // this.openAddEmployeeDialog(obj, val);
    this.utilServ.editData = obj;
    if (this.iAmFromDir) {
      this.router.navigateByUrl('all-payroll-employees/addEmployee');
    }
    else {
      this.router.navigateByUrl('empList/empListView');
    }
    // this.router.navigateByUrl('setup/empList/reg1')
  }
  viewEmployee(obj) {
    this.utilServ.viewData = obj;
    if (this.iAmFromDir) {
      this.router.navigateByUrl('all-payroll-employees/addEmployee');
    }
    else {
      const data = {
        prop4: this.className,
        value: this.utilServ.viewData
      };

      const modalRef = this.modalService.open(EmployeeListViewComponent, {
        windowClass: 'myCustomModalClass',
        backdrop: 'static',
      });
      modalRef.componentInstance.fromParent = data;
    }
  }

  deleteEmployee() {
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
        // delete
      }
    });
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.employees_list = this.temp;
    } else {
      const temp = this.temp.filter(function (d) {
        return (d.employeeMaster && d.employeeMaster.employeeName.toLowerCase().indexOf(val) !== -1) ||
          (d.employeeMaster && d.employeeMaster.employeeCode.toLowerCase().indexOf(val) !== -1) ||
          (d.payrollMaster && d.payrollMaster.aliasName && d.payrollMaster?.aliasName.toLowerCase().indexOf(val) !== -1) ||
          !val;
      });
      this.employees_list = temp;
    }
    this.employees_listConfig.totalItems = this.employees_list.length;
    this.employees_listConfig.currentPage = 1;
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchedFor,
      searchedinFalseText: this.searchedInfalse,
      list: this.iAmFromDir
    }
  }
  updateFilterIsactiveFalse(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.allEmpRecods = [...this.allEmpRecordsTemp];
    } else {
      const temp = this.allEmpRecordsTemp.filter(function (d) {
        return (d.employeeMaster && d.employeeMaster.employeeName.toLowerCase().indexOf(val) !== -1) ||
          (d.employeeMaster && d.employeeMaster.employeeCode.toLowerCase().indexOf(val) !== -1) ||
          (d.payrollMaster && d.payrollMaster.aliasName && d.payrollMaster.aliasName.toLowerCase().indexOf(val) !== -1) ||
          !val
      });
      this.allEmpRecods = temp;
    }
    this.config.totalItems = this.allEmpRecods.length;
    this.config.currentPage = 1;
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchedFor,
      searchedinFalseText: this.searchedInfalse,
      list: this.iAmFromDir
    }
  }

  getRandomColor() {  // Generate a random RGB color  
    const r = Math.floor(Math.random() * 256); const g = Math.floor(Math.random() * 256); const b = Math.floor(Math.random() * 256);
    // Convert RGB values to a CSS color string 
    return `rgb(${r}, ${g}, ${b})`;
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }


  changeTOGrid() {
    this.showGridView = false;
    this.showListView = true;
  }

  changeTOList() {
    this.showGridView = true;
    this.showListView = false;
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }
  pageChangedEmployees_list(event) {
    this.employees_listConfig.currentPage = event;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.allEmpRecordsTemp.length : event.target.value;
    this.config.currentPage = 1;
  }

  resultsPerPageEmpList(event) {
    this.employees_listConfig.itemsPerPage =
      event.target.value == 'all' ? this.employees_list.length : event.target.value;
    this.employees_listConfig.currentPage = 1;
  }


  approveEmployee(obj) {
    this.spinner.show();
    const req = obj.payrollMaster;
    req.approved = true;

    this.httpPutServ.doPut('payroll/approve', req).subscribe((res: any) => {
      this.spinner.hide();
      if (res?.status?.message == 'SUCCESS') {
        req.approved = true;
        this.employeesByDepartmentinFalse();
        Swal.fire({
          title: 'Success!',
          text: 'Employee Approved',
          icon: 'success',
          timer: 10000,
        })
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
      });


  }
  saveExcel() {
    this.spinner.show();
    const transformedData = [];
    this.employees_list.forEach((item) => {
      const obj = {
        // "Employee Id": item.employeeMaster.employeeid,
        "Employee Code": item.employeeMaster.employeeCode == null ? '' : item.employeeMaster.employeeCode,
        "Employee Name": item.employeeMaster.employeeName == null ? '' : item.employeeMaster.employeeName,
        "Last Name": item.employeeMaster.lastName == null ? '' : item.employeeMaster.lastName,
        "Gender": item.employeeMaster.gender == null ? '' : item.employeeMaster.gender,
        "Email": item.employeeMaster.email == null ? '' : item.employeeMaster.email,
        // "Alternate Email": item.employeeMaster.alternateEmail,
        "Contact No": item.employeeMaster.contactNo == null ? '' : item.employeeMaster.contactNo,
        "Designation": item.employeeMaster.designation == null ? '' : item.employeeMaster.designation,
        "Department": item.employeeMaster.deptCode == null ? '' : item.employeeMaster.deptCode,
        // "Project Code": item.employeeMaster.projectCode,
        "Location Code": item.employeeMaster.locationCode == null ? '' : item.employeeMaster.locationCode
        // "User Name": item.employeeMaster.userName,
        // "Join Date": item.employeeMaster.joinDate,
        // "Division Code": item.employeeMaster.divisionCode,
        // "Branch Code": item.employeeMaster.branchCode,
        // "Company Code": item.employeeMaster.companyCode,
        // "Is Active": item.employeeMaster.isactive,
        // "Is Admin": item.employeeMaster.isAdmin,

        // "Identification Type": item.employeeMaster.identificationType,
        // "Identification Id": item.employeeMaster.identificationId,
        // "Suprevisor": item.employeeMaster.suprevisor,
        // "Payroll Code": item.payrollMaster?.payrollCode,
        // "ESI": empInfo.ESI,
        // "UAN": empInfo.UAN,
      }
      transformedData.push(obj);
    });
    this.spinner.hide();
    const fileName = "Employee's Data";
    this.excelService.exportAsExcelFileNoColor(transformedData, fileName);
  }
}
