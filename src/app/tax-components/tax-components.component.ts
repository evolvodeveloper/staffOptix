import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { httpDeleteService } from '../services/http-delete.service';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';
import { HttpPutService } from '../services/http-put.service';
import { UtilService } from '../services/util.service';

interface TaxDetail {
  id: number;
  taxPlanCode: string;
  fyCode: string;
  taxRate: number;
  taxSlabStart: number;
  taxSlabEnd: number;
  createdBy: string;
  createddate: null | string;
  uiGroupingName: string;
  countryCode: string;
  ageGroup: string;
}

interface TaxPlan {
  [ageGroup: string]: TaxDetail[];
}

interface TaxData {
  [header: string]: TaxPlan;
}


interface TaxSlab {
  incomeRange: string;
  taxRate: string;
}
@Component({
  selector: 'app-tax-components',
  templateUrl: './tax-components.component.html',
  styleUrl: './tax-components.component.scss'
})
export class TaxComponentsComponent {
  taxDeductionsList = [];
  taxExemptions = [];
  financialYears = [];
  listOfMonthsInFY = [];


  selectedRegime: string = '';
  regimeLabels: { [key: string]: { name: string; code: string } } = {};
  isLoading: boolean;
  selectedFY: string;
  declarationTab = true;
  previousIncomeTab = false;
  form12BBTab = false;
  taxFilingTab = false;
  taxSavingInvestmentTab = false;
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  taxPlans: any;
  selectedPlan: string;
  myDeclarTab = true;
  LakhExemptionTab = false;
  otherExempTab = false;
  taxSavingExemptionTab = false;
  housePropTab = false;
  activeTab: string = '1.5 lakh deduction sections'; // Default active tab
  selectedRegimeRecord: any;
  constructor(public activeModal: NgbActiveModal,
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private httPost: HttpPostService,
    private httpPut: HttpPutService,
    private httpDelete: httpDeleteService
  ) {
    this.financialYears = this.getFinancialYears();
    const data = localStorage.getItem('selectedPlan');
    this.selectedPlan = data ? JSON.parse(data).value : ''
    this.selectedRegime = data ? JSON.parse(data).key : ''
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }
  onPlanChange(plan: string) {
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    const data = localStorage.getItem('selectedPlan')
    // data.value.name
    this.selectedPlan = data ? JSON.parse(data).value : ''
    this.selectedRegime = data ? JSON.parse(data).key : ''
    if (this.selectedRegimeRecord.id !== null && this.selectedRegimeRecord.id !== undefined) {
      this.updateTaxRegimePlan();
    } else {
      this.createTaxRegimePlan();
    }

  }
  createTaxRegimePlan() {
    const obj = {
      "fyCode": this.selectedFY,
      "taxPlanCode": this.selectedPlan['code'],
      "processed": false
    }
    this.spinner.show();
    this.httPost.create('emp/tax/regime', obj).subscribe((res: any) => {
      this.spinner.hide();
    }, err => {
      console.error(err);
      this.spinner.hide();
    })
  }
  updateTaxRegimePlan() {
    const obj = {
      "id": this.selectedRegimeRecord.id,
      "fyCode": this.selectedFY,
      "taxPlanCode": this.selectedPlan['code'],
      "processed": false
    }
    this.spinner.show();
    this.httpPut.doPut('emp/tax/regime', obj).subscribe((res: any) => {
      this.spinner.hide();
    }, err => {
      console.error(err);
      this.spinner.hide();
    })
  }
  ngOnInit() {
    this.getTaxRates();
  }
  getSelectedTaxRegime() {
    this.spinner.show();
    this.httpGet.getMasterList('emp/tax/regime?fy_code=' + this.selectedFY).subscribe((res: any) => {
      this.spinner.hide();
      this.selectedRegimeRecord = res.response;
      this.generateRegimeLabels(this.taxPlans);
      for (const key in this.regimeLabels) {
        if (this.regimeLabels[key].code === this.selectedRegimeRecord.taxPlanCode) {
          const converted = {
            key: key,
            value: this.regimeLabels[key]
          };
          localStorage.setItem('selectedPlan', JSON.stringify(converted));
          const data = JSON.stringify(this.regimeLabels[key])
          this.selectedPlan = data ? JSON.parse(data) : ''
          this.selectedRegime = key
          break;
        }
      }
      // this.getEmpDeductions();
      // this.getEmpExemptions();
    },
      err => {
        this.spinner.hide();
        console.error(err);
      })
  }
  async getTaxRates() {
    this.isLoading = true;
    let taxPlans: any;
    if (!this.utilServ.taxRates) {
      this.httpGet.getMasterList('tax/rates').subscribe((res: any) => {
        taxPlans = res.response;
        this.utilServ.taxRates = res.response;
        this.isLoading = false;
        this.taxPlans = this.transformTaxData(taxPlans);
        this.getSelectedTaxRegime();
      },
        err => {
          console.error(err);
        })
    } else {
      taxPlans = this.utilServ.taxRates;
      this.taxPlans = this.transformTaxData(taxPlans);
      this.getSelectedTaxRegime();
      this.isLoading = false;
    }
  }
  generateRegimeLabels(data) {
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        const taxPlanCode = value[0].taxPlanCode;
        this.regimeLabels[key] = {
          name: this.formatRegimeLabel(key),
          code: taxPlanCode,
        }
      } else {
        for (const subKey of Object.keys(value)) {
          const taxPlanCode = value[subKey][0].taxPlanCode// Adjust as needed
          this.regimeLabels[`${key}.${subKey}`] = {
            name: this.formatRegimeLabel(key, subKey),
            code: taxPlanCode,
          };
        }
      }
    }
  }

  formatRegimeLabel(regime: string, ageGroup?: string): string {
    const regimeLabel = regime.replace(/([A-Z])/g, ' $1').trim();
    if (ageGroup) {
      const ageLabel = ageGroup.replace(/([A-Z])/g, ' $1').trim();
      return `${regimeLabel} (${ageLabel})`;
    }
    return regimeLabel;
  }

  get selectedData(): TaxSlab[] {
    if (!this.selectedRegime) return [];
    const [regime, ageGroup] = this.selectedRegime.split('.');
    return ageGroup
      ? (this.taxPlans[regime] as { [key: string]: TaxSlab[] })[ageGroup] || []
      : this.taxPlans[regime] as TaxSlab[];
  }

  get selectedRegimeLabel(): string {
    const regimeInfo = this.regimeLabels[this.selectedRegime];
    if (regimeInfo) {
      return `${regimeInfo.name}`;
    }
    return '';
  }
  transformTaxData(taxData: TaxData) {
    const NewTaxRegime = [];
    const OldTaxRegime: { [key: string]: any[] } = {};

    // Assuming taxPlanCode is available in taxData
    const taxPlanCode = taxData['NEW REGIME TAX PLAN']['taxPlanCode'] || '';

    // Transforming the new tax regime
    const newRegimeDetails = taxData['NEW REGIME TAX PLAN']['No Age Limit'];
    for (const detail of newRegimeDetails) {
      const incomeRange = detail.taxSlabStart === 0
        ? `Up to ₹${detail.taxSlabEnd.toLocaleString()}`
        : detail.taxSlabEnd >= 100000000000
          ? `Above ₹${detail.taxSlabStart.toLocaleString()}`
          : `₹${detail.taxSlabStart.toLocaleString()} to ₹${detail.taxSlabEnd.toLocaleString()}`;
      const taxRate = detail.taxRate === 0 ? "Nil" : `${detail.taxRate}%`;
      const taxPlanCode = detail.taxPlanCode

      // Include taxPlanCode in the new tax regime
      NewTaxRegime.push({ incomeRange, taxRate, taxPlanCode });
    }

    // Transforming the old tax regime
    for (const ageGroup in taxData['OLD REGIME TAX PLAN']) {
      // Initialize the array for each age group dynamically
      if (!OldTaxRegime[ageGroup]) {
        OldTaxRegime[ageGroup] = [];
      }

      const ageDetails = taxData['OLD REGIME TAX PLAN'][ageGroup];

      for (const detail of ageDetails) {
        const incomeRange = detail.taxSlabStart === 0
          ? `Up to ₹${detail.taxSlabEnd.toLocaleString()}`
          : detail.taxSlabEnd >= 100000000000
            ? `Above ₹${detail.taxSlabStart.toLocaleString()}`
            : `₹${detail.taxSlabStart.toLocaleString()} to ₹${detail.taxSlabEnd.toLocaleString()}`;

        const taxRate = detail.taxRate === 0 ? "Nil" : `${detail.taxRate}%`;
        const taxPlanCode = detail.taxPlanCode
        // Push the tax slab into the correct age group dynamically
        OldTaxRegime[ageGroup].push({ incomeRange, taxRate, taxPlanCode });
      }
    }
    return { NewTaxRegime, OldTaxRegime };
  }


  getEmpDeductions() {
    this.spinner.show();
    this.httpGet.getMasterList('emp/tax/deductions?fy_code=' + this.selectedFY + '&tax_plan_code=' + this.selectedPlan['code']).subscribe((res: any) => {
      const emptaxDeductionsList = res.response;
      this.spinner.hide();
      this.getDeductions(emptaxDeductionsList);
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error', showConfirmButton: true,
        });

      })
  }
  getEmpExemptions() {
    this.spinner.show();
    this.httpGet.getMasterList('emp/tax/exemptions?fy_code=' + this.selectedFY + '&tax_plan_code=' + this.selectedPlan['code']).subscribe((res: any) => {
      const emptaxExemptions = res.response;
      this.spinner.hide();
      this.getExemptions(emptaxExemptions);
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error', showConfirmButton: true,
        });

      })
  }
  getFileStream() {
    const data = { "fileName": "e2b0fa12-0270-4d63-867f-217cd538a315.jpg", "fileId": 10 }
    this.httpGet.getPdf('file/jpg/' + data.fileName).subscribe((res: any) => {
      const fileExtension = data.fileName.split('.').pop();
      const file = new Blob([res]);
      FileSaver.saveAs(file, 'Proof' + new Date().getTime() + '.' + fileExtension);
    })
  }
  getDeductions(emptaxDeductions) {
    this.spinner.show();
    this.httpGet.getMasterList('tax/deductions?fy_code=' + this.selectedFY).subscribe((res: any) => {
      const taxDeductionsList = res.response;
      const deductionsMap = new Map();
      this.spinner.hide();
      // Populate the map with emptaxDeductions
      emptaxDeductions.forEach(deduction => {
        const key = `${deduction.deductionCode}-${deduction.subDeductionCode}`;
        deductionsMap.set(key, {
          taxDeductionSubmittedAmount: deduction.taxDeductionSubmittedAmount,
          attachmentId: deduction.attachmentId,
          postId: deduction.id,
          taxPlanCode: deduction.taxPlanCode,
          fyCode: deduction.fyCode,
          "taxDeductionApprovedAmount": deduction.taxDeductionApprovedAmount,
          "createdBy": deduction.createdBy,
          "updatedBy": deduction.updatedBy,
          "createdAt": deduction.createdAt,
          "updatedAt": deduction.updatedAt,
        });
      });
      Object.keys(taxDeductionsList).forEach(group => {
        taxDeductionsList[group].forEach(item => {
          item.taxDeductions.forEach(deduction => {
            // Generate the key for lookup
            const key = `${deduction.deductionCode}-${deduction.subDeductionCode}`;
            if (deductionsMap.has(key)) {
              const { taxDeductionSubmittedAmount, attachmentId, postId, taxPlanCode, fyCode, taxDeductionApprovedAmount,
                createdBy, updatedBy, createdAt, updatedAt } = deductionsMap.get(key);
              //  } = deductionsMap.get(key);
              // Attach the values
              deduction.taxDeductionSubmittedAmount = taxDeductionSubmittedAmount;
              deduction.attachmentId = attachmentId;
              deduction.file = attachmentId;
              deduction.taxPlanCode = taxPlanCode;
              deduction.fyCode = fyCode;
              deduction.postId = postId,
                deduction.taxDeductionApprovedAmount = taxDeductionApprovedAmount,
                deduction.createdBy = createdBy,
                deduction.updatedBy = updatedBy,
                deduction.createdAt = createdAt,
                deduction.updatedAt = updatedAt
            } else {
              // If not found, you can set them to null or leave them as is
              deduction.taxDeductionSubmittedAmount = null;
              deduction.attachmentId = null;
              deduction.file = null;
              deduction.postId = null
              deduction.taxDeductionApprovedAmount = null,
                deduction.createdBy = null,
                deduction.updatedBy = null,
                deduction.createdAt = null,
                deduction.updatedAt = null
            }
            // Add new keys if necessary
            deduction.filetype = null; // Example value
          });
        });
      });
      this.taxDeductionsList = taxDeductionsList
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error', showConfirmButton: true,
        });

      })
  }



  getExemptions(emptaxExemptions) {
    this.httpGet.getMasterList('tax/exemptions?fy_code=' + this.selectedFY).subscribe((res: any) => {
      const taxExemptionsList = res.response;
      const exemptionsMap = new Map();
      this.spinner.hide();
      // Populate the map with emptaxDeductions
      emptaxExemptions.forEach(ex => {
        const key = `${ex.exemptionCode}-${ex.subExemptionCode}`;
        exemptionsMap.set(key, {
          taxExemptionSubmittedAmount: ex.taxExemptionSubmittedAmount,
          attachmentId: ex.attachmentId,
          postId: ex.id,
          taxPlanCode: ex.taxPlanCode,
          fyCode: ex.fyCode,
          "taxExemptionApprovedAmount": ex.taxExemptionApprovedAmount,
          "createdBy": ex.createdBy,
          "updatedBy": ex.updatedBy,
          "createdAt": ex.createdAt,
          "updatedAt": ex.updatedAt,
        });
      });

      Object.keys(taxExemptionsList).forEach(group => {
        taxExemptionsList[group].forEach(item => {
          item.taxExemptionList.forEach(exm => {
            // Generate the key for lookup
            const key = `${exm.exemptionCode}-${exm.subExemptionCode}`;
            if (exemptionsMap.has(key)) {
              const { taxExemptionSubmittedAmount, attachmentId, postId, taxPlanCode, fyCode, taxExemptionApprovedAmount,
                createdBy, updatedBy, createdAt, updatedAt } = exemptionsMap.get(key);
              // Attach the values
              exm.taxExemptionSubmittedAmount = taxExemptionSubmittedAmount;
              exm.attachmentId = attachmentId;
              exm.file = attachmentId;
              exm.taxPlanCode = taxPlanCode;
              exm.fyCode = fyCode;
              exm.postId = postId,
                exm.taxExemptionApprovedAmount = taxExemptionApprovedAmount,
                exm.createdBy = createdBy,
                exm.updatedBy = updatedBy,
                exm.createdAt = createdAt,
                exm.updatedAt = updatedAt
            } else {
              // If not found, you can set them to null or leave them as is
              exm.taxExemptionSubmittedAmount = null;
              exm.attachmentId = null;
              exm.file = null;
              exm.postId = null
              exm.taxExemptionApprovedAmount = null,
                exm.createdBy = null,
                exm.updatedBy = null,
                exm.createdAt = null,
                exm.updatedAt = null
            }
            // Add new keys if necessary
            exm.filetype = null; // Example value
          });
        });
      });
      this.taxExemptions = taxExemptionsList
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error', showConfirmButton: true,
        });

      })
  }
  cities = ['Mumbai', 'Delhi', 'Hyderabad', 'chennai', 'Other Non Metro', 'Other Metro']
  rentedFrom = [];

  tab1() { this.declarationTab = true; this.previousIncomeTab = false; this.form12BBTab = false; this.taxFilingTab = false; this.taxSavingInvestmentTab = false }
  tab2() { this.declarationTab = false; this.previousIncomeTab = true; this.form12BBTab = false; this.taxFilingTab = false; this.taxSavingInvestmentTab = false }
  tab3() { this.declarationTab = false; this.previousIncomeTab = false; this.form12BBTab = true; this.taxFilingTab = false; this.taxSavingInvestmentTab = false }
  tab4() { this.declarationTab = false; this.previousIncomeTab = false; this.form12BBTab = false; this.taxFilingTab = true; this.taxSavingInvestmentTab = false }
  tab5() { this.declarationTab = false; this.previousIncomeTab = false; this.form12BBTab = false; this.taxFilingTab = false; this.taxSavingInvestmentTab = true }

  getFinancialYears(): string[] {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Month is zero-indexed (0 = January, 11 = December)

    // Calculate the start and end years for the financial years
    let startYear = currentYear;
    let endYear = currentYear + 1;

    // If the current month is before April (January to March), use the previous year's financial year
    if (currentMonth < 3) { // 3 means March, so if before April (Jan, Feb, Mar)
      startYear = currentYear - 1;
      endYear = currentYear;
    }

    const financialYears: string[] = [];

    // Generate the last 2 years of financial years, including the current one
    for (let year = startYear - 2; year <= endYear; year++) {
      const start = `${year}`;
      const end = `${year + 1}`;
      financialYears.push(`${start}-${end}`);
    }

    // Set the current financial year for the selectedFY variable
    this.selectedFY = `${startYear}-${endYear}`;
    this.getMonthsBetween(this.selectedFY);

    return financialYears;
  }
  getMonthsBetween(dateRange): string[] {
    // Function to parse a date string in the format 'Month YYYY'
    // Extract start and end dates from the range string
    const [startDate, endDate] = dateRange.split('-').map(date => date.trim());

    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    const months: string[] = [];

    let currentMonth = start.month;
    let currentYear = start.year;
    // Generate all months between start and end dates
    while (currentYear < end.year || (currentYear === end.year && currentMonth <= end.month)) {
      months.push(`${this.monthNames[currentMonth].substring(0, 3).toUpperCase()} ${currentYear.toString().slice(-2)}`);
      // Move to the next month
      currentMonth++;
      if (currentMonth > 11) { // Wrap around to next year
        currentMonth = 0;
        currentYear++;
      }
    }
    // If the end date is before the start date, reverse the list
    if (end.year < start.year || (end.year === start.year && end.month < start.month)) {
      return months.reverse();
    }
    this.listOfMonthsInFY = months
  }
  parseDate = (date: string) => {
    const [month, year] = date.split(' ');
    const monthIndex = this.monthNames.indexOf(month);
    return {
      month: monthIndex,
      year: parseInt(year)
    };
  };

  closeModel(dismiss) {
    this.activeModal.dismiss(dismiss);
  }
  remove(row, source) {
    if (!row.attachmentId) {
      row.file = null
    } else {

    }
    if (source == 'TAX_DEDUCTION') {
      row.taxDeductionSubmittedAmount = row.OrgDeductionAmt;
      row.attachmentId = row.OrgAttachId;
    } else {
      row.taxExemptionSubmittedAmount = row.OrgtaxExmAmt;
      row.attachmentId = row.OrgAttachId;
    }
    row.Editrecord = false;
  }
  editRow(row, source) {
    row.Editrecord = true;
    if (source == 'TAX_DEDUCTION') {
      row.OrgDeductionAmt = row.taxDeductionSubmittedAmount;
      row.OrgAttachId = row.attachmentId;
    } else {
      row.OrgtaxExmAmt = row.taxExemptionSubmittedAmount;
      row.OrgAttachId = row.attachmentId;
    }
  }


  deleteProof(deleteRecord) {
    if (deleteRecord.attachmentId) {
      Swal.fire({
        title: 'Are you sure?',
        html: 'Do You Want to Delete ?',
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33', confirmButtonText: 'Yes', allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.spinner.show();
          this.httpDelete.delete('file?fileId=' + deleteRecord.attachmentId).subscribe((res: any) => {
            if (res.status.message == 'SUCCESS') {
              this.spinner.hide();
              deleteRecord.attachmentId = null;
              deleteRecord.file = null;
              Swal.fire({
                title: 'File Deleted',
                text: 'Your file has been successfully deleted. Don’t forget to save your changes!',
                icon: 'success', showConfirmButton: true,
              });
            } else {
              this.spinner.hide();
              Swal.fire({
                title: 'Error!',
                text: res.status.message,
                icon: 'error', showConfirmButton: true,
              });
            }
          }, err => {
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error', showConfirmButton: true,
            });
          }
          )
        }
      })
    } else {
      deleteRecord.file = null
    }
  }
  saveRow(row, source) {
    if (row.file) {
      this.spinner.show();
      this.httPost.multiPartFileUpload('file', row.file).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.attachmentId = res.response.fileId;
          row.OrgAttachId = res.response.fileId;
          if (source == 'TAX_DEDUCTION') {
            this.SubmitTheDeductionRecord(row);
          } else {
            this.SubmitTheExemptionRecord(row);

          }
        } else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            showConfirmButton: true,
          });
        })
    }
    else {
      if (source == 'TAX_DEDUCTION') {
        this.SubmitTheDeductionRecord(row);
      } else {
        this.SubmitTheExemptionRecord(row);
      }
    }
  }

  SubmitTheDeductionRecord(row) {
    if (!row.postId) {
      this.spinner.show();
      // create record
      const obj = {
        "fyCode": this.selectedFY,
        "taxPlanCode": this.selectedPlan['code'],
        "deductionGroupCode": row.deductionGroupCode,
        "deductionCode": row.deductionCode,
        subDeductionCode: row.subDeductionCode,
        "taxDeductionSubmittedAmount": row.taxDeductionSubmittedAmount,
        "attachmentId": row.attachmentId,
      }
      this.httPost.create('emp/tax/deductions', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.Editrecord = false;
          Swal.fire({
            title: 'Success',
            text: 'Your Changes where saved',
            icon: 'success', showConfirmButton: true,
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            showConfirmButton: true,
          });
        })

    } else {
      // update
      this.spinner.show();
      const obj = {
        id: row.postId,
        "fyCode": row.fyCode,
        "taxPlanCode": row.taxPlanCode,
        "deductionGroupCode": row.deductionGroupCode,
        "deductionCode": row.deductionCode,
        subDeductionCode: row.subDeductionCode,
        "taxDeductionSubmittedAmount": row.taxDeductionSubmittedAmount,
        "attachmentId": row.attachmentId,
        "taxDeductionApprovedAmount": row.taxDeductionApprovedAmount,
        "createdBy": row.createdBy,
        "updatedBy": row.updatedBy,
        "createdAt": row.createdAt,
        "updatedAt": row.updatedAt,
      }
      this.httpPut.doPut('emp/tax/deductions', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.Editrecord = false;
          Swal.fire({
            title: 'Success',
            text: 'Your Changes where Updated',
            icon: 'success', showConfirmButton: true,
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            showConfirmButton: true,
          });
        })

    }
  }
  SubmitTheExemptionRecord(row) {
    if (!row.postId) {
      this.spinner.show();
      const obj = {
        "fyCode": this.selectedFY,
        "taxPlanCode": this.selectedPlan['code'],
        "exemptionGroupCode": row.exemptionGroupCode,
        "exemptionCode": row.exemptionCode,
        "taxExemptionSubmittedAmount": row.taxExemptionSubmittedAmount,
        subExemptionCode: row.subExemptionCode,
        "attachmentId": row.attachmentId
      }
      this.httPost.create('emp/tax/exemptions', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.Editrecord = false;
          Swal.fire({
            title: 'Success',
            text: 'Your Changes where saved',
            icon: 'success', showConfirmButton: true,
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            showConfirmButton: true,
          });
        })
    } else {
      this.spinner.show();
      const obj = {
        id: row.postId,
        "fyCode": row.fyCode,
        "taxPlanCode": row.taxPlanCode,
        "exemptionGroupCode": row.exemptionGroupCode,
        "exemptionCode": row.exemptionCode,
        "taxExemptionSubmittedAmount": row.taxExemptionSubmittedAmount,
        subExemptionCode: row.subExemptionCode,
        "taxExemptionApprovedAmount": row.taxExemptionApprovedAmount,
        "createdBy": row.createdBy,
        "updatedBy": row.updatedBy,
        "createdAt": row.createdAt,
        "updatedAt": row.updatedAt,
      }
      this.httpPut.doPut('emp/tax/exemptions', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.Editrecord = false;
          Swal.fire({
            title: 'Success',
            text: 'Your Changes where Updated',
            icon: 'success', showConfirmButton: true,
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            showConfirmButton: true,
          });
        })
    }
  }

  deleteRow(row, source) {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Do You Want to Delete the record?',
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33', confirmButtonText: 'Yes', allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        if (row.attachmentId && !row.postId) {
          this.httpDelete.delete('file?fileId=' + row.attachmentId).subscribe((res: any) => {
            // row.taxDeductionSubmittedAmount = null;
            row.Editrecord = false;
            row.attachmentId = null;
            row.file = null;
          })
        } else {
          row.Editrecord = false;
          row.file = null;
        }
        if (source == 'TAX_DEDUCTION') {
          if (row.postId) {
            this.httpDelete.delete('emp/tax/deductions?id=' + row.postId).subscribe((res: any) => {
              if (res.status.message == 'SUCCESS') {
                this.spinner.hide();
                row.postId = null;
                row.taxDeductionSubmittedAmount = null;
                row.Editrecord = false;
                row.file = null;
                row.attachmentId = null;
                Swal.fire({
                  title: 'Record Deleted',
                  icon: 'success', showConfirmButton: true,
                });
              } else {
                this.spinner.hide();
                Swal.fire({
                  title: 'Error!',
                  text: res.status.message,
                  icon: 'error', showConfirmButton: true,
                });
              }
            }, err => {
              this.spinner.hide();
              Swal.fire({
                title: 'Error!',
                text: err.error.status.message,
                icon: 'error', showConfirmButton: true,
              });
            })
          } else {
            row.taxDeductionSubmittedAmount = null;
            row.Editrecord = false;
            this.spinner.hide();
            // } else {
            //   row.taxExemptionSubmittedAmount = null;
            //   row.Editrecord = false;
            // }
          }
        }
        else {
          if (row.postId) {
            this.httpDelete.delete('emp/tax/exemptions?id=' + row.postId).subscribe((res: any) => {
              if (res.status.message == 'SUCCESS') {
                this.spinner.hide();
                row.postId = null;
                row.taxExemptionSubmittedAmount = null;
                row.Editrecord = false;
                row.file = null;
                row.attachmentId = null;
                Swal.fire({
                  title: 'Record Deleted',
                  icon: 'success', showConfirmButton: true,
                });
              } else {
                this.spinner.hide();
                Swal.fire({
                  title: 'Error!',
                  text: res.status.message,
                  icon: 'error', showConfirmButton: true,
                });
              }
            }, err => {
              this.spinner.hide();
              Swal.fire({
                title: 'Error!',
                text: err.error.status.message,
                icon: 'error', showConfirmButton: true,
              });
            })
          } else {
            this.spinner.hide();
            row.taxExemptionSubmittedAmount = null;
            row.Editrecord = false;
          }
        }
      }
    })
  }

  openFileInput(inputId: string) {
    document.getElementById(inputId).click();
  }
  sendFile(ev: any, row: any, source: string) {
    const formData = new FormData();
    const file = ev.target.files[0];
    if (file) {
      formData.append('file', file);
      formData.append('fileType', source);
      row.file = formData;
    }
  }
}
