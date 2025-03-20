import { Component } from '@angular/core';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bulk-uploads',
  templateUrl: './bulk-uploads.component.html',
  styleUrl: './bulk-uploads.component.scss'
})
export class BulkUploadsComponent {
  selectedBulkModule = '';
  columnsAre: any;
  issues = [];
  modulesList = [
    { code: 'TimeSheet', value: 'hrTimesheet', name: 'Attendance Logs' },
    { code: 'Employeemaster', value: 'hremployeeMaster', name: 'Employee Directory' },
    { code: 'ShiftAssignment', value: 'shiftAssignment', name: 'Shift Assignment' },
  ]
  file = {
    name: null,
    type: null
  };
  hasIssues: string;
  csvContent: any;
  pytypes = [
    { code: 'Salaried', name: 'Salaried' },
    { code: 'PieceWork', name: 'PieceWork' },
  ];
  genders = [
    { code: 'Male', name: 'Male' },
    { code: 'Female', name: 'Female' },
    { code: 'others', name: 'Others' }
  ];
  employeesList = [];
  deptList = [];
  shiftList = [];
  designationList = [];
  payrollList = [];
  projectList = [];
  constructor(
    private httpPost: HttpPostService,
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private global: GlobalvariablesService
  ) {

  }

  OnModulechange() {
    if (this.selectedBulkModule == 'TimeSheet') {
      this.getEmpList();
      this.getAllShifts();
      this.downloadSample();
    } else if (this.selectedBulkModule == 'Employeemaster') {
      this.getProjects();
      this.getDepartments();
      this.getPayrollList();
      this.getDesignation();
      this.getEmpList();
      this.downloadSample();
    }
    else if (this.selectedBulkModule == 'ShiftAssignment') {
      this.getEmpList();
      this.getAllShifts();
      this.downloadSample();

    }
  }

  getEmpList() {
    this.httpGet.getEmployeesByDepartment('ALL').subscribe((res: any) => {
      this.employeesList = res.response;
    },
      err => {
        console.error(err);
      })
  }
  getAllShifts() {
    this.httpGet.getMasterList('shifts/active').subscribe((res: any) => {
      this.shiftList = res.response;
    },
      err => {
        console.error(err); 
    })
  }
  getDepartments() {
    this.httpGet.getMasterList('depts/active').subscribe((res: any) => {
      this.deptList = res.response;
    },
      err => {
        console.error(err);
      })
  }
  getDesignation() {
    this.httpGet.getMasterList('desgs/active').subscribe((res: any) => {
      this.designationList = res.response;
    },
      err => {
        console.error(err);
      })
  }

  getProjects() {
    this.httpGet.getMasterList('empcategorys').subscribe(
      (res: any) => {
        this.projectList = res.response;
      },
      err => {
        console.error(err);
      }
    );
  }
  getPayrollList() {
    this.httpGet.getMasterList('payrollsetups').subscribe(
      (res: any) => {
        this.payrollList = res.response;
      },
      err => {
        console.error(err);
      }
    );
  }


