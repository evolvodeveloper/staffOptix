import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-income-tax',
  templateUrl: './income-tax.component.html',
  styleUrl: './income-tax.component.scss'
})
export class IncomeTaxComponent {
  financialYears = [];
  selectedFY: string;
  listOfMonthsInFY = [];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  taxPerMonth = [
    { apr: 0, may: 2081, jun: 2081, jul: 2081, aug: 2081, sep: 2081, oct: 2081, nov: 2081, dec: 2081, jan: 2081, feb: 2081, mar: 2081 }];
  salaryPerMonth = [{
    comp: 'Basic',
    total: '4,66,200',
    apr: 0,
    may: '66,600',
    jun: '66,600',
    jul: '66,600',
    aug: '66,600',
    sep: '66,600',
    oct: '66,600',
    nov: '66,600'
  }, {
    comp: 'HRA',
    total: '1,75,000',
    apr: 0,
    may: '25000',
    jun: '25000',
    jul: '25000',
    aug: '25000',
    sep: '25000',
    oct: '25000',
    nov: '25000'
  },
  {
    comp: 'Medical Allowance',
    total: '8,750',
    apr: 0,
    may: '1250',
    jun: '1250',
    jul: '1250',
    aug: '1250',
    sep: '1250',
    oct: '1250',
    nov: '1250'
  },
  {
    comp: 'Total Earnings',
    total: '6,49,950',
    apr: 0,
    may: '92,850',
    jun: '92,850',
    jul: '92,850',
    aug: '92,850',
    sep: '92,850',
    oct: '92,850',
    nov: '92,850'
  },
  ];
  salaryPerMonth1 = [
    {
      comp: 'Basic',
      total: '4,66,200',
      salaryMonthWise: [
        { "apr 24": "0" },
        { "may 24": "66,600" },
        { "jun 24": "66,600" },
        { "jul 24": "66,600" },
        { "aug 24": "66,600" },
        { "sep 24": "66,600" },
        { "oct 24": "66,600" },
        { "nov 24": "66,600" },
        { "Dec 24": "0" },
        { "Jan 24": "0" },
        { "Feb 24": "0" },
        { "Mar 24": "0" }
      ]
    },
    {
      comp: 'HRA',
      total: '1,75,000',
      salaryMonthWise: [
        { "apr 24": "0" },
        { "may 24": "25,000" },
        { "jun 24": "25,000" },
        { "jul 24": "25,000" },
        { "aug 24": "25,000" },
        { "sep 24": "25,000" },
        { "oct 24": "25,000" },
        { "nov 24": "25,000" },
        { "Dec 24": "0" },
        { "Jan 24": "0" },
        { "Feb 24": "0" },
        { "Mar 24": "0" }
      ]
    },
    {
      comp: 'Medical Allowance',
      total: '8,750',
      salaryMonthWise: [
        { "apr 24": "0" },
        { "may 24": "1,250" },
        { "jun 24": "1,250" },
        { "jul 24": "1,250" },
        { "aug 24": "1,250" },
        { "sep 24": "1,250" },
        { "oct 24": "1,250" },
        { "nov 24": "1,250" },
        { "Dec 24": "0" },
        { "Jan 24": "0" },
        { "Feb 24": "0" },
        { "Mar 24": "0" }
      ]
    },
    {
      comp: 'Total Earnings',
      total: '6,49,950',
      salaryMonthWise: [
        { "apr 24": "0" },
        { "may 24": "92,850" },
        { "jun 24": "92,850" },
        { "jul 24": "92,850" },
        { "aug 24": "92,850" },
        { "sep 24": "92,850" },
        { "oct 24": "92,850" },
        { "nov 24": "92,850" },
        { "Dec 24": "0" },
        { "Jan 24": "0" },
        { "Feb 24": "0" },
        { "Mar 24": "0" }
      ]
    }
  ];



