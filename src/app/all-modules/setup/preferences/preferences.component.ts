import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss'
})
export class PreferencesComponent implements OnInit {
  hasPermissionToUpdate = true;
  paramValue1: any;
  paramValue2: any;
  declaration = [];
  taxProofs = [];
  temptaxComponents: any;
  proofSearch: string;
  componentSearch: string;
  taxComponents = [];
  paramValue3: any;
  tempTaxProofs: any;
  config: any;
  salaryComponents = [];
  specifiedCase = [
    { code: 'UPPER', name: 'Upper Case' },
    { code: 'LOWER', name: 'Lower Case' },
    { code: 'CAMEL_CASE	', name: 'Camel Case' },
  ];
  selectedMonth: string; // This will hold the selected month value
  months: { label: string, value: string }[] = [
    { label: 'January', value: 'JAN' },
    { label: 'February', value: 'Feb' },
    { label: 'March', value: 'MAR' },
    { label: 'April', value: 'APR' },
    { label: 'May', value: 'MAY' },
    { label: 'June', value: 'JUN' },
    { label: 'July', value: 'JULY' },
    { label: 'August', value: 'AUG' },
    { label: 'September', value: 'SEP' },
    { label: 'October', value: 'OCT' },
    { label: 'November', value: 'NOV' },
    { label: 'December', value: 'DEC' }
  ];
  dates = [];

