import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';
import { HttpPutService } from '../services/http-put.service';
import { UtilService } from '../services/util.service';
interface TaxSlab {
  incomeRange: string;
  taxRate: string;
}interface TaxData {
  [header: string]: TaxPlan;
}
interface TaxPlan {
  [ageGroup: string]: TaxDetail[];
}
interface TaxDetail {
  id: number;
  taxPlanCode: string;
  fyCode: string;
  sortOrder: number;
  taxRate: number;
  taxSlabStart: number;
  taxSlabEnd: number;
  createdBy: string;
  createddate: null | string;
  uiGroupingName: string;
  countryCode: string;
  ageGroup: string;
}
@Component({
  selector: 'app-income-tax',
  templateUrl: './income-tax.component.html',
  styleUrl: './income-tax.component.scss'
})
export class IncomeTaxComponent {
  selectedPlan: string | null = null;
  financialYears = [];

  selectedFY: string;
  listOfMonthsInFY = [];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  salaryPerMonth = [];


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
  months = [];
  taxPlans: any;
  taxDetails: any;
  selectedRegimeRecord: any;
  salaryPerMonthAPiCall: string;
  selectedRegime: string = '';
  employeeTaxDeductions = [];
  empTaxSummary = [];
  employeeTaxExemptions = [];
  // regimeLabels: { [key: string]: { name: string; code: string, sortOrder: number; } } = {};
  regimeLabels: { [key: string]: { name: string; code: string; sortOrder: number } } = {};

  isLoading: boolean;
  constructor(private router: Router,
    private httpGet: HttpGetService,
    private utilServ: UtilService,
    private httPost: HttpPostService,
    private httpPut: HttpPutService,
    private spinner: NgxSpinnerService,
  ) {
    this.financialYears = this.getFinancialYears();
    const data = localStorage.getItem('selectedPlan');
    this.selectedPlan = data ? JSON.parse(data).value : ''
    this.selectedRegime = data ? JSON.parse(data).key : ''
  }
  ngOnInit() {
    this.getTaxRates();
    this.getSummary();
    this.getdetails();
    this.getcomponents();
    this.getEmpExemptions(); this.getEmpDeductions();
  }

  getSummary() {
    this.httpGet.getMasterList('emp/tax/summary?fy_code=' + this.selectedFY).subscribe((res: any) => {
      const sumary = res.response !== 'TAX_ISSUES' ? res.response : []
      this.empTaxSummary = sumary;
      if (sumary.length > 0 && sumary[0].monthly_breakup.length > 0) {
        sumary.forEach(r => {
          r.total = this.formatNumber(r.total);
          if (r.monthly_breakup && r.monthly_breakup.length > 0) {

            r.monthly_breakup.forEach(entry => {
              // Extract the month (key) from each object
              const month = Object.keys(entry)[0];
              // monthsSet.add(month);
              const value = entry[month];

              // Format the value using Intl.NumberFormat
              entry[month] = this.formatNumber(value);
              // Add the month to the Set (automatically handles duplicates)
            });
          }
        });
        // Get the keys (month names) from the first monthly_breakup object
        this.months = this.extractMonths(sumary);
      }
    },
      err => {
        console.error(err);
      })
  }
  getdetails() {
    this.httpGet.getMasterList('emp/tax/detail?fy_code=' + this.selectedFY).subscribe((res: any) => {
      this.taxDetails = res.response;
      this.taxDetails.Slabs = this.transformArray(res.response);
    },
      err => {
        console.error(err);
      })
  }

