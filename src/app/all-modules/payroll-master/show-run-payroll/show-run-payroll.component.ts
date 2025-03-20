import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';

import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { UtilService } from '../../../services/util.service';
interface SalaryComponent {
  componentCode: string;
  amount: number;
  isDeduction: boolean;
}
interface Employee {
  salaryComponents: SalaryComponent[];
}

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-show-run-payroll',
  templateUrl: './show-run-payroll.component.html',
  styleUrls: ['./show-run-payroll.component.scss']
})
export class ShowRunPayrollComponent implements OnInit, OnDestroy {
  setData: any;
  Period: any;
  isFinilized = false;
  placeHolder: 'Select  period';
  runs = [];
  maxDt = moment().format('YYYY-MM-DD');
  temp = [];
  Netsum: any = 0;
  DedSum: any = 0;
  earSum: any = 0;
  netAmt = 0;
  earAmt = 0;
  dedAmt = 0;
  totalWorkedDays = 0;
  totalWorkingDays = 0;
  totalPayableDays = 0;
  fulldate;
  reportObj = {
    payrollCode: '',
    year: '',
    month: '',
    date: '01',
    runId: ''
  }
  salaryFrequency: string;
  companySpendsTotal = [];
  runIdsList = [];
  payrollsetups = [];
  stopSpinner = false;
  appoveAll = false;
  data = [];
  fromRunPayroll: boolean;
  constructor(public activeModal: NgbActiveModal,
    private httpGet: HttpGetService,
    private utilServ: UtilService,
    private httpPut: HttpPutService,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,
  ) { }


  ngOnInit() {
    this.globalServ.getMyCompLabels('payrollSummary');
    this.globalServ.getMyCompPlaceHolders('payrollSummary');
    if (this.utilServ.viewData) {
      this.fromRunPayroll = true;
      this.isFinilized = false;
      this.getNetAmt();
    } else {
      this.fromRunPayroll = false;
      this.getPayrollCodes();
    }
  }

  isPenalityExist(setData) {
    const status = setData?.modifiedList?.some(item => item.isDeduction === true && item.isPenalty === true)
    return status
  }
  getPayrollCodes() {
    this.httpGet.getMasterList('payrollsetups').subscribe(
      (res: any) => {
        this.payrollsetups = res.response;
        const hasDefault = res.response.find(x => x.isDefault == true)
        if (hasDefault) {
          this.reportObj.payrollCode = (hasDefault.payrollCode)
        }
        else {
          this.reportObj.payrollCode = (res.response[0]?.payrollCode)
        }
        this.changeInPayroll();
      },
      (err) => {
        console.error(err.error.status.message);
      }
    );
  }
  changeInPayroll() {
    const foundRecord = this.payrollsetups.find(x => x.payrollCode == this.reportObj.payrollCode)
    this.salaryFrequency = foundRecord.salaryFrequency
    if (foundRecord.salaryFrequency === 'Month' || this.reportObj.payrollCode == 'ALL') {
      this.maxDt = moment().format('YYYY-MM');
    } else {
      this.maxDt = moment().format('YYYY-MM-DD');
    }
  }

  getRunIdsByDatePicker() {
    this.isFinilized = true;
    if (this.fulldate) {
      const dateSplit = this.fulldate.split('-');
      if (dateSplit.length > 2) {
        this.reportObj.date = dateSplit[2];
        this.reportObj.month = dateSplit[1];
        this.reportObj.year = dateSplit[0];
      } else {
        this.reportObj.date = '01';
        this.reportObj.month = dateSplit[1];
        this.reportObj.year = dateSplit[0];
      }
      this.stopSpinner = false;
      this.spinner.show();
      this.httpGet.getMasterList('payrollRunCal/runIds?year=' + this.reportObj.year +
        '&month=' + this.reportObj.month + '&date=01' + '&payrollCode=' + this.reportObj.payrollCode).subscribe((res: any) => {
          this.runIdsList = res.response.sort((a, b) => a.Id - b.Id);
          this.stopSpinner = true;
          this.spinner.hide();
        }, err => {
          this.spinner.hide();
          this.stopSpinner = true;
          console.error(err.error.status.message);
        })
    }
  }

