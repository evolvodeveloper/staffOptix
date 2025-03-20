import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExcelService } from 'src/app/services/excel.service';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';

// const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-employee-information',
  standalone: false,
  templateUrl: './employee-information.component.html',
  styleUrl: './employee-information.component.scss'
})
export class EmployeeInformationComponent {
  empInfo = [];
  message: string; config: any;
  constructor(private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    public globalServ:GlobalvariablesService,
    private router: Router
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.empInfo.length
    };
   }
  currentTable = 'employeeInfo'
  activeColumns = [];
  colKeys = [];
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.activeColumns, event.previousIndex, event.currentIndex);
    this.activeColumns.forEach((x, i) => x.SortId = i + 1);
    this.updateColumnOrder();
    this.apply();
  }

  updateColumnOrder() {
    const orderedKeys = this.activeColumns.map(col => col.key);
    this.colKeys.forEach(col => {
      const index = orderedKeys.indexOf(col.key);
      if (index !== -1) {
        col.SortId = index + 1;
      }
    });
  }
  ngOnInit() {
    // this.getAllEmployeeData();
    this.getAllEmpWithSalary();
  }
  back() {
    this.router.navigateByUrl('/rpt');
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }
  // https://localhost:444/api/empswithpayroll?isactive=false&dept=All&image=false&salaryComponents=true
  getAllEmployeeData() {
    this.spinner.show();
    this.httpGet.getMasterList('empswithpayroll?isactive=false&dept=All&image=false').subscribe((res: any) => {
      const json = res.response;
      this.empInfo = json.map(item => ({
        'Employee Id': item.employeeMaster.employeeid || '',
        'Employee Code': item.employeeMaster.employeeCode || '',
        'Employee Name': item.employeeMaster.employeeName || '',
        'Last Name' : item.employeeMaster.lastName || '',
        'Gender': item.employeeMaster.gender || '',
        'Email' : item.employeeMaster.email || '',
        'Alternate Email': item.employeeMaster.alternateEmail || '',
        'Project': item.employeeMaster.projectCode || '',
        'User Name': item.employeeMaster.userName || '',
        'Designation': item.employeeMaster.designation || '',
        'Location Code': item.employeeMaster.locationCode || '',
        'Department': item.employeeMaster.deptCode || '',
        'Contact No': item.employeeMaster.contactNo || '',
        'Join Date': item.employeeMaster.joinDate || '',
         // Employee Details
        'DOB': item.employeeDetails ? (item.employeeDetails?.dob ? moment(item.employeeDetails?.dob).format('YYYY-MM-DD') :'') : '',
        'Identification Type': item.emxxployeeDetails?.identificationType || '',
        'Identification Id': item.employeeDetails?.identificationId || '',
        'Address1': item.employeeDetails?.address1 || '',
        'Address2': item.employeeDetails?.address2 || '',
        'City': item.employeeDetails?.city || '',
        'State': item.employeeDetails?.state || '',
        'Marital Status': item.employeeDetails?.maritalStatus || '',
        'Emergency Contact Name': item.employeeDetails?.emergencyContactName || '',
        'Emergency Contact No': item.employeeDetails?.emergencyContactNo || '',
        'Relationship With Emp': item.employeeDetails?.relationshipWithEmp || '',
        'ESI': item.employeeDetails ? JSON.parse(item.employeeDetails?.employeeDetails).ESI :'',
        'UAN': item.employeeDetails ?JSON.parse(item.employeeDetails?.employeeDetails).UAN : '',

        // Payroll Master Details
        'Payroll Type': item.payrollMaster.payrollType || '',
        'Payroll Code': item.payrollMaster.payrollCode || '',
        'CapturePolicy': item.payrollMaster.capturePolicy || '',
        'Policy Code': item.payrollMaster.policyCode || '',
        'Salary': item.payrollMaster.salary || '',
        'Bank Account No': item.payrollMaster.bankAccountNo || '',
        'Bank Name': item.payrollMaster.bankName || '',
        'Bank Code': item.payrollMaster.bankCode || '',
        'Bank Branch': item.payrollMaster.bankBranch || '',
        'Bank Address': item.payrollMaster.bankAddress || '',
        'Employee Type': item.payrollMaster.employeeType || '',
        'Supervisor': item.payrollMaster.supervisor || '',
        'Supervisor Id': item.payrollMaster.supervisorId || '',
        'Last Working Date': item.payrollMaster.lastWorkingDate || '',
        'Is Active': item.employeeMaster.isactive || '',
        'Is Admin': item.employeeMaster.isAdmin || '',
      }));
      
      if (this.empInfo.length > 0) {
        this.loadColumnsConfig();
      }
      this.message = 'modified';
      this.spinner.hide();
    }, err => {
      this.message = 'error';
      console.error(err); 
    })
  }
  isNumber(value: any): boolean {
    return !isNaN(value) && typeof value === 'number';
  }
  getAllEmpWithSalary() {
    this.spinner.show();
    this.httpGet.getMasterList('empswithpayroll?isactive=false&dept=All&image=false&salaryComponents=true').subscribe((res: any) => {
      const json = res.response;
      this.spinner.hide();
      const longestSalaryComponents = json.reduce((maxItem, currentItem) => {
        if (currentItem.salaryComponents && Array.isArray(currentItem.salaryComponents) && currentItem.salaryComponents.length > (maxItem.salaryComponents ? maxItem.salaryComponents.length : 0)) {
          return currentItem;
        }
        return maxItem;
      }, { salaryComponents: [] });
      const componentCodes = json.map(item => {
        // If salaryComponents is null, fill it with the first valid salaryComponents structure
        if (item.salaryComponents == null || item.salaryComponents.length == 0) {
          const sampleSalaryComponents = longestSalaryComponents?.salaryComponents || [];
          item.salaryComponents = sampleSalaryComponents.map(component => ({
            ...component,
            amount: 0 // Set the amount to 0 for these items
          }));
        }          
          item.salaryComponents.forEach(element => {
            item[element.componentCode] = element.amount !== '' || element.amount !== null ? element.amount : 0;
          });

        const grossEarnings = item.salaryComponents.filter(item => !item.isDeduction).reduce((total, item) => total + item.amount, 0);
        const deductions = item.salaryComponents.filter(item => item.isDeduction).reduce((total, item) => total + item.amount, 0);
        const netAmount = grossEarnings - deductions;
        const result = {
          ...item, // Spread the item to include all existing properties
          'Gross Earnings': grossEarnings , // Add grossEarnings to the result
          'Total Deductions' :deductions, // Add deductions to the result
          'Net Amount' :netAmount, // Add netAmount to the result
        };
        
        return result
      });
      this.empInfo = componentCodes.map(item => {
        const result = {};
        if (item.employeeMaster) {
          result['Employee Id'] = item.employeeMaster?.employeeid || '';
          result['Employee Code'] = item.employeeMaster?.employeeCode || '';
          result['Full Name'] = `${item.employeeMaster?.employeeName} ${item.employeeMaster?.lastName !== null ? item.employeeMaster?.lastName :''}` || '';
          result['Employee Name'] = item.employeeMaster?.employeeName || '';
          result['Last Name'] = item.employeeMaster?.lastName || '';
          result['Gender'] = item.employeeMaster?.gender || '';
          result['Email'] = item.employeeMaster?.email || '';
          result['Alternate Email'] = item.employeeMaster?.alternateEmail || '';
          result['Project'] = item.employeeMaster?.projectCode || '';
          result['User Name'] = item.employeeMaster?.userName || '';
          result['Designation'] = item.employeeMaster?.designation || '';
          result['Location Code'] = item.employeeMaster?.locationCode || '';
          result['Department'] = item.employeeMaster?.deptCode || '';
          result['Contact No'] = item.employeeMaster?.contactNo || '';
          result['Join Date'] = item.employeeMaster?.joinDate || '';
          result['Is Active'] = item.employeeMaster?.isactive || '';
          // Remove 'Is Admin' from the output (or use conditions to include it based on some criteria)
          // result['Is Admin'] = item.employeeMaster?.isAdmin || ''; // Don't include this
        }

        // Employee Details
        // if (item.employeeDetails) {
          result['DOB'] = item.employeeDetails ? (item.employeeDetails?.dob ? moment(item.employeeDetails?.dob).format('YYYY-MM-DD') : '') : '',
          result['Identification Type'] = item.employeeDetails?.identificationType || '';
          result['Identification Id'] = item.employeeDetails?.identificationId || '';
          result['Address1'] = item.employeeDetails?.address1 || '';
          result['Address2'] = item.employeeDetails?.address2 || '';
          result['City'] = item.employeeDetails?.city || '';
          result['State'] = item.employeeDetails?.state || '';
          result['Marital Status'] = item.employeeDetails?.maritalStatus || '';
          result['Emergency Contact Name'] = item.employeeDetails?.emergencyContactName || '';
          result['Emergency Contact No'] = item.employeeDetails?.emergencyContactNo || '';
          result['Relationship With Emp'] = item.employeeDetails?.relationshipWithEmp || '';
          result['ESI'] = item.employeeDetails ? JSON.parse(item.employeeDetails?.employeeDetails)?.ESI || '' : '';
          result['UAN'] = item.employeeDetails ? JSON.parse(item.employeeDetails?.employeeDetails)?.UAN || '' : '';
        // } else {
        //   result['DOB'] =  '',
        //     result['Identification Type'] =  '';
        //   result['Identification Id'] =  '';
        //   result['Address1'] =  '';
        //   result['Address2'] =  '';
        //   result['City'] =  '';
        //   result['State'] = item.employeeDetails?.state || '';
        //   result['Marital Status'] = item.employeeDetails?.maritalStatus || '';
        //   result['Emergency Contact Name'] = item.employeeDetails?.emergencyContactName || '';
        //   result['Emergency Contact No'] = item.employeeDetails?.emergencyContactNo || '';
        //   result['Relationship With Emp'] = item.employeeDetails?.relationshipWithEmp || '';
        //   result['ESI'] = item.employeeDetails ? JSON.parse(item.employeeDetails?.employeeDetails)?.ESI || '' : '';
        //   result['UAN'] = item.employeeDetails ? JSON.parse(item.employeeDetails?.employeeDetails)?.UAN || '' : '';
        // }

        // Payroll Master Details
        if (item.payrollMaster) {
          result['Payroll Type'] = item.payrollMaster?.payrollType || '';
          result['Payroll Code'] = item.payrollMaster?.payrollCode || '';
          result['CapturePolicy'] = item.payrollMaster?.capturePolicy || '';
          result['Policy Code'] = item.payrollMaster?.policyCode || '';
          // result['Salary'] = item.payrollMaster?.salary || '';
          result['Bank Account No'] = item.payrollMaster?.bankAccountNo || '';
          result['Bank Name'] = item.payrollMaster?.bankName || '';
          result['Bank Code'] = item.payrollMaster?.bankCode || '';
          result['Bank Branch'] = item.payrollMaster?.bankBranch || '';
          result['Bank Address'] = item.payrollMaster?.bankAddress || '';
          result['Employee Type'] = item.payrollMaster?.employeeType || '';
          result['Supervisor'] = item.payrollMaster?.supervisor || '';
          result['Supervisor Id'] = item.payrollMaster?.supervisorId || '';
          result['Last Working Date'] = item.payrollMaster?.lastWorkingDate || '';
        }

        // Filter out unnecessary properties from the 'item' object
        for (const key in item) {
          const unwanted = ['employeeDetails', 'employeeMaster', 'salary', 'payrollMaster', 'salaryComponents','documents']
          // Skip unwanted properties (e.g., 'unwantedKey' or an empty array)
          if (!unwanted.includes(key)) {
            result[key] = item[key] !== '' || item[key] !== null ? item[key]: 0;
          }
        }
        return result;
      });
      if (this.empInfo.length > 0) {
        this.loadColumnsConfig();
      }
      this.message = 'modified';
      this.spinner.hide();
    }, err => {
      this.message = 'error'; this.spinner.hide();
      console.error(err);
    })
  }
  
  toggleColumnVisibility(colKey: string, event: Event) {
    const checkbox = (event.target as HTMLInputElement);
    const column = this.colKeys.find(col => col.key === colKey);
    if (column) {
      column.view = checkbox.checked;
    }
    // this.apply();
  }
  close() {
    this.colKeys.forEach(x => {
      if (x.checked == true) {
        x.view = true
      } else {
        x.view = false
      }
    })
  }

  apply() {
    this.colKeys.forEach(x => {
      if (x.view == true) {
        x.checked = true
      } else {
        x.checked = false
      }
    })
    const savedConfig = localStorage.getItem('tableConfigs');
    const configs = savedConfig ? JSON.parse(savedConfig) : {};
    if (!configs[this.currentTable]) {
      configs[this.currentTable] = this.colKeys;
    } else {
      configs[this.currentTable] = this.colKeys;
    }
    this.activeColumns = this.colKeys.filter(x => x.checked == true)
    this.activeColumns.sort((a, b) => a.SortId - b.SortId);
    localStorage.setItem('tableConfigs', JSON.stringify(configs));
  }

  loadColumnsConfig() {
    const savedConfig = localStorage.getItem('tableConfigs');
    const keysToRemove = []
    if (savedConfig) {
      const configs = JSON.parse(savedConfig);

      this.colKeys = configs[this.currentTable] || [];
      if (!configs[this.currentTable]) {
        const keys = Object.keys(this.empInfo[0] || {});       
        const filteredList = keys.filter((item: any) => !keysToRemove.includes(item));
        this.colKeys = filteredList.map(key => ({ key, view: true, checked: true }));
        this.activeColumns = this.colKeys.filter(x => x.view == true)
        this.activeColumns.sort((a, b) => a.SortId - b.SortId);
        this.saveColumnsConfig();
      } else {
        this.activeColumns = this.colKeys.filter(x => x.view == true)
        this.activeColumns.sort((a, b) => a.SortId - b.SortId);
      }
    } else {
      const keys = Object.keys(this.empInfo[0] || {});
      const filteredList = keys.filter((item: any) => !keysToRemove.includes(item));
      this.colKeys = filteredList.map(key => ({ key, view: true, checked: true }));
      this.activeColumns = this.colKeys.filter(x => x.view == true)
      this.activeColumns.sort((a, b) => a.SortId - b.SortId);
      this.saveColumnsConfig();      
    }
  }
  saveColumnsConfig() {
    const savedConfig = localStorage.getItem('tableConfigs');
    const configs = savedConfig ? JSON.parse(savedConfig) : {};
    configs[this.currentTable] = this.colKeys;
    localStorage.setItem('tableConfigs', JSON.stringify(configs));
  }

  saveAsExcel() {
    const hiddenKeys = new Set(this.colKeys.filter(key => !key.view).map(key => key.key));
    // Remove keys that are not visible (view: false) but allow extra keys in empInfo
    const filteredEmpInfo = this.empInfo.map(emp => {
      const filteredEmp = {};
      Object.keys(emp).forEach(key => {
        // Include the key if it is not hidden or if it is an extra key not in the keys list
        if (!hiddenKeys.has(key) || this.colKeys.find(k => k.key === key) === undefined) {
          filteredEmp[key] = emp[key];
        }
      });
      return filteredEmp;
    });
    this.excelService.exportAsExcelFile(filteredEmpInfo, 'Employee_Info_');

  }


}
