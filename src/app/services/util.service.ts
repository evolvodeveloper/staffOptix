import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  theseComponentsShouldBeHiden = ['Late Arrival Deduction', 'WorkHours Deduction', 'No Show Deduction', 'Total Salary', 'OT Allowance', 'Loan Recover']
  showGif: boolean = false;
  userProfileData: any;
  viewData;
  editData;
  approveData;
  offerTemplates = [];
  dateInExp;
  langCode: number;
  // using this for search bar
  universalSerchedData;
  allPayrollEmpDept;

  planStatus;
  menuData = [];
  // using in emp dashbord for timer
  todayTimeSheetRecord: any;

  // secusers
  secusersApiData = [];
  secUserNames = [];
  //OT Setup
  getAllOtSetups = [];

  // department
  activedepartmentList = [];
  allDepartments = [];

  // Designations
  allDesignations = [];
  activeDesignations = [];

  allCumstomFeilds = [];

  // employees
  AllEmployees = [];
  allEmpForList = [];
  // expenses
  AllExpenses = [];
  expensesByEmp = [];
  // device location
  devicelocationListBackup = [];
  // devices
  devicesListBackup = [];

  // Calendars
  allCalendars = [];

  // Projects 
  allProjects = [];

  // leavePlan
  leaveSetupBackup = [];
  leavePlanbackup = [];

  leaveTypesBackup = [];

  // office location get all
  allOfficeLocationsList = [];
  // payrollsetup
  payrollSetupBackup = [];
  payrollSetupResBackup = [];

  // salary component
  salaryComponents = [];
  // payrules componeng 
  payrulesBackup = [];
  branchApiData: any;
  activeCapturesTypes = [];
  allVisitConfigs: any;
  visitConfigIds: any;

  constructor(private router: Router) { }

  isTokenExpired() {
    const JWT = localStorage.getItem('token');
    if (JWT) {
    const jwtPayload = JSON.parse(window.atob(JWT.split('.')[1]));
    const isExpired =
      Math.floor(new Date().getTime() / 1000) >= jwtPayload.exp;
    if (isExpired) {
      // this.router.navigateByUrl('dashboard');
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        timer: 10000,
        text: 'You were logged out of the website due to token expiration.',
      }).then(() => {
        this.logout();
      });
    }
    } else {
      this.logout();
    }
  }

  logout(): void {
    // localStorage.clear();
    this.showGif = false;
    localStorage.removeItem('user-data');
    localStorage.removeItem('token');
    localStorage.removeItem('branch');
    localStorage.removeItem('branchCode');
    this.router.navigateByUrl('auth');
  }


}