  firstTab = true;
  secondTab = false;
  thirdTab = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private UtilServ: UtilService,
    private httpGetService: HttpGetService,
    private httpPutService: HttpPutService
  ) { }
  tab1() {
    this.firstTab = true;
    this.secondTab = false;
    this.thirdTab = false;
  }
  tab2() {
    this.firstTab = false;
    this.secondTab = true;
    this.thirdTab = false;
  }
  tab3() {
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = true;
  }


  ngOnInit(): void {
    this.getComponents();
    this.getCompanyAndBranchPreferences();
    for (let index = 1; index < 31; index++) {
      let suffix = 'th';
      if (index === 1) {
        suffix = 'st';
      } else if (index === 2) {
        suffix = 'nd';
      } else if (index === 3) {
        suffix = 'rd';
      }
      this.dates.push({ code: index, name: `${index}${suffix} of Month` });
    }
  }
  getComponents() {
    this.httpGetService.getMasterList('payrollcomponentsetups/payrules').subscribe((res: any) => {
      const rows = res.response.filter(x => x.payrollComponent.isInternal === false);
      this.salaryComponents = rows;
    },
      err => {
        console.error(err);

      })
  }
  changedateFormat(ev, item) {
    item.paramValue = moment(ev.target.value).format('MMM DD').toUpperCase();
  }
  getCompanyAndBranchPreferences() {
    this.spinner.show();
    // const coPref = this.httpGetService.getMasterList('copreferences');
    const brPreference = this.httpGetService.getMasterList('branch/preferences?headers=hr_tax,hr_tax_components');

    forkJoin([brPreference]).subscribe(([brpreferences]) => {
      // const coPref = copreferences['response']
      const brPref = brpreferences['response'];
      // const combinedPref = coPref.concat(brPref)
      this.groupData(brPref);
      this.spinner.hide();

      // this.config.totalItems = this.rows.length;
      // this.spinner.hide();

    }, (err) => {
      this.spinner.hide();
      Swal.fire({
        title: 'Error!',
        text: err.error.status.message,
        icon: 'warning',
        showConfirmButton: true,
      })
      // this.spinner.hide();
    });
  }
  editData(row) {
    row.editRecord = true;
  }
  cancel(row) {
    row.currentParamValue = row.PrevParamValue;
    row.editRecord = false;
  }
  deleteRow(row) {
    if (row.id && row.companyCode !== 'TEJA_POLY' && (row.paramValue !== '' || row.paramValue !== null)) {
      Swal.fire({
        // title: 'info!',
        // text: 'There are ' + remaiming.length + ' records needing approval',
        html: 'Are you sure you want to remove this value?',
        icon: 'info',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      }).then((result) => {
        if (result.isConfirmed) {
          row.paramValue = '',
            this.callPut(row);
        }
      });
    } else {
      row.editRecord = false;
      row.currentParamValue = row.PrevParamValue;
    }
  }
  saveData(row) {
    row.dataType !== 'Date' ? row.paramValue = row.currentParamValue : row.paramValue;
    if (row.currentParamValue) {
    if (row.companyCode === 'TEJA_POLY') {
      this.callPost(row);
    } else {
      this.callPut(row)
    }
    } else {
      Swal.fire({
        title: 'Info',
        text: 'Please Assign a value',
        icon: 'info',
        timer: 10000,
      })
    }
  }
  callPost(row) {
    this.spinner.show();
    const data = {
      "header": row.header,
      "param": row.param,
      "paramValue": row.paramValue,
      "application": row.application,
      "dataType": row.dataType,
      "ismodifiable": row.ismodifiable,
      "isPublished": row.isPublished,
      "description": row.description,
      "maxValue": row.maxValue,
      "optionValues": row.optionValues,
      // "lastmodifieddate": row.lastmodifieddate,
    }
    this.httpPostService.create('branch/preferences', data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Updated!',
          text: row.param + ' Successfully updated ',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          row.branchCode = res.response.branchCode;
          row.companyCode = res.response.companyCode;
          row.id = res.response.id;
          row.branchCode = res.response.branchCode;

          row.editRecord = false;
        });
      }
      else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning',
          showConfirmButton: true,
        })
      }
    },
      err => {
        this.spinner.hide();
        console.error(err);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'warning',
          showConfirmButton: true,
        })
      })
  }
  callPut(row) {
    this.spinner.show();
    const data = {
      "id": row.id,
      "branchCode": row.branchCode,
      "companyCode": row.companyCode,
      "header": row.header,
      "param": row.param,
      "paramValue": row.paramValue,
      "application": row.application,
      "dataType": row.dataType,
      "ismodifiable": row.ismodifiable,
      "isPublished": row.isPublished,
      "description": row.description,
      "maxValue": row.maxValue,
      "optionValues": row.optionValues,
      "lastmodifieddate": row.lastmodifieddate,
    }
    this.httpPutService.doPut('branch/preferences', data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        row.editRecord = false;
        if (row.dataType === 'Date') {
          const year = moment().year(); // Get the current year
          row.currentParamValue = row.paramValue !== '' ? moment(row.paramValue, 'MMM DD').year(year).format('YYYY-MM-DD') : '';
          row.PrevParamValue = row.paramValue !== '' ? moment(row.paramValue, 'MMM DD').year(year).format('YYYY-MM-DD') : '';
        } else {
          row.currentParamValue = row.paramValue;
        }
        Swal.fire({
          title: 'Updated!',
          text: row.param + ' Successfully updated ',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          row.editRecord = false;
        });
      }
      else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning',
          showConfirmButton: true,
        })
      }
    },
      err => {
        this.spinner.hide();
        console.error(err);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'warning',
          showConfirmButton: true,
        })
      })
  }
  getBooleanValue(paramValue: string): boolean {
    return paramValue === 'true';
  }

  // Convert boolean back to string
  setBooleanValue(item: any, value: boolean) {
    item.editRecord = !item.editRecord;
    // item.paramValue = value ? 'true' : 'false';
    item.currentParamValue = value ? 'true' : 'false';

  }
  groupData(data: any[]) {
    const groupedData = data.reduce((acc, item) => {
      !item.header ? item.header = 'Others' : item.header
      if (item.companyCode == 'TEJA_POLY' && item.header == 'hr_tax_components') {
        item.paramValue = ''
      }
      if (item.header == 'hr_tax_components' && item.companyCode !== 'TEJA_POLY') {
        const found = this.salaryComponents.find(x => x.payrollComponent.componentCode == item.paramValue)
        if (found) {
          found.payrollComponent.occupied = true;
        }
      }
      item.PrevParamValue = item.paramValue;
      item.currentParamValue = item.paramValue;
      item.editRecord = false;
      if (item.dataType === 'Date') {
        const year = moment().year(); // Get the current year
        item.currentParamValue = item.paramValue !== '' ? moment(item.paramValue, 'MMM DD').year(year).format('YYYY-MM-DD') : '';
        item.PrevParamValue = item.paramValue !== '' ? moment(item.paramValue, 'MMM DD').year(year).format('YYYY-MM-DD') : '';
      }

      const header = item.header;
      if (!acc[header]) {
        acc[header] = [];
      }
      acc[header].push(item);
      return acc;
    }, {});
    this.declaration = groupedData.hr_tax.filter(x => x.param == 'DECLARATION_START_DATE' || x.param == 'DECLARATION_END_DATE')

    this.taxProofs = groupedData.hr_tax.filter(x => x.param !== 'DECLARATION_START_DATE' && x.param !== 'DECLARATION_END_DATE')
    this.tempTaxProofs = this.taxProofs;
    this.taxComponents = groupedData.hr_tax_components.filter(x => x.header == 'hr_tax_components')
    this.temptaxComponents = this.taxComponents;
  }


  updateFilterProofs(event) {
    const val = event.target.value.toLowerCase();
    this.proofSearch = val;
    if (val == '' || !val) {
      this.taxProofs = [...this.tempTaxProofs]; // Make a shallow copy of temp
    } else {
      const filteredTax = this.tempTaxProofs.filter(d =>
        d.param.toLowerCase().includes(val)
      );

      // const filteredComponents = this.tempTaxProofs.filter(d =>
      //   d.param.toLowerCase().includes(val)
      // );
      this.taxProofs = filteredTax
    }
  }
  updateFilterComponents(event) {
    const val = event.target.value.toLowerCase();
    this.componentSearch = val;

    if (val == '' || !val) {
      this.taxComponents = [...this.temptaxComponents]; // Make a shallow copy of temp
    } else {
      const filteredTax = this.temptaxComponents.filter(d =>
        d.param.toLowerCase().includes(val)
      );

      // const filteredComponents = this.tempTaxProofs.filter(d =>
      //   d.param.toLowerCase().includes(val)
      // );

      this.taxComponents = filteredTax
    }
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.tempTaxProofs.length : event.target.value;
    this.config.currentPage = 1;
  }
}