  taxexemptions = [
    {
      cat: 'TaxAllowance',
      headerName: 'Less: Allowance Tax Exemptions',
      header: true,
      comp: [
        {
          section: '10(13)(a)',
          allowance: 'HRA',
          deatils: 'View details',
          grossAmt: '21000',
          dedAmt: '21000',
          cat: 'TaxAllowance'
        },
        {
          section: 'Total',
          allowance: '',
          deatils: '',
          grossAmt: '',
          dedAmt: '21000',
          cat: 'TaxAllowance'
        },
      ]
    },
    {
      cat: 'sec16TaxExc',
      headerName: 'Less: Section 16 Tax Exemptions (B)',
      header: true,
      comp: [
        {
          section: '16(iii)',
          allowance: 'PT',
          deatils: 'View details',
          grossAmt: '',
          dedAmt: '1,400',
          cat: 'sec16TaxExc'
        },
        {
          section: '16(ia)',
          allowance: 'Standard Deduction',
          deatils: 'View details',
          grossAmt: '',
          dedAmt: '75,000',
          cat: 'sec16TaxExc',
          headerName: '',
          header: false
        },
        {
          section: 'Total',
          allowance: '',
          deatils: '',
          grossAmt: '',
          dedAmt: '76,400',
          cat: 'sec16TaxExc'
        },
      ]
    }
  ];
  listOflacExemptions = [
    {
      section: '80(C)',
      allowance: 'EPF',
      deatils: 'View details',
      decAmt: '17,500',
      dedAmt: '17,500',
      cat: 'lacExc'
    },
    {
      section: '80(C)',
      allowance: 'VPF',
      deatils: 'View details',
      decAmt: '17,500',
      dedAmt: '17,500',
      cat: 'lacExc'
    },
    {
      section: '80(C)',
      allowance: 'Life Insurance Policy',
      deatils: '',
      decAmt: '10,00,000',
      dedAmt: '1,15,000',
      cat: 'lacExc'
    },
    {
      section: 'Total',
      allowance: '',
      deatils: '',
      decAmt: '',
      dedAmt: '1,50,000',
      cat: 'lacExc'
    },
  ];
  listOthExemptions = [
    {
      section: '80(D)',
      allowance: 'Medical Insurance Prem',
      deatils: '',
      decAmt: '25,000',
      dedAmt: '25,000',
      cat: 'otherExemp'
    },
    {
      section: '16(ia)',
      allowance: 'Intrest On loan for acquiring residentail house property',
      deatils: '',
      decAmt: '-',
      dedAmt: '-',
      cat: 'otherExemp',

    },
    {
      section: 'Total',
      allowance: '',
      deatils: '',
      decAmt: '',
      dedAmt: '25,000',
      cat: 'otherExemp'
    },
  ];
  IncomeAsPerslabs = [
    { slab: '0% Tax on Income Up to ₹ 2,50,000', amount: '0' },
    { slab: '5% Tax on Income between ₹ 2,50,001  to ₹ 5,00,000', amount: '12,500' },
    { slab: '20% Tax on Income between ₹ 5,00,001  to ₹  10,00,000', amount: '9,510' },
    { slab: '30% Tax on Income above to ₹ 10,00,000', amount: '0' },

  ];
  Othersources = [
    { comp: 'Net Income', Amount: '2,00,000' },
    { comp: 'Commission Income', Amount: '0' },
    { comp: 'Other Professional Income', Amount: '0' },
    { comp: 'Total', Amount: '2,00,000' },
  ]
  constructor(private router: Router) {
  }
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

  ngOnInit() {
    this.financialYears = this.getFinancialYears();
    console.log(this.financialYears);
  }

  getFinancialYears(): string[] {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Calculate the start and end years for the financial years
    const startYear = currentYear - 2; // 2 years in the past
    const endYear = currentYear + 1;   // 2 years in the future

    const financialYears: string[] = [];

    // Generate the financial years
    for (let year = startYear; year <= endYear; year++) {
      const start = `April ${year}`;
      const end = `March ${year + 1}`;
      financialYears.push(`${start}-${end}`);
    }
    this.selectedFY = `April ${currentYear}-March ${currentYear + 1}`
    console.log(this.selectedFY);
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
    console.log(currentMonth, currentYear);
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
    console.log(months);
    this.listOfMonthsInFY = months
  }
  parseDate = (date: string) => {
    console.log(date);

    const [month, year] = date.split(' ');
    const monthIndex = this.monthNames.indexOf(month);
    return {
      month: monthIndex,
      year: parseInt(year)
    };
  };
}