  downloadSample() {
    if (this.selectedBulkModule) {
      this.spinner.show();
      this.httpGet.getMasterList('downloadHeaders/' + this.selectedBulkModule).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (this.selectedBulkModule == 'TimeSheet') {
            this.columnsAre = res.response;
          } else if (this.selectedBulkModule == 'Employeemaster') {
            this.columnsAre = res.response;
          }
          else if (this.selectedBulkModule == 'ShiftAssignment') {
            this.columnsAre = res.response;
          }
        }, (err) => {
          this.spinner.hide();
          // input.value = null;
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        });
    } else {
      Swal.fire({
        title: 'Info',
        text: 'Please select any module',
        icon: 'info',
        timer: 10000,
      })
    }
  }
  downloadCSV() {
    if (!this.columnsAre.columnNames) {
      this.downloadSample();
    } else {
    const csvData = this.columnsAre.columnNames;
    // 'Name,Email,Phone\nJohn Doe,johndoe@example.com,1234567890\nJane Smith,janesmith@example.com,9876543210';
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    const timestamp = new Date().toISOString().replace(/:/g, '-');

    a.setAttribute('download', `${this.selectedBulkModule}_${moment().format('HH:mm:ss')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  }

  openFileInput(inputId: string) {
    if (this.selectedBulkModule) {
      if (this.columnsAre.columnNames) {
        // this.OnModulechange();
        this.issues = [];
        this.file.name = null;
        this.file.type = null;
        this.issues = [];
        const fileInput = document.getElementById(inputId) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = null; // Clear the file input value
          fileInput.click(); // Open the file dialog
        }
      } else {
        this.downloadSample();
      }
    } else {
      Swal.fire({
        title: 'Info',
        text: 'Please select any module',
        icon: 'info',
        timer: 10000,
      })
    }
  }

  deleteFile(inputId) {
    this.issues = [];
    this.file.name = null;
    this.file.type = null;
    this.issues = [];
    this.hasIssues = 'processing';
    this.columnsAre.ModifiedData = [];
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = null; // Clear the file input value
    }
  }
  onFileSelected(event: any) {
    console.warn('click on onFileSelected');
    this.issues = [];
    if (event.target.files) {
    const file: File = event.target.files[0];
    const reader = new FileReader();
    // this.file = file
    this.file.name = file.name;
    this.file.type = file.name.split('.').pop();

    reader.onload = (e: any) => {
      const csv: string = e.target.result;
      // Process the CSV data
      this.validateCSV(event, csv);
    };
    reader.readAsText(file);
  }
  }

  validateCSV(event: any, csv: string) {
    // this.spinner.show();
    this.issues = [];
    // Parse the CSV data and validate fields
    const lines = csv.split(/\r?\n/);
    const modData = lines.filter(line => line.trim() !== '' && line.trim().replace(/,/g, '') !== '');
    const headers = modData[0].split(',');
    const requiredFields = this.columnsAre.manadatoryColumns;
    // const dateCodeIndex = headers.indexOf('dateCode');
    this.spinner.hide();

    for (let i = 1; i < modData.length; i++) {
      const fields = modData[i].split(',');

      // Check for required fields
      requiredFields.forEach((field) => {
        const index = headers.indexOf(field);
        if (index !== -1 && fields[index].trim() === '') {
          this.issues.push(`Row ${i + 1}: Missing required field "${field}"`);
        }
      });
    }

    if (!requiredFields.every(field => headers.includes(field))) {
      this.issues.push(
        `The CSV file does not contain all the required fields. Please download the file again.`
      )
      return;
    }
    // this.sendFile(event);
    this.onFileSelect(event.target)
  }
  onFileSelect(input) {
    const files = input.files;
    const fileTypes = ['csv']; //acceptable file types
    if (files && files.length) {
      const extension = input.files[0].name.split('.').pop().toLowerCase(); //file extension from input file

      //Validating type of File Uploaded
      if (fileTypes.indexOf(extension) > -1) {
        const fileToRead = files[0];

        const fileReader = new FileReader();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        fileReader.onload = function (fileLoadedEvent) {
          const textFromFileLoaded = fileLoadedEvent.target.result;
          that.csvContent = textFromFileLoaded;
          //Flag is for extracting first line
          let flag = false;
          // Main Data
          const objarray: Array<any> = [];
          //Properties
          const prop: Array<any> = [];
          //Total Length
          const lines = that.csvContent.split(/\r?\n/);
          const modData = lines.filter(line => line.trim() !== '' && line.trim().replace(/,/g, '') !== '');
          let size: any = 0;
          for (const line of modData) {
            if (line !== '') {
              if (flag) {
                const obj = {};
                for (let k = 0; k < size; k++) {
                  //Dynamic Object Properties
                  obj[prop[k]] = line.split(',')[k];
                }
                objarray.push(obj);
              } else {
                //First Line of CSV will be having Properties
                for (let k = 0; k < line.split(',').length; k++) {
                  size = line.split(',').length;
                  //Removing all the spaces to make them useful
                  prop.push(line.split(',')[k]);
                  // prop.push(line.split(',')[k]replace(/ /g, ''));
                }
                flag = true;
              }
            }
          }
          //All the values converted from CSV to JSON Array
          // that.convertedArray = objarray;
          // that.properties = prop;

          const finalResult = {
            properties: prop,
            result: objarray,
          };
          if (that.selectedBulkModule == 'TimeSheet') {
            that.compareTimesheetDataWithMasterData(finalResult);
          } else if (that.selectedBulkModule == 'Employeemaster') {
            that.compareEmployeeDataWithMasterData(finalResult);
          }
          else if (that.selectedBulkModule == 'ShiftAssignment') {
            that.compareShiftAssignmentDataWithMasterData(finalResult);
          }
          //On Convert Success
        };
        fileReader.readAsText(fileToRead, 'UTF-8');
      } else {
        console.error('Invalid File Format!');
      }
    }
  }

  isValidTime(inDate, inTime, outDate, outTime, index) {
    if (!inTime || !outTime) return false; // Check if times are defined

    const getDateTime = (date, time) => {
      const { hour, minute, second } = this.parseTime(time);
      const formattedTime = this.formatTime(hour, minute, second);
      return new Date(`${date}T${formattedTime}Z`); // Combine date and formatted time
    };

    // Convert inDate and outDate with their respective times
    const inDateTime = getDateTime(inDate, inTime);
    const outDateTime = getDateTime(outDate, outTime);
    // Return true if inDateTime is earlier than outDateTime
    return inDateTime < outDateTime;
  }
  formatTime = (hour, minute, second) => {
    return [
      String(hour).padStart(2, '0'),
      String(minute).padStart(2, '0'),
      String(second).padStart(2, '0')
    ].join(':');
  };
  parseTime = (time) => {
    const [hour = '0', minute = '0', second = '0'] = time.split(':').map(Number);
    return { hour, minute, second };
  };
  formatJoinDate(record) {
    // Check if the 'Join Date' exists and is valid
    const dateString = record['Join Date (YYYY-MM-DD)']; // Assuming your input is in DD-MM-YYYY format
    if (dateString) {
      // Specify the format while parsing
      const parsedDate = moment(dateString, 'DD-MM-YYYY', true); // true for strict parsing
      if (parsedDate.isValid()) {
        record['Join Date (YYYY-MM-DD)'] = parsedDate.format('YYYY-MM-DD');
        return true;
      } else {
        console.error(`Invalid date: ${dateString}`);
        return false;
      }
    }
    return false
  }

  compareTimesheetDataWithMasterData(finalResult) {
    let hasIssues = false;
    finalResult.result.forEach((record, i) => {
      let issues = [];
      record['Employee Code'] = record['Employee Code'].trim();
      record['Employee Name'] = record['Employee Name'].trim();

      // Check shift
      const sh = record.Shift.toUpperCase().trim();
      const isShiftValid = this.shiftList.find(shift => shift.shiftCode.toUpperCase() === sh);
      if (!isShiftValid) {
        issues.push(`Invalid shift: ${record.Shift}`);
      } else {
        record.Shift = isShiftValid.shiftCode
      }

      // Check employee code
      const employeeCode = record['Employee Code'].toUpperCase().trim();
      const employee = this.employeesList.find(emp => emp.employeeCode.toUpperCase().trim() == employeeCode);
      if (!employee) {
        issues.push(`Invalid employee code: ${record['Employee Code']}`);
      }
      else {
        record['Employee Code'] = employee.employeeCode;
        record['Employee Name'] = employee.employeeName;
      }

      const dateFormats = ['DD-MM-YYYY', 'DD-MM-YY', 'YYYY-MM-DD', 'MM-DD-YYYY', 'YYYY-MM-DD'];

      // Parse and validate In Date
      const inDate = moment(record['In Date'], dateFormats, true);
      if (!inDate.isValid()) {
        issues.push(`Invalid In Date format for record index ${i + 1}`);
      } else {
        record['In Date'] = inDate.format('DD-MM-YYYY'); // Convert to DD-MM-YYYY
      }

      // Parse and validate Out Date
      const outDate = moment(record['Out Date'], dateFormats, true);
      if (!outDate.isValid()) {
        issues.push(`Invalid Out Date format for record index ${i + 1}`);
      } else {
        record['Out Date'] = outDate.format('DD-MM-YYYY'); // Convert to DD-MM-YYYY
      }


      // Parse dates and times using Moment.js
      const inDateTime = moment(`${record['In Date']} ${record['In Time(HH:mm:ss)']}`, 'DD-MM-YYYY HH:mm:ss');
      const outDateTime = moment(`${record['Out Date']} ${record['Out Time(HH:mm:ss)']}`, 'DD-MM-YYYY HH:mm:ss');
      // Check for valid date parsing
      if (!inDateTime.isValid() || !outDateTime.isValid()) {
        issues.push(`Invalid date/time for record index ${i + 1}`);
      } else {
        // Check if inTime is less than outTime
        if (inDateTime.isSameOrAfter(outDateTime)) {
          issues.push(`In-date and time ${record['In Date']}, ${record['In Time(HH:mm:ss)']} cannot be greater than Out-date and time ${record['Out Date']}, ${record['Out Time(HH:mm:ss)']}`);
        }

        // Check time difference (24 hours in milliseconds)
        const timeDifference = outDateTime.diff(inDateTime);
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (timeDifference > twentyFourHours) {
          issues.push(`In-date and time ${record['In Date']}, ${record['In Time(HH:mm:ss)']} cannot be more than 24 hours different from Out-date and time ${record['Out Date']}, ${record['Out Time(HH:mm:ss)']}`);
        }
      }


      record['In Time(HH:mm:ss)'] = moment(record['In Time(HH:mm:ss)'], ['H:mm:ss', 'HH:mm:ss', 'H:mm', 'HH:mm']).format('HH:mm:ss')
      record['Out Time(HH:mm:ss)'] = moment(record['Out Time(HH:mm:ss)'], ['H:mm:ss', 'HH:mm:ss', 'H:mm', 'HH:mm']).format('HH:mm:ss')

      // Add issues to record if any
      if (issues.length > 0) {
        hasIssues = true;
        record.Issues = issues;
      } 
    });
    if (hasIssues) {
      this.hasIssues = 'issueArePresent';
    } else {
      this.hasIssues = 'goodToGo';
    }

    finalResult.properties.push('Issues')
    this.columnsAre.headers = finalResult.properties;
    this.columnsAre.Module = this.selectedBulkModule;
    this.columnsAre.ModifiedData = finalResult.result;
  }

  getDateTime(date, time) {
    const { hour, minute, second } = this.parseTime(time);
    const formattedTime = this.formatTime(hour, minute, second);
    return new Date(`${date}T${formattedTime}Z`); // Combine date and formatted time
  }
  compareEmployeeDataWithMasterData(finalObj) {
    this.hasIssues = '';
    let hasIssues = false;
    finalObj.result.forEach((record, i) => {
      let issues = [];
      record['Employee Code'] = record['Employee Code'] ? record['Employee Code'].trim() : null;
      record['Employee Name'] = record['Employee Name'].trim();
      record['Dept Code'] = record['Dept Code'] ? record['Dept Code'].trim() : null;
      record['Project Code'] = record['Project Code'] ? record['Project Code'].trim() : null;
      record['Designation'] = record['Designation'] ? record['Designation'].trim() : null;
      record['Payroll Type'] = record['Payroll Type'] ? record['Payroll Type'].trim() : null;
      record['Payroll Code'] = record['Payroll Code'] ? record['Payroll Code'].trim() : null;
      record['Salary'] = record['Salary'] >= 0 ? record['Salary'] : 0;
      record['Gender'] = record['Gender'] ? record['Gender'].trim() : null;

      //Dept Code
      const dept = record['Dept Code'] ? record['Dept Code'].toUpperCase().trim() : '';
      const isDeptCodeValid = this.deptList.find(dc => dc.deptCode.toUpperCase().trim() == dept);
      if (!isDeptCodeValid) {
        if (this.columnsAre.manadatoryColumns.includes('Dept Code')) {
          issues.push(`Invalid Department Code: ${record['Dept Code']}`);
        } else {
          record['Dept Code'] = '';
        }
      } else {
        record['Dept Code'] = isDeptCodeValid.deptCode;
      }

      //Project Code
      const projCode = record['Project Code'] ? record['Project Code'].toUpperCase().trim() : '';
      const isprojectCodeValid = this.projectList.find(pj => pj.categoryCode.toUpperCase().trim() == projCode);
      if (!isprojectCodeValid) {
        if (this.columnsAre.manadatoryColumns.includes('Project Code')) {
          issues.push(`Invalid Project Code: ${record['Project Code']}`);
        } else {
          record['Project Code'] = '';
        }
      } else {
        record['Project Code'] = isprojectCodeValid.categoryCode;
      }
      // designation
      const desi = record['Designation'] ? record['Designation'].toUpperCase().trim() : '';
      const isDesignationFound = this.designationList.find(des => des.designation.toUpperCase().trim() == desi);
      if (!isDesignationFound) {
        if (this.columnsAre.manadatoryColumns.includes('Designation')) {
          issues.push(`Invalid Designation : ${record['Designation']}`);
        } else {
          record['Designation'] = '';
        }
      } else {
        record['Designation'] = isDesignationFound.designation;
      }
      // gender
      const gen = record['Gender'] ? record['Gender'].toUpperCase().trim() : '';
      const genFound = this.genders.find(g => g.code.toUpperCase().trim() == gen);
      if (!genFound) {
        if (this.columnsAre.manadatoryColumns.includes('Gender')) {
          issues.push(`Invalid Gender : ${record['Gender']}`);
        } else {
          record['Gender'] = '';
        }
      } else {
        record['Gender'] = genFound.code;
      }
      // payrolltype

      const paytypeCode = record['Payroll Type'] ? record['Payroll Type'].toUpperCase().trim() : '';
      const ispayrolTypeValid = this.pytypes.find(pj => pj.code.toUpperCase().trim() == paytypeCode);
      if (!ispayrolTypeValid) {
        if (this.columnsAre.manadatoryColumns.includes('Payroll Type')) {
          issues.push(`Invalid Payroll type: ${record['Payroll Type']}`);
        } else {
          record['Payroll Type'] = '';
        }
      } else {
        record['Payroll Type'] = ispayrolTypeValid.code;
      }

      // payroll code
      const payCode = record['Payroll Code'] ? record['Payroll Code'].toUpperCase().trim() : '';
      const ispayrolCodeValid = this.payrollList.find(pCode => pCode.payrollCode.toUpperCase().trim() == payCode);
      if (!ispayrolCodeValid) {
        if (this.columnsAre.manadatoryColumns.includes('Payroll Code')) {
          issues.push(`Invalid Payroll Code: ${record['Payroll Code']}`);
        } else {
          record['Payroll Code'] = '';
        }
      } else {
        record['Payroll Code'] = ispayrolCodeValid.payrollCode;
      }
      if (!this.formatJoinDate(record)) {
        issues.push(`Invalid date: ${record['Join Date (YYYY-MM-DD)']}`);
      }
      if (issues.length > 0) {
        hasIssues = true;
        record.Issues = issues;
      }
    });

    if (hasIssues) {
      this.hasIssues = 'issueArePresent';
    } else {
      this.hasIssues = 'goodToGo';
    }
    finalObj.properties.push('Issues')
    this.columnsAre.headers = finalObj.properties;
    this.columnsAre.Module = this.selectedBulkModule;
    this.columnsAre.ModifiedData = finalObj.result;
  }
  compareShiftAssignmentDataWithMasterData(finalObj) {
    this.hasIssues = 'processing';
    let hasIssues = false;
    finalObj.result.forEach((record, i) => {
      let issues = [];
      record['Employee Code'] = record['Employee Code'].trim();
      record['Shift Code'] = record['Shift Code'].trim();


      // Check shift
      const sh = record['Shift Code'].toUpperCase().trim();
      const isShiftValid = this.shiftList.find(shift => shift.shiftCode.toUpperCase() == sh);
      if (!isShiftValid) {
        issues.push(`Invalid shift: ${record['Shift Code']}`);
      } else {
        record['Shift Code'] = isShiftValid.shiftCode
      }

      // Check employee code
      const employeeCode = record['Employee Code'].toUpperCase();
      const employee = this.employeesList.find(emp => emp.employeeCode.toUpperCase() == employeeCode);
      if (!employee) {
        issues.push(`Invalid employee code: ${record['Employee Code']}`);
      }
      else {
        record['Employee Code'] = employee.employeeCode;
        record['Employee Name'] = employee.employeeName;
      }
      const startDateStr = record['Start Date'];
      let endDateStr = record['End Date'];

      // Use moment to parse the dates
      if (!endDateStr) {
        // Set end date to last day of the year of the start date
        const startDate = moment(startDateStr, ['DD-MM-YYYY', 'YYYY-MM-DD'], true);
        if (startDate.isValid()) {
          const year = startDate.year();
          endDateStr = `${year}-12-31`; // Setting to December 31 of the same year
          record['End Date'] = endDateStr; // Update the record
        } else {
          issues.push(`Start date '${startDateStr}' is invalid. Cannot set end date.`);
        }
      }

      // Use moment to parse the dates
      const startDate = moment(startDateStr, ['DD-MM-YYYY', 'YYYY-MM-DD'], true);
      const endDate = moment(endDateStr, ['DD-MM-YYYY', 'YYYY-MM-DD'], true);

      // Validate start date
      if (!startDate.isValid()) {
        record['Start Date'] = 'invalid';
        issues.push(`Start date '${startDateStr}' is invalid.`);

      } else {
        // Convert start date to yyyy-mm-dd format
        record['Start Date'] = startDate.format('YYYY-MM-DD');
      }

      // Validate end date
      if (!endDate.isValid()) {
        record['End Date'] = 'invalid';
        issues.push(`End date '${endDate}' is invalid.`);
      } else {
        // Convert start date to yyyy-mm-dd format
        record['End Date'] = endDate.format('YYYY-MM-DD');
      }

      // Check if both dates are valid before comparing
      if (startDate.isValid() && endDate.isValid()) {
        // Check if end date is greater than start date
        if (endDate.isBefore(startDate)) {
          issues.push(`End date ${endDateStr} should not be less than start date ${startDateStr}.`);
        }
      }
      // If there are issues, assign them to the record
      if (issues.length > 0) {
        hasIssues = true;
        record.Issues = issues;
      } 

    })
    if (hasIssues) {
      this.hasIssues = 'issueArePresent';
    } else {
      this.hasIssues = 'goodToGo';
    }

    finalObj.properties.push('Issues')
    this.columnsAre.headers = finalObj.properties;
    this.columnsAre.Module = this.selectedBulkModule;
    this.columnsAre.ModifiedData = finalObj.result;
  }
  parseDate(dateString) {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-based in JS
  }
  compareDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < end) {
      return true; // Start date is valid
    } else if (start > end) {
      return false; // Invalid: start date is greater
    } else {
      return false; // Invalid: dates are equal
    }
  }
  submit() {
    if (this.columnsAre.Module === 'TimeSheet') {
      this.spinner.show();
      this.httpPost.create('upload/Timesheet', this.columnsAre.ModifiedData).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message !== 'SUCCESS') {
            Swal.fire({
              title: 'Error!',
              text: res.status.message,
              icon: 'error',
            });
          } else if (res.status.message === 'SUCCESS') {
            Swal.fire({
              title: 'Success',
              text: 'File uploaded successfully',
              icon: 'success',
              showConfirmButton: true,
            });
            this.deleteFile('csvfile');
          }
        },
        (err) => {
          this.spinner.hide();
          // input.value = null;
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        });
    }
    else if (this.columnsAre.Module === 'Employeemaster') {
      this.spinner.show();
      this.httpPost.create('upload/EmployeeMaster', this.columnsAre.ModifiedData).subscribe(
        (res: any) => {
          // input.value = null;
          this.spinner.hide();
          if (res.status.message !== 'SUCCESS') {
            Swal.fire({
              title: 'Error!',
              text: 'Please check the issues',
              icon: 'error',
            });
            if (res.response) {
              res.response.forEach((item: any) => {
                const index = item.index; // Get the index from the response
                this.columnsAre.ModifiedData[index].Issues = [];

                if (this.columnsAre.ModifiedData[index]) {
                  const invalidEntries = item.invalidEntries;

                  // Loop through each invalid entry
                  invalidEntries.forEach((entry: any) => {
                    const issueMessage = `${entry.field}: ${entry.reason}`;
                    // Ensure the issue property is initialized as an array
                    if (!this.columnsAre.ModifiedData[index].Issues) {
                      this.columnsAre.ModifiedData[index].Issues = [];
                    }
                    // Push the issue message to the issue array
                    this.columnsAre.ModifiedData[index].Issues.push(issueMessage);
                  });
                }
              });
            }  
          } else if (res.status.message === 'SUCCESS') {
            Swal.fire({
              title: 'Success',
              text: 'File uploaded successfully',
              icon: 'success',
              showConfirmButton: true,
            });
            this.deleteFile('csvfile');
          }



        },
        (err) => {
          this.spinner.hide();
          // input.value = null;
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        });
    }
    else if (this.columnsAre.Module === 'ShiftAssignment') {

      this.spinner.show();
      this.httpPost.create('upload/ShiftAssignment', this.columnsAre.ModifiedData).subscribe(
        (res: any) => {
          // input.value = null;
          this.spinner.hide();

          if (res.status.message !== 'SUCCESS') {
            Swal.fire({
              title: 'Error!',
              text: res.status.message,
              icon: 'error',
            });
          } else if (res.status.message === 'SUCCESS') {
            Swal.fire({
              title: 'Success',
              text: 'File uploaded successfully',
              icon: 'success',
              showConfirmButton: true,
            });
            this.deleteFile('csvfile');
          }



        },
        (err) => {
          this.spinner.hide();
          // input.value = null;
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        });
    };
  }
}

