import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adhoc-allowance',
  templateUrl: './adhoc-allowance.component.html',
  styleUrls: ['./adhoc-allowance.component.scss']
})
export class AdhocAllowanceComponent implements OnInit {
  @Input() public fromParent;

  file = {
    name: null,
    type: null
  };
  issues = [];
  finalObj: any;
  csvContent: any;
  convertedArray: Array<any> = [];
  properties: any = '';
  columnsAre: any = [];
  config: any;
  constructor(
    private httpPost: HttpPostService,
    private router: Router,
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.finalObj?.result?.length
    };
  }

  ngOnInit(): void {
    this.getHeaders();
  }
  getHeaders() {
    this.spinner.show();
    this.httpGet.getMasterList('adhocComponentsCols').subscribe((res: any) => {
      this.columnsAre = res.response;
      this.spinner.hide();
    },
      err => {
        console.error(err);
        this.spinner.hide();

      })
  }

  downloadCSV() {
    const csvData = this.columnsAre.columnNames;
    // 'Name,Email,Phone\nJohn Doe,johndoe@example.com,1234567890\nJane Smith,janesmith@example.com,9876543210';
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    const timestamp = new Date().toISOString().replace(/:/g, '-');

    a.setAttribute('download', `CSV_data_${timestamp}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  openFileInput(inputId: string) {
    document.getElementById(inputId).click();
  }
  onFileSelected(event: any) {
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
  removeFile() {
    this.file.name = null;
    this.file.type = null;
    this.finalObj = null;
    this.issues = [];
  }

  sendFile(event: any) {
    const file: File = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    this.httpPost.create('', formData)
      .subscribe(
        () => {
          // Handle response from the backend
        },
        (error) => {
          console.error('Error uploading CSV file:', error);
          // Handle error
        }
      );
  }
  validateCSV(event: any, csv: string) {
    this.spinner.show();
    this.issues = [];
    this.finalObj = null;
    // Parse the CSV data and validate fields
    const lines = csv.split(/\r?\n/);
    const modData = lines.filter(x => x !== '');
    const headers = modData[0].split(',');
    const requiredFields = this.columnsAre.manadatoryColumns;
    // const dateCodeIndex = headers.indexOf('dateCode');
    this.spinner.hide();
    for (let i = 1; i < modData.length; i++) {
      const fields = modData[i].split(',');
      // if (dateCodeIndex > -1 && !this.isValidDate(fields[dateCodeIndex])) {
      //   this.issues.push(
      //     `Invalid date format in DateCode field.`
      //   )
      //   return;
      // }
      if (requiredFields.some((field, index) => fields[index] === '')) {
        this.issues.push(
          `One or more required fields are empty.`
        )
        this.issues.push(
          'required fields are ' + this.columnsAre.manadatoryColumns.join(', ')
        )
        return;
      }
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


  isValidDate(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$|^\d{2}-\d{2}-\d{4}$/;
    return regex.test(date);
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
          let size: any = 0;
          for (const line of that.csvContent.split(/[\r\n]+/)) {
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
          that.convertedArray = objarray;
          that.properties = prop;

          const finalResult = {
            properties: that.properties,
            result: that.convertedArray,
          };
          that.getAllCompWithPayroll(finalResult);
          //On Convert Success
        };

        fileReader.readAsText(fileToRead, 'UTF-8');
      } else {
        console.error('Invalid File Format!');
      }
    }
  }
  getAllCompWithPayroll(finalObj) {
    this.spinner.show();
    let allGood = true;
    this.httpGet.getMasterList('payrollsetupComps?payrollCode=' + this.fromParent.payrollCode).subscribe((res: any) => {
      const payrolls = res.response
      finalObj.result.forEach((data, index) => {
        if (!payrolls.includes(data['Component Code'])) {
          // Throw error or handle as needed
          allGood = false;
          this.issues.push(
            `Component '${data['Component Code']}' at line ${index + 1} is not in ad-hoc components.`
          )
        }
      });
      this.spinner.hide();
      if (this.issues.length == 0 && allGood) {
        this.finalObj = finalObj
      }
    },
      err => {
        this.spinner.hide();
        console.error(err);

      })
  }
  cancel() {
    this.activeModal.close('cancel');
  }
  submitAdhoc() {
    this.finalObj.result.forEach(element => {
      element.dateCode = moment(this.fromParent.dateCode).format('YYYY-MM-DD');
      element.payrollCode = this.fromParent.payrollCode,
        element.amount = element.Amount,
        element.componentCode = element['Component Code'],
        element.employeeCode = element['Employee Code']
    });
    this.spinner.show();
    this.httpPost.create('adhocComponents', this.finalObj.result).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        if (res.response.errorsList == null) {
          Swal.fire({
            title: 'Success!',
            text: 'Ad-hoc data created successfully',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.finalObj = null;
            this.issues = [];
            this.activeModal.close('submit');
          });
        } else {
          const errors = res.response.errorsList.split(',').map(error => error.trim());
          const errorMessage = errors.join('<br>');
          Swal.fire({
            title: 'Error!',
            html: errorMessage,
            icon: 'error',
            showConfirmButton: true,
          });
        }
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
        // console.error(err.error.status.message);
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }
}