  getSalaryCompByIds() {
    if (this.reportObj.runId == '-') {
      this.runs = [];
      this.Period = null;
      this.temp = [];
      this.getCompSpends();
    } else {
      const isFinalized = this.runIdsList.find(x => x.Id == this.reportObj.runId);
      this.isFinilized = isFinalized.Status == 'Finalized' ? true : false
      this.spinner.show();
      this.httpGet.getMasterList('components/runId/' + this.reportObj.runId).subscribe((res: any) => {
        res.response.forEach(x => {
          x.deductionAmt = null,
            x.Finalize = false,
            x.isApprove = false,
            x.deductionAmt = null,
            x.earningsAmt = null;
          x.netAmt = null;
          if (x.salaryComponents) {
            x.salaryComponents.forEach(element => {
              if (element.isDeduction == true) {
                x.deductionAmt += element.amount
              } else if (element.isDeduction == false) {
                x.earningsAmt += element.amount
              }
              x.netAmt = x.earningsAmt - x.deductionAmt
            });
          }
        });
        this.runs = res.response;
        this.Period = res.response[0]?.salaryComponents[0]?.periodCode;
        this.temp = res.response;
        this.getCompSpends();
        if (res.response.length === 0) {
          Swal.fire({
            title: 'Info!',
            text: 'No records found',
            icon: 'info',
          });
        }
        this.spinner.hide();
      },
        err => {
          this.spinner.hide();
          this.runs = [];
          this.temp = [];
          this.getCompSpends();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
          console.error(err.error.status.message);

        })
    }
  }


  approveAllItem(): void {
    // this.appoveAll = event.target.checked;
    this.appoveAll = true;
    if (this.appoveAll) {
      this.runs.forEach(value => {
        value.checked = true;
        // value.isApprove = true;
        value.Finalize = true;

      });
    } else {
      this.runs.forEach(value => {
        if (value.checked) {
          // value.isApprove = false;
          value.Finalize = false;
        }
      })
    }
    this.submit();
  }