  getEmpDeductions() {
    this.spinner.show();
    this.httpGet.getMasterList('emp/tax/deductions?fy_code=' + this.selectedFY + '&tax_plan_code=' + this.selectedPlan['code']).subscribe((res: any) => {
      // const employeeTaxDeductions = res.response;
      this.employeeTaxDeductions = res.response.map(x => ({
        ...x,
        taxDeductionApprovedAmount: this.formatCurrency(x.taxDeductionApprovedAmount),
        taxDeductionSubmittedAmount: this.formatCurrency(x.taxDeductionSubmittedAmount)
      }))

      this.spinner.hide();
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
      // const employeeTaxExemptions = res.response;
      this.employeeTaxExemptions = res.response.map(x => ({
        ...x,
        taxExemptionApprovedAmount: this.formatCurrency(x.taxExemptionApprovedAmount),
        taxExemptionSubmittedAmount: this.formatCurrency(x.taxExemptionSubmittedAmount)
      }))
      this.spinner.hide();
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
  transformArray(data) {
    const NewTaxRegime = [];
    let totalTaxAmount = 0;
    const slabs = data.taxSlabValues
    if (slabs) {
      for (const detail of slabs) {

        const incomeRange = detail.taxSlabStart === 0
          ? `Up to ${this.formatCurrency(detail.taxSlabEnd)}`
          : detail.taxSlabEnd >= 100000000000
            ? `Above ${this.formatCurrency(detail.taxSlabStart)}`
            : `${this.formatCurrency(detail.taxSlabStart)} to ${this.formatCurrency(detail.taxSlabEnd)}`;
        const taxRate = detail.taxRate === 0 ? "Nil" : `${detail.taxRate}%`;
        const taxAmount = detail.taxAmount !== undefined
          ? this.formatCurrency(detail.taxAmount)
          : "0"; 
        totalTaxAmount += detail.taxAmount || 0;
        NewTaxRegime.push({ incomeRange, taxRate, taxAmount });
        // Include taxPlanCode in the new tax regime
      }
    }
    NewTaxRegime.push({
      incomeRange: 'Gross Income Tax',
      taxRate: '', // No rate applicable for the total
      taxAmount: this.formatCurrency(totalTaxAmount) // Format total tax amount
    });
    return NewTaxRegime
  }
  formatCurrencyToNumber(value: string): number {
    if (!value) {
      return 0.00
    }
    return parseFloat(value.replace(/[^\d.-]/g, ''));
  }
  formatCurrency(value: number) {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00'; // Return a default value if invalid
    }
    return new Intl.NumberFormat(this.locale, { style: 'currency', currency: this.selectedCurrency }).format(
      value,
    )
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
      totalGrossAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalGrossAmount) : 0.00,
      totalTaxAmountToBePaid: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTaxAmountToBePaid) : 0.00,
      totalTaxAmountPaid: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTaxAmountPaid) : 0.00,

      totalTaxableAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTaxableAmount) : 0.00,
      totalDeductionsAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalDeductionsAmount - this.taxDetails?.standardDeduction) : 0.00,
      totalExemptionsAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalExemptionsAmount) : 0.00,
      totalTdsAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTdsAmount) : 0.00,
      totalCessAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalCessAmount) : 0.00,
      totalTaxAmount: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.totalTaxAmount) : 0.00,
      monthlyNetSalary: this.taxDetails ? this.formatCurrency(this.taxDetails?.employeeTDSMaster?.monthlyNetSalary) : 0.00,
      // hra stuff
      actualHraReceived: this.taxDetails ? this.formatCurrency(this.taxDetails?.hraValues[0]['Actual HRA received']) : 0.00,
      fourtyPerOfBasic: this.taxDetails ? this.formatCurrency(this.taxDetails?.hraValues[0]['40% of basic salary']) : 0.00,

      actualHRAPaid: this.taxDetails ? this.formatCurrency(this.taxDetails?.hraValues[0]['Actual HRA paid']) : 0.00,
      tenPerOfBasic: this.taxDetails ? this.formatCurrency(this.taxDetails?.hraValues[0]['10% of basic salary']) : 0.00,
      rentAccessPaid: this.taxDetails ? this.formatCurrency(this.taxDetails?.hraValues[0]['Rent Paid in excess of 10% of salary']) : 0.00,


    };
  }
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  getcomponents() {
    this.salaryPerMonthAPiCall = 'undone';
    this.httpGet.getMasterList('emp/tax/components?fy_code=' + this.selectedFY).subscribe((res: any) => {
      // if (res.response.length > 0 && res.response[0].monthly_breakup.length > 0) {
      //   this.months = Object.keys(res.response[0].monthly_breakup[0]);
      // }
      if (res.response.length > 0 && res.response[0].monthly_breakup.length > 0) {
        this.months = this.extractMonths(res.response);

        res.response.forEach(r => {
          r.total = this.formatNumber(r.total);
          if (r.monthly_breakup && r.monthly_breakup.length > 0) {

            r.monthly_breakup.forEach(entry => {
              // Extract the month (key) from each object
              const month = Object.keys(entry)[0];
              // monthsSet.add(month);
              const value = entry[month];

              // Format the value using Intl.NumberFormat
              entry[month] = this.formatNumber(value);
              // Add the month to the Set (automatically handles duplicates)
            });
          }
        });
        // Get the keys (month names) from the first monthly_breakup object

      }
      this.salaryPerMonthAPiCall = 'done';
      this.salaryPerMonth = res.response;
    },
      err => {
        console.error(err);
      })
  }
  extractMonths(responses: any[]): string[] {
    const monthsSet = new Set<string>();  // Use Set to avoid duplicate months
    // Iterate over each object in the response
    responses && responses[0]?.monthly_breakup?.forEach(ee => {
      // Extract the month (key) from each object
      const month = Object.keys(ee)[0];
      monthsSet.add(month);
    })
    return Array.from(monthsSet);
  }
  formatNumber = (value) => {
    if (value === undefined || value === null || value === 0 || isNaN(value)) {
      const formatter = new Intl.NumberFormat(this.locale, { style: 'currency', currency: this.selectedCurrency });
      return formatter.format(0.00);
      // return '0.00'; // Return a default value if invalid
    }
    const formatter = new Intl.NumberFormat(this.locale, { style: 'currency', currency: this.selectedCurrency });
    return formatter.format(value);
  };
  getIconClass(index: number): string {
    if (index === 0) {
      return 'text-primary';
    } else if (index >= 1 && index <= 4) {
      return 'text-info';
    } else {
      return 'd-none'; // Default class for other indices
    }
  }
  getIconClass1(index: number): string {
    if (index === 0) {
      return 'text-primary';
    } else if (index >= 1 && index <= 11) {
      return 'text-success';
    } else {
      return 'd-none'; // Default class for other indices
    }
  }
  back() {
    this.router.navigateByUrl('/setup');
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

  getSelectedTaxRegime() {
    this.spinner.show();
    const data = localStorage.getItem('selectedPlan')
    this.httpGet.getMasterList('emp/tax/regime?fy_code=' + this.selectedFY).subscribe((res: any) => {
      this.spinner.hide();
      this.selectedRegimeRecord = res.response;
      this.generateRegimeLabels(this.taxPlans);
      // for (const key in this.regimeLabels) {
      //   if (this.regimeLabels[key].code === this.selectedRegimeRecord.taxPlanCode) {
      //     const data = JSON.stringify(this.regimeLabels[key])
      //     this.selectedPlan = data ? JSON.parse(data) : ''
      //     this.selectedRegime = key
      //     break;
      //   }
      // }
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

  generateRegimeLabels(data: any) {
    const regimeArray: { key: string; value: any }[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        // Parent-level sorting
        const taxPlanCode = value[0].taxPlanCode;
        const sortOrder = value[0].sortOrder;
        regimeArray.push({
          key,
          value: {
            name: this.formatRegimeLabel(key),
            code: taxPlanCode,
            sortOrder,
          },
        });
      } else {
        // Nested object sorting
        for (const [subKey, slabs] of Object.entries(value)) {
          const taxPlanCode = slabs[0].taxPlanCode;
          const sortOrder = slabs[0].sortOrder;
          regimeArray.push({
            key: `${key}.${subKey}`,
            value: {
              name: this.formatRegimeLabel(key, subKey),
              code: taxPlanCode,
              sortOrder,
            },
          });
        }
      }
    }

    // Sort by sortOrder
    const sortedRegimes = regimeArray.sort((a, b) => a.value.sortOrder - b.value.sortOrder);

    // Convert to object for template
    this.regimeLabels = sortedRegimes.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }

  // generateRegimeLabels(data) {
  //   for (const [key, value] of Object.entries(data)) {
  //     if (Array.isArray(value)) {
  //       const taxPlanCode = value[0].taxPlanCode;
  //       this.regimeLabels[key] = {
  //         name: this.formatRegimeLabel(key),
  //         code: taxPlanCode,
  //       }
  //     } else {
  //       for (const subKey of Object.keys(value)) {
  //         const taxPlanCode = value[subKey][0].taxPlanCode// Adjust as needed
  //         this.regimeLabels[`${key}.${subKey}`] = {
  //           name: this.formatRegimeLabel(key, subKey),
  //           code: taxPlanCode,
  //         };
  //       }
  //     }
  //   }
  // }

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
      const taxPlanCode = detail.taxPlanCode;
      const sortOrder = detail.sortOrder;
      // Include taxPlanCode in the new tax regime
      NewTaxRegime.push({ incomeRange, taxRate, taxPlanCode, sortOrder });
    }

    // Sort the new regime by sortOrder
    NewTaxRegime.sort((a, b) => a.sortOrder - b.sortOrder);

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
            ? `Above ${this.formatCurrency(detail.taxSlabStart)}`
            : `${this.formatCurrency(detail.taxSlabStart)} to ${this.formatCurrency(detail.taxSlabEnd)}`;

        const taxRate = detail.taxRate === 0 ? "Nil" : `${detail.taxRate}%`;
        const taxPlanCode = detail.taxPlanCode;
        const sortOrder = detail.sortOrder;

        // Push the tax slab into the correct age group dynamically
        OldTaxRegime[ageGroup].push({ incomeRange, taxRate, taxPlanCode, sortOrder });
      }

      // Sort the tax slabs for this age group by sortOrder
      OldTaxRegime[ageGroup].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return { NewTaxRegime, OldTaxRegime };
  }

}
