import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, tap } from 'rxjs';
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
  selector: 'app-tax-declaration',
  templateUrl: './tax-declaration.component.html',
  styleUrl: './tax-declaration.component.scss'
})
export class TaxDeclarationComponent {
  taxDeductionsList = [];
  taxExemptions = [];
  financialYears = [];
  listOfMonthsInFY = [];

  selectedCurrency = 'INR'; // Default currency (can be 'INR', 'CAD', or 'USD')

  // Maps for currency symbols and locales
  currencyMap: { [key: string]: string } = {
    INR: '₹',
    USD: '$',
    CAD: 'CA$',
  };

  localeMap: { [key: string]: string } = {
    INR: 'en-IN',
    USD: 'en-US',
    CAD: 'en-CA',
  };

  // Get currency symbol
  get currencySymbol(): string {
    return this.currencyMap[this.selectedCurrency];
  }

  // Get locale for formatting
  get locale(): string {
    return this.localeMap[this.selectedCurrency];
  }
  taxDeclarationImages: any;
  // taxDeclarationImages: {
  //   id: string,
  //   code: string, source,
  //   listOfImages?: [{
  //     file: any,
  //     image: any
  //   }];
  // };
  selectedRegime: string = '';
  regimeLabels: { [key: string]: { name: string; code: string } } = {};
  isLoading: boolean;
  selectedFY: string;
  declarationTab = true;
  previousIncomeTab = false;
  form12BBTab = false;
  taxDetails: any;
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
    // public dialog: MatDialog,
    private httPost: HttpPostService,
    private currencyPipe: CurrencyPipe,
    private httpPut: HttpPutService,
    private httpDelete: httpDeleteService,
    private cdr: ChangeDetectorRef,
    // @Inject(MAT_DIALOG_DATA) public dataa: any

  ) {
    this.financialYears = this.getFinancialYears();
    const data = localStorage.getItem('selectedPlan');
    this.selectedPlan = data ? JSON.parse(data).value : ''
    this.selectedRegime = data ? JSON.parse(data).key : ''
  }

  selectTab(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
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
      this.selectedRegimeRecord.id = res.response.id;
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

  }

  // formatCurrency(value: number): string {
  //   return this.currencyPipe.transform(value, this.selectedCurrency, 'symbol', '1.2-2', this.locale) ?? '0.00';
  // }
  formatCurrency(value: number) {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00'; // Return a default value if invalid
    }
    return new Intl.NumberFormat(this.locale, { style: 'currency', currency: this.selectedCurrency }).format(
      value,
    )
  }
  formatCurrencyToNumber(value: string): number {
    if (!value) {
      return 0.00
    }
    return parseFloat(value.replace(/[^\d.-]/g, ''));
  }


  // Access formatted amounts
  get formattedTaxDetails() {
    return {
      cessAmount: this.taxDetails && this.taxDetails.cessValues && this.taxDetails.cessValues.length > 0 ? this.formatCurrency(this.taxDetails?.cessValues[0]?.cessAmount) : 0.00,
      TDSAmount: this.taxDetails && this.taxDetails.cessValues && this.taxDetails.cessValues.length > 0 ? this.formatCurrency(this.taxDetails?.cessValues[0]?.TDSAmount) : 0.00,
      grossTaxAmount: this.taxDetails && this.taxDetails.cessValues && this.taxDetails.cessValues.length > 0 ? this.formatCurrency(this.taxDetails?.cessValues[0]?.grossTaxAmount) : 0.00,
      standardDeduction: this.taxDetails ? this.formatCurrency(this.taxDetails?.standardDeduction) : 0.00,
      netTaxAmount: this.taxDetails && this.taxDetails.cessValues && this.taxDetails.cessValues.length > 0 ? this.formatCurrency(this.taxDetails?.cessValues[0]?.netTaxAmount) : 0.00,
      roundOffAmount: this.taxDetails && this.taxDetails.cessValues && this.taxDetails.cessValues.length > 0 ? this.formatCurrency(this.taxDetails?.cessValues[0]?.roundOffAmount) : 0.00,
      // totalTaxAmountPaid: this.taxDetails && this.taxDetails.cessValues && this.taxDetails.employeeTDSMaster.length > 0 ? this.formatCurrency(this.taxDetails?.cessValues[0]?.totalTaxAmountPaid) : 0.00,
      totalTaxAmountPaid: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTaxAmountPaid) : 0.00,

      totalGrossAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalGrossAmount) : 0.00,
      totalTaxAmountToBePaid: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTaxAmountToBePaid) : 0.00,

      totalTaxableAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTaxableAmount) : 0.00,
      totalDeductionsAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalDeductionsAmount - this.taxDetails?.standardDeduction) : 0.00,
      totalExemptionsAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalExemptionsAmount) : 0.00,
      totalTdsAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTdsAmount) : 0.00,
      totalCessAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalCessAmount) : 0.00,
      totalTaxAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTaxAmount) : 0.00,
      monthlyNetSalary: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.monthlyNetSalary) : 0.00
    };
  }
  getdetails() {
    this.httpGet.getMasterList('emp/tax/detail?fy_code=' + this.selectedFY).subscribe((res: any) => {
      if (res.response) {
        this.taxDetails = res.response;
      } else {
        this.taxDetails = null
      }
    },
      err => {
        console.error(err);
      })
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
      this.getEmpDeductions();
      this.getEmpExemptions();
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
        ? `Up to ${this.formatCurrency(detail.taxSlabEnd)}`
        : detail.taxSlabEnd >= 100000000000
          ? `Above ${this.formatCurrency(detail.taxSlabStart)}`
          : `${this.formatCurrency(detail.taxSlabStart)} to ${this.formatCurrency(detail.taxSlabEnd)}`;
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
          ? `Up to ${this.formatCurrency(detail.taxSlabEnd)}`
          : detail.taxSlabEnd >= 100000000000
            ? `Above ${detail.taxSlabStart.toLocaleString()}`
            : `${this.formatCurrency(detail.taxSlabStart)} to ${this.formatCurrency(detail.taxSlabEnd)}`;

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
          attachmentIds: deduction.attachmentIds,
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
            deduction.maxLimit = this.formatCurrency(deduction.maxLimit)
            if (deductionsMap.has(key)) {
              const { taxDeductionSubmittedAmount, attachmentIds, postId, taxPlanCode, fyCode, taxDeductionApprovedAmount,
                createdBy, updatedBy, createdAt, updatedAt } = deductionsMap.get(key);
              //  } = deductionsMap.get(key);
              // Attach the values
              deduction.taxDeductionSubmittedAmount = this.formatCurrency(taxDeductionSubmittedAmount);
              deduction.attachmentIds = attachmentIds;
              deduction.file = attachmentIds.length > 0 ? true : false;
              deduction.taxPlanCode = taxPlanCode;
              deduction.fyCode = fyCode;
              deduction.postId = postId,
                deduction.taxDeductionApprovedAmount = this.formatCurrency(taxDeductionApprovedAmount),
                deduction.createdBy = createdBy,
                deduction.updatedBy = updatedBy,
                deduction.createdAt = createdAt,
                deduction.updatedAt = updatedAt
            } else {
              // If not found, you can set them to null or leave them as is
              deduction.taxDeductionSubmittedAmount = null;
              deduction.attachmentIds = [];
              deduction.file = false;
              deduction.postId = null
                deduction.taxDeductionApprovedAmount = 0,
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

      this.taxDeductionsList = taxDeductionsList;
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
          attachmentIds: ex.attachmentIds,
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
            exm.maxLimit = this.formatCurrency(exm.maxLimit)

            if (exemptionsMap.has(key)) {
              const { taxExemptionSubmittedAmount, attachmentIds, postId, taxPlanCode, fyCode, taxExemptionApprovedAmount,
                createdBy, updatedBy, createdAt, updatedAt } = exemptionsMap.get(key);
              // Attach the values
              exm.taxExemptionSubmittedAmount = this.formatCurrency(taxExemptionSubmittedAmount);
              exm.attachmentIds = attachmentIds;
              exm.file = attachmentIds.length > 0 ? true : false;
              exm.taxPlanCode = taxPlanCode;
              exm.fyCode = fyCode;
              exm.postId = postId,
                exm.taxExemptionApprovedAmount = this.formatCurrency(taxExemptionApprovedAmount),
                exm.createdBy = createdBy,
                exm.updatedBy = updatedBy,
                exm.createdAt = createdAt,
                exm.updatedAt = updatedAt
            } else {
              // If not found, you can set them to null or leave them as is
              exm.taxExemptionSubmittedAmount = null;
              exm.attachmentIds = [];
              exm.file = false;
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
      this.taxExemptions = taxExemptionsList;
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
  // tab4() { this.declarationTab = false; this.previousIncomeTab = false; this.form12BBTab = false; this.taxFilingTab = true; this.taxSavingInvestmentTab = false }
  // tab5() { this.declarationTab = false; this.previousIncomeTab = false; this.form12BBTab = false; this.taxFilingTab = false; this.taxSavingInvestmentTab = true }

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
    this.listOfMonthsInFY = months;
    this.getTaxRates();
    this.getdetails();
  }
  parseDate = (date: string) => {
    const [month, year] = date.split(' ');
    const monthIndex = this.monthNames.indexOf(month);
    return {
      month: monthIndex,
      year: parseInt(year)
    };
  };


  remove(row, source) {
    if (!row.attachmentIds) {
      row.file = null
    } else {

    }
    if (source == 'TAX_DEDUCTION') {
      row.taxDeductionSubmittedAmount = row.OrgDeductionAmt;
      row.attachmentIds = row.OrgAttachId;
    } else {
      row.taxExemptionSubmittedAmount = row.OrgtaxExmAmt;
      row.attachmentIds = row.OrgAttachId;
    }
    row.Editrecord = false;
  }
  editRow(row, source) {
    this.taxDeclarationImages = this.taxDeclarationImages || { listOfImages: [] };

    // If listOfImages is not yet defined, initialize it as an empty array
    this.taxDeclarationImages.listOfImages = this.taxDeclarationImages.listOfImages || [];
    this.taxDeclarationImages.listOfImages = this.taxDeclarationImages?.listOfImages.map(image => ({
      ...image,  // Spread the existing properties
      attachmentId: null,  // Reset attachmentId to null
    }));
    if (row.attachmentIds.length > 0) {
      row.attachmentIds.forEach(element => {
        this.taxDeclarationImages.listOfImages.push({
          attachmentId: element
        })
      });
    }

    row.Editrecord = true;
    if (source == 'TAX_DEDUCTION') {
      row.OrgDeductionAmt = row.taxDeductionSubmittedAmount;
      row.taxDeductionSubmittedAmount = this.formatCurrencyToNumber(row.OrgDeductionAmt)
      row.OrgAttachId = row.attachmentIds;
    } else {
      row.OrgtaxExmAmt = row.taxExemptionSubmittedAmount;
      row.taxExemptionSubmittedAmount = this.formatCurrencyToNumber(row.OrgtaxExmAmt)
      row.OrgAttachId = row.attachmentIds;
    }
  }


  deleteProof() {
    const imagesUpload = this.taxDeclarationImages?.listOfImages.filter(x => x.attachmentId !== null);
    if (imagesUpload.length > 0) {
      Swal.fire({
        title: 'Are you sure?',
        html: 'Do You Want to Delete ?',
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33', confirmButtonText: 'Yes', allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.spinner.show();
          imagesUpload.forEach((x) => {
            this.httpDelete.delete('file?fileId=' + x.attachmentId).subscribe((res: any) => {
            if (res.status.message == 'SUCCESS') {
              this.spinner.hide();   
              const found = this.taxDeclarationImages.listOfImages.findIndex(y => y.index == x.index)
              this.taxDeclarationImages.listOfImages.splice(found, 1);
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
            })
          })
        }
      })
    } else {
      this.taxDeclarationImages.listOfImages = [];
    }
  }
  saveRow(row, source) {
    const imagesToUpload = row.imagesList ? row.imagesList.filter(x => x.attachmentId == null) : [];
    // If there are images to upload
    if (imagesToUpload.length > 0) {
      this.spinner.show();  // Show loading spinner
      row.imagesList = row.imagesList && row.imagesList.filter(x => x.attachmentId != null);

      // Create an array of upload requests
      const uploadRequests = imagesToUpload.map((image) => {
        // Send each image file for upload
        return this.httPost.multiPartFileUpload('file', image.file).pipe(
          tap((res: any) => {
            if (res.status.message === 'SUCCESS') {
              // Assign the fileId to the image object
              row.attachmentIds.push(res.response.fileId);
              row.imagesList.push({
                attachmentId: res.response.fileId,
                fileName: image.fileName,
                fileURL: image.fileURL,
                index: row.imagesList.length + 1
              })
              row.OrgAttachId.push(res.response.fileId);
            } else {
              // In case of failure, show a warning (simple version)
              Swal.fire({
                title: 'Error!',
                text: res.status.message,
                icon: 'warning',
                showConfirmButton: true,
              });
            }
          })
        );
      });

      // Use forkJoin to upload all files concurrently
      forkJoin(uploadRequests).subscribe(
        () => {
          this.spinner.hide();  // Hide spinner after all uploads are complete
          row.attachmentIds = [...new Set(row.attachmentIds)]
          // Once all images are uploaded, submit the record
          if (source === 'TAX_DEDUCTION') {
            this.SubmitTheDeductionRecord(row);
          } else {
            this.SubmitTheExemptionRecord(row);
          }
        },
        (error) => {
          this.spinner.hide();
          console.error(error);
          // Hide spinner in case of error
          Swal.fire({
            title: 'Error!',
            text: 'An error occurred while uploading the images.',
            icon: 'error',
            showConfirmButton: true,
          });
        }
      );
    } else {
      if (source == 'TAX_DEDUCTION') {
        this.SubmitTheDeductionRecord(row);
      } else {
        this.SubmitTheExemptionRecord(row);
      }
    }


  }

  SubmitTheDeductionRecord(row) {
    const attId = row.attachmentIds
    // this.taxDeclarationImages?.listOfImages
    //   .filter(image => image.attachmentId != null) // Only include images with a non-null attachmentId
    //   .map(image => image.attachmentId);
    if (!row.postId) {
      this.spinner.show();
      // create record
      const obj = {
        "fyCode": this.selectedFY,
        "taxPlanCode": this.selectedPlan['code'],
        "deductionGroupCode": row.deductionGroupCode,
        "deductionCode": row.deductionCode,
        // row.taxDeductionSubmittedAmount = this.formatCurrencyToNumber(row.OrgDeductionAmt)
        subDeductionCode: row.subDeductionCode,
        "taxDeductionSubmittedAmount": row.taxDeductionSubmittedAmount,
        "attachmentIds": attId
      }
      this.httPost.create('emp/tax/deductions', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.Editrecord = false;
          row.postId = res.response.id;
          row.updatedBy = res.response.updatedBy;
          row.updatedAt = res.response.updatedAt;
          row.createdAt = res.response.createdAt;
          row.createdBy = res.response.createdBy;
          row.taxDeductionSubmittedAmount = this.formatCurrency(res.response.taxDeductionSubmittedAmount)
          row.taxDeductionApprovedAmount = this.formatCurrency(res.response.taxDeductionApprovedAmount)
          row.fyCode = res.response.fyCode
          row.taxPlanCode = res.response.taxPlanCode
          Swal.fire({
            title: 'Success',
            text: 'Your Changes where saved',
            icon: 'success', showConfirmButton: true,
          });
          this.recallFuction();
        } else {
          Swal.fire({
            title: res.status.message,
            text: res.status.userMessage,
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
        "taxDeductionApprovedAmount": this.formatCurrencyToNumber(row.taxDeductionApprovedAmount),
        "createdBy": row.createdBy,
        "updatedBy": row.updatedBy,
        "createdAt": row.createdAt,
        "updatedAt": row.updatedAt,
        "attachmentIds": attId
      }
      this.httpPut.doPut('emp/tax/deductions', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.Editrecord = false;
          row.postId = res.response.id;
          row.updatedBy = res.response.updatedBy;
          row.updatedAt = res.response.updatedAt;
          row.createdAt = res.response.createdAt;
          row.createdBy = res.response.createdBy;
          row.taxDeductionSubmittedAmount = this.formatCurrency(res.response.taxDeductionSubmittedAmount)
          row.taxDeductionApprovedAmount = this.formatCurrency(res.response.taxDeductionApprovedAmount)
          Swal.fire({
            title: 'Success',
            text: 'Your Changes where Updated',
            icon: 'success', showConfirmButton: true,
          });
          this.recallFuction();
        } else {
          Swal.fire({
            title: res.status.message,
            text: res.status.userMessage,
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
    // const attId = Array.isArray(row.imageList) ? row.imageList.map(image => image.attachmentId) : [];
    const attId = row.attachmentIds;
    if (!row.postId) {
      this.spinner.show();
      const obj = {
        "fyCode": this.selectedFY,
        "taxPlanCode": this.selectedPlan['code'],
        "exemptionGroupCode": row.exemptionGroupCode,
        "exemptionCode": row.exemptionCode,
        "taxExemptionSubmittedAmount": row.taxExemptionSubmittedAmount,
        subExemptionCode: row.subExemptionCode,
        "attachmentIds": attId
      }
      this.httPost.create('emp/tax/exemptions', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.Editrecord = false;
          row.postId = res.response.id;
          row.updatedBy = res.response.updatedBy;
          row.updatedAt = res.response.updatedAt;
          row.createdAt = res.response.createdAt;
          row.createdBy = res.response.createdBy;
          row.taxExemptionSubmittedAmount = this.formatCurrency(res.response.taxExemptionSubmittedAmount)
          row.taxExemptionApprovedAmount = this.formatCurrency(res.response.taxExemptionApprovedAmount)
          Swal.fire({
            title: 'Success',
            text: 'Your Changes where saved',
            icon: 'success', showConfirmButton: true,
          });
          this.recallFuction();
        } else {
          Swal.fire({
            title: res.status.message,
            text: res.status.userMessage,
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
        "taxExemptionApprovedAmount": this.formatCurrencyToNumber(row.taxExemptionApprovedAmount),
        "createdBy": row.createdBy,
        "attachmentIds": attId,
        "updatedBy": row.updatedBy,
        "createdAt": row.createdAt,
        "updatedAt": row.updatedAt,
      }

      this.httpPut.doPut('emp/tax/exemptions', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.Editrecord = false;
          row.Editrecord = false;
          row.postId = res.response.id;
          row.updatedBy = res.response.updatedBy;
          row.updatedAt = res.response.updatedAt;
          row.createdAt = res.response.createdAt;
          row.createdBy = res.response.createdBy;
          row.taxExemptionSubmittedAmount = this.formatCurrency(res.response.taxExemptionSubmittedAmount)
          row.taxExemptionApprovedAmount = this.formatCurrency(res.response.taxExemptionApprovedAmount)
          Swal.fire({
            title: 'Success',
            text: 'Your Changes where Updated',
            icon: 'success', showConfirmButton: true,
          });
          this.recallFuction();
        } else {
          Swal.fire({
            title: res.status.message,
            text: res.status.userMessage,
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
        if (row.attachmentIds && !row.postId) {
          row.attachmentIds.forEach(element => {
            this.httpDelete.delete('file?fileId=' + element).subscribe((res: any) => {
              // row.taxDeductionSubmittedAmount = null;
              row.Editrecord = false;
              row.attachmentId = null;
              row.file = null;
            })
          });
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
                this.recallFuction();
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
                this.recallFuction();
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
  recallFuction() {
    this.httpGet.getMasterList('emp/tax/recall?fy_code=' + this.selectedFY).subscribe((res: any) => {
      // this.getEmpDeductions();
      // this.getEmpExemptions();
      this.getdetails();
    })
  }

  openFileInput(inputId: string, name: string, source: string, obj: any) {
    // document.getElementById(inputId).click();
    this.taxDeclarationImages = {
      id: inputId,
      code: name,
      edit: obj.Editrecord,
      //   attachmentId: [],
      source: source,
      obj: obj
      // listOfImages: 
    };
  }
  closeModel(dismiss) {
    if (this.taxDeclarationImages.listOfImages.length > 0) {
      if (this.taxDeclarationImages.source == 'Tax_Exemption') {
        // Loop through each section (e.g., "1.5 lakh deduction sections", "other sections")
        Object.keys(this.taxExemptions).forEach(sectionKey => {
          // Loop through each section's taxDeductions
          this.taxExemptions[sectionKey].forEach(section => {
            section.taxExemptionList.forEach(taxE => {
              // If the taxDeduction's ID is in the validIds array, set 'file' to true
              if (this.taxDeclarationImages.id == (taxE.id)) {
                taxE.imagesList = this.taxDeclarationImages.listOfImages;
                taxE.file = true;
              }
            });
          });
        });
      } else {
        Object.keys(this.taxDeductionsList).forEach(sectionKey => {
          // Loop through each section's taxDeductions
          this.taxDeductionsList[sectionKey].forEach(section => {
            section.taxDeductions.forEach(taxd => {
              // If the taxDeduction's ID is in the validIds array, set 'file' to true
              if (this.taxDeclarationImages.id == (taxd.id)) {
                taxd.imagesList = this.taxDeclarationImages.listOfImages;
                taxd.file = true;
              }
            });
          });
        });

      }
    }
    this.activeModal.dismiss(dismiss);
  }

  sendFile(ev: any) {
    const formData = new FormData();
    const file = ev.target.files[0];
    if (!this.taxDeclarationImages) {
      this.taxDeclarationImages = { listOfImages: [], source: '' }; // Initialize as needed
    }

    if (!this.taxDeclarationImages.listOfImages) {
      this.taxDeclarationImages.listOfImages = [];
    }

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      formData.append('file', file);
      const fileBlob = new Blob([file], { type: file.type });
      const fileURL = URL.createObjectURL(fileBlob);
      formData.append('fileType', this.taxDeclarationImages.source);
      reader.onload = () => {
        this.taxDeclarationImages.listOfImages.push({
          attachmentId: null,
          index: this.taxDeclarationImages.listOfImages ? this.taxDeclarationImages.listOfImages.length + 1 : 1,
          file: formData,
          fileURL,
          fileName: file.name,
          image: reader.result
        })
      }
    }
  }
  openImg(url) {
    window.open(url)
  }
  removeTheImage(indx) {
    const found = this.taxDeclarationImages.listOfImages.findIndex((x) => x.index == indx);
    this.taxDeclarationImages.listOfImages.splice(found, 1)
  }
  uploadImages() {
    if (this.taxDeclarationImages.listOfImages.length > 0) {
      if (this.taxDeclarationImages.source == 'Tax_Exemption') {
        // Loop through each section (e.g., "1.5 lakh deduction sections", "other sections")
        Object.keys(this.taxExemptions).forEach(sectionKey => {
          // Loop through each section's taxDeductions
          this.taxExemptions[sectionKey].forEach(section => {
            section.taxExemptionList.forEach(taxE => {
              // If the taxDeduction's ID is in the validIds array, set 'file' to true
              if (this.taxDeclarationImages.id == (taxE.id)) {
                taxE.file = true;
                taxE.imagesList = this.taxDeclarationImages.listOfImages;
              }
            });
          });
        });
      } else {
        Object.keys(this.taxDeductionsList).forEach(sectionKey => {
          // Loop through each section's taxDeductions
          this.taxDeductionsList[sectionKey].forEach(section => {
            section.taxDeductions.forEach(taxd => {
              // If the taxDeduction's ID is in the validIds array, set 'file' to true
              if (this.taxDeclarationImages.id == (taxd.id)) {
                taxd.file = true;
                taxd.imagesList = this.taxDeclarationImages.listOfImages;
              }
            });
          });
        });

      }
    }
    this.activeModal.dismiss('');
  }
  goingToOpenTheImgModel(data, name, source) {
    this.taxDeclarationImages = null;
    data.attachmentIds = [...new Set(data.attachmentIds)];
    if ((data.attachmentIds && data.attachmentIds.length > 0) || (data.imagesList.length > 0)) {
      // Ensure taxDeclarationImages and listOfImages are initialized
      this.taxDeclarationImages = this.taxDeclarationImages || { listOfImages: [] };
      this.taxDeclarationImages.listOfImages = this.taxDeclarationImages.listOfImages || [];
      this.taxDeclarationImages.listOfImages = [];
      // Loop through each attachmentId and create a record


      data.attachmentIds.forEach(id => {
        // Check if id exists in data.imagesList
        const existingImage = data.imagesList && data.imagesList.find(image => image.attachmentId === id);

        if (existingImage) {
          // If the id exists in imagesList, use the data directly from imagesList
          this.taxDeclarationImages.id = data.id;
          this.taxDeclarationImages.code = name;
          this.taxDeclarationImages.source = source;
          this.taxDeclarationImages.edit = data.Editrecord;

          // Push the record from imagesList to listOfImages (if it exists)
          this.taxDeclarationImages.listOfImages.push({
            attachmentId: id,
            fileName: existingImage.fileName,
            index: this.taxDeclarationImages.listOfImages.length + 1,
            fileURL: existingImage.fileURL || null, // If fileURL exists in the image, use it
          });
        } else {
          // If the id does not exist in imagesList, make the API call to fetch the file
          this.spinner.show();
          this.httpGet.getMasterList('file?fileId=' + id).subscribe((res: any) => {
            // const fileBlob = new Blob([res.response.image], { type: 'image/jpg' });
            // const fileURL = URL.createObjectURL(fileBlob);
            this.spinner.hide();
            const obj = this.base64ToBlob(res.response.image, res.response.extension)
            const fileURL = URL.createObjectURL(obj);
            // Add the newly fetched image to the list
            this.taxDeclarationImages.id = data.id;
            this.taxDeclarationImages.code = name;
            this.taxDeclarationImages.source = source;
            this.taxDeclarationImages.edit = data.Editrecord;

            // Push the record with the newly created fileURL
            this.taxDeclarationImages.listOfImages.push({
              attachmentId: id,
              index: this.taxDeclarationImages.listOfImages.length + 1,
              fileURL: fileURL,
              fileName: res.response.fileName
            });
          }, err => {
            this.spinner.hide();
            console.error('Error fetching the file:', err);
          });

        }
      });
      data.imagesList && data.imagesList.forEach(image => {
        if (image.attachmentId == null) {
          // Handle the image where attachmentId is null
          this.taxDeclarationImages.id = data.id;
          this.taxDeclarationImages.code = name;
          this.taxDeclarationImages.source = source;
          this.taxDeclarationImages.edit = data.Editrecord;

          // Push the record with the null attachmentId into listOfImages
          this.taxDeclarationImages.listOfImages.push({
            attachmentId: null,  // This is the null image entry
            index: this.taxDeclarationImages.listOfImages.length + 1,
            file: image.file,
            fileName: image.fileName,
            fileURL: image.fileURL || null, // Assuming fileURL exists or is null
          });
        }
      });
    }
  }
  base64ToBlob(base64Data, extension) {
    const byteCharacters = atob(base64Data);
    const byteArrays = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i);
    }

    const mimeType = this.getMimeType(extension);
    return new Blob([byteArrays], { type: mimeType });
  }
  getMimeType(extension) {
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.pdf': 'application/pdf'
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'; // Default MIME type for unknown extensions
  }
  downloadBlob(blobUrl, record) {
    // Create an anchor element
    const link = document.createElement('a');

    // Set the href attribute to the Blob URL
    link.href = blobUrl;

    // Set the download attribute to specify the file name
    link.download = record.fileName ? record.fileName : record.code;

    // Append the anchor to the document body (it's not displayed to the user)
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Remove the anchor element after download
    document.body.removeChild(link);
  }
}