  getCompSpends() {
    this.Netsum = 0;
    this.DedSum = 0;
    this.earSum = 0;
    this.totalWorkedDays = 0;
    this.totalWorkingDays = 0;
    this.totalPayableDays = 0;
    let DedSum1 = 0, earSum1 = 0, Netsum1 = 0;
    this.runs.forEach(x => {
      DedSum1 += x.deductionAmt ? x.deductionAmt : 0;
      earSum1 += x.earningsAmt ? x.earningsAmt : 0;
      Netsum1 += x.netAmt ? x.netAmt : 0;
      this.totalWorkedDays += x.workedDays ? x.workedDays : 0;
      this.totalWorkingDays += x.workingDays ? x.workingDays : 0;
      this.totalPayableDays += x.payableDays ? x.payableDays : 0;
    })
    const DedSum = Math.round(DedSum1).toLocaleString('en-IN');
    const earSum = Math.round(earSum1).toLocaleString('en-IN');
    const Netsum = Math.round(Netsum1).toLocaleString('en-IN');
    // this.earSum = parseInt(earSum.replace(/,/g, ''));
    // this.DedSum = parseInt(DedSum.replace(/,/g, ''));
    // this.Netsum = parseInt(Netsum.replace(/,/g, ''));
    this.earSum = earSum;
    this.DedSum = DedSum;
    this.Netsum = Netsum;
    this.companySpendsTotal = [];
    const companySpendsTotal: { componentCode: string, amount: any, isDeduction: boolean }[] = [];

    const componentAmountsMap = new Map<string, { amount: any, isDeduction: boolean }>();

    this.runs.forEach((employee: Employee) => {
      employee.salaryComponents?.forEach((component: SalaryComponent) => {
        //   const existingAmount = componentAmountsMap.get(component.componentCode) || 0;
        //   componentAmountsMap.set(component.componentCode, existingAmount + component.amount, component.isDeduction );
        // });
        const existingAmount = componentAmountsMap.get(component.componentCode);
        const amount = existingAmount ? existingAmount.amount + component.amount : component.amount;
        componentAmountsMap.set(component.componentCode, { amount, isDeduction: component.isDeduction });
      });
    });
    componentAmountsMap.forEach((value, key) => {
      if (key !== 'Total Salary' && key !== 'CTC') {
        companySpendsTotal.push({ componentCode: key, amount: Math.round(value.amount).toLocaleString('en-IN'), isDeduction: value.isDeduction });
      }
    });
    this.companySpendsTotal = companySpendsTotal
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.runs = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.runs = temp;
    }
    // this.config.totalItems = this.payrollMasterData.length;
    // this.config.currentPage = 1;
  }
  getNetAmt() {
    this.utilServ.viewData?.forEach(x => {
      x.deductionAmt = null,
        x.Finalize = false,
        x.isApprove = false,
        x.deductionAmt = null,
        x.earningsAmt = null;
      x.netAmt = null;
      if (x.salaryComponents) {
        x.salaryComponents.forEach(element => {
          if (element.isDeduction == true) {
            x.deductionAmt += element.amount
          } else if (element.isDeduction == false) {
            x.earningsAmt += element.amount
          }
          x.netAmt = x.earningsAmt - x.deductionAmt
        });
      }
    })
    this.runs = this.utilServ.viewData;
    this.temp = this.utilServ.viewData;
    this.Period = this.utilServ.viewData[0]?.salaryComponents ? this.utilServ.viewData[0]?.salaryComponents[0]?.periodCode : null;
    this.getCompSpends();

  }
  goto(runsRow) {
    runsRow.modifiedList = [];
    const dedRows = [], earRows = [];
    this.dedAmt = 0, this.earAmt = 0;
    runsRow.salaryComponents?.forEach(element => {
      if (element.isDeduction == true) {
        dedRows.push(element)
        this.dedAmt += element.amount
      } else if (element.isDeduction == false) {
        earRows.push(element)
        this.earAmt += element.amount
      }
    });
    this.netAmt = this.earAmt - this.dedAmt
    const diff = earRows.length - dedRows.length
    if (diff < 0) {
      // If the difference is negative, push that many rows into earRows
      for (let i = 0; i < Math.abs(diff); i++) {
        earRows.push({
          componentCode: '',
          amount: null,
          isDeduction: false
        });
      }
    } else if (diff > 0) {
      // If the difference is positive, push that many rows into dedRows
      for (let i = 0; i < diff; i++) {
        dedRows.push({
          componentCode: '',
          amount: null,
          isDeduction: true
        });
      }
    }
    const modifiedList = [...earRows, ...dedRows];
    runsRow.modifiedList = modifiedList.sort((a, b) => {
      return a.sortOrder - b.sortOrder;
    })
    this.setData = runsRow
  }
  closeModel(dismiss) {
    this.activeModal.dismiss(dismiss);
  }

  clickToApprove(ev, val) {
    if (val.isApprove == true) {
      val.isApprove = false;
      val.Finalize = false;
    }
    else {
      val.isApprove = true;
      val.Finalize = true;
    }
  }

  clickFinalise(ev, value) {
    if (value.Finalize == true) {
      value.Finalize = false;
    }
    else {
      value.Finalize = true;
    }
  }

  submit() {
    const selectedRecords = this.runs.filter(x => x.Finalize == true)
    // selectedRecords.forEach(data => {
    //   if (data.salaryComponents) {
    //     if (data.Finalize) {
    //       data.salaryComponents.forEach(row => {
    //         row.isFinalized = true;
    //       });
    //     }
    //     if (data.isApprove) {
    //       data.salaryComponents.forEach(row => {
    //         row.approved = true;
    //       });
    //     }
    //   }
    // })
    selectedRecords.forEach(data => {
      // if (data.salaryComponents) {
      //   listOfRecords.push(...data.salaryComponents)
      // }
      // if (data.isApprove) {
      data.isFinalized = true;
      data.isApproved = true
      // }
    })
    if (selectedRecords.length > 0) {
      this.spinner.show();
      this.httpPut.doPut('components/approve/finalize', JSON.stringify(selectedRecords)).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            this.utilServ.viewData = null;
            this.fromRunPayroll = false;
            this.getPayrollCodes();
            this.runs = [];
            this.getCompSpends();
            Swal.fire({
              title: 'Success!',
              text: 'Records Submitted Successfully',
              icon: 'success',
              timer: 10000,
            })
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
      )
    }
    else {
      Swal.fire({
        title: 'Info!',
        text: 'Please approve some records',
        icon: 'info',
      });
    }
  }
  ngOnDestroy() {
    this.utilServ.viewData = null;
    this.utilServ.editData = null;
  }

  saveExcel() {
    if (this.reportObj.runId == '-' || this.reportObj.runId == '' || this.reportObj.runId == null) {
      Swal.fire({
        title: 'Info!',
        text: 'Please select a run Id to download the report',
        icon: 'info',
      });
    } else {
      this.spinner.show();
      this.httpGet.getExcel('reports/payrollSummary/xls/' + this.reportObj.runId).subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        const fileName = 'Payroll_summary_report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_')
        FileSaver.saveAs(
          data,
          fileName + EXCEL_EXTENSION
        );
        this.globalServ.showSuccessPopUp('Excel', 'success', fileName);
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          })
        });
    }
  }

  saveExcel2() {
    let runId = this.runs[0].runId;
    if (!runId) {
      for (const run of this.runs) {
        if (run.runId) {
          runId = run.runId;
          break;
        }
      }
    }
    this.spinner.show();
    this.httpGet.getExcel('reports/payrollSummary/xls/' + runId).subscribe((res: any) => {
      this.spinner.hide();
      const data: Blob = new Blob([res], { type: EXCEL_TYPE });
      const fileName = 'Payroll_summary_report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_')
      FileSaver.saveAs(
        data,
        fileName + EXCEL_EXTENSION
      );
      this.globalServ.showSuccessPopUp('Excel', 'success', fileName);
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
}
