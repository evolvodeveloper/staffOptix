import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { Carousel } from "bootstrap";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { Router } from '@angular/router';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';
import { UtilService } from '../../../services/util.service';

@Component({
  selector: 'app-create-offer-letter',
  templateUrl: './create-offer-letter.component.html',
  styleUrls: ['./create-offer-letter.component.scss']
})
export class CreateOfferLetterComponent implements OnInit {
  [x: string]: any;
  @ViewChild('offerLetter', { static: false }) offerLetter: ElementRef;
  @ViewChild('carousel') carouselRef: NgbCarousel;
  showDownloadPdfBtn = false;
  update = false;
  hideSalaryStructure = false;
  showPrevBtn = false;
  showNextBtn = false;
  process: boolean;
  hasRules = false;
  employeeObj = {
    id: null,
    empName: null,
    empAddress: null,
    date: new Date(),
    deptCode: null,
    email: null,
    payrollCode: null,
    salary: null,
    calculateByRules: false,
    designation: null,
    amount: null,
    empDateOfJoin: null,
    components: []
  }
  Offertemplates = [];
  last_slide = false;
  showComponentCode = false;
  salaryComponents = [];
  payrollList = [];
  deptCodes = [];
  designationList = [];
  open = false;
  templatebody: string;
  totalSalary: number = null;
  totalearningAmt: number = null;
  totalDeduction: number = null;
  companyInfo: any;
  pageProfileLogo: any;
  templates = [
    { code: 'green', img: '../../assets/templates/greenTemplate.png' },
    { code: 'blue', img: '../../assets/templates/blueDesignTemplate.png' },
    { code: 'blue Lines', img: '../../assets/templates/bluelinesTemplate.png' },
    { code: 'none', img: '../../assets/templates/whitebg.png' }
  ]
  templateSrc: string = this.changeTemplate('green');
  @ViewChild("carouselExampleSlidesOnly") carouselElement: ElementRef<
    HTMLElement
  >;

  constructor(
    private httpGet: HttpGetService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private spinner: NgxSpinnerService,
    private httpPut: HttpPutService,
    private utilServ: UtilService,
    private httpPost: HttpPostService
  ) {

  }

  nextSlide() {

    const firstCarouselItem = this.carouselElement.nativeElement.querySelector('.active');
    if (firstCarouselItem.classList.contains('orange')) {
      const checkedEmps = this.salaryComponents.filter(x => x.checkedSalary == true)

      if (this.employeeObj.payrollCode) {

        if (this.hideSalaryStructure) {
          const blueSlide = document.querySelector('.carousel-item.blue') as HTMLElement;
          blueSlide.style.display = 'block';
          blueSlide.classList.add('active');
          // Show the slide with 'blue' class
          const orgSlide = document.querySelector('.carousel-item.orange') as HTMLElement;
          orgSlide.style.display = 'none';
          orgSlide.classList.remove('active');

          this.showDownloadPdfBtn = true;
          this.showNextBtn = false
          this.showPrevBtn = true;
        } else {

          if (checkedEmps.length > 0 && this.employeeObj.salary !== this.totalearningAmt) {
            Swal.fire({
              title: 'Info!',
              text: 'Total Salary is not equal to the sum of Earning Components',
              icon: 'info',
            });
          } else if (checkedEmps.length == 0 && this.salaryComponents.length > 0 && this.employeeObj.salary) {
            Swal.fire({
              title: 'Info!',
              text: 'check the checkbox to enter amount',
              icon: 'info',
            });
          } else if (checkedEmps.length == 0 && this.salaryComponents.length > 0 && !this.employeeObj.salary) {
            Swal.fire({
              title: 'Info!',
              text: 'Enter salary and check the checkboxes to assign the components to this employee',
              icon: 'info',
            });
          }
          else if (this.employeeObj.salary === this.totalearningAmt) {
            const blueSlide = document.querySelector('.carousel-item.blue') as HTMLElement;
            blueSlide.style.display = 'block';
            blueSlide.classList.add('active');
            // Show the slide with 'blue' class
            const orgSlide = document.querySelector('.carousel-item.orange') as HTMLElement;
            orgSlide.style.display = 'none';
            orgSlide.classList.remove('active');

            this.showDownloadPdfBtn = true;
            this.showNextBtn = false
            this.showPrevBtn = true;
            // this.carouselRef.next();

          }
          else if (checkedEmps.length == 0 && this.salaryComponents.length == 0) {
            Swal.fire({
              title: 'Info!',
              text: `There are no salary components specified for this payroll. Please declare your components.`,
              icon: 'info',
            });
          }
        }
      } else {
        Swal.fire({
          title: 'Info!',
          text: 'Select Payroll and Enter amount',
          icon: 'info',
        });
      }
    } else if (firstCarouselItem.classList.contains('blue')) {
      this.showDownloadPdfBtn = true;
      this.showPrevBtn = false;
      this.showNextBtn = false
    }
    else if (firstCarouselItem.classList.contains('selectOfferTemplate')) {
      const blueSlide = document.querySelector('.carousel-item.red') as HTMLElement;
      blueSlide.style.display = 'block';
      blueSlide.classList.add('active');
      // Show the slide with 'blue' class
      const orgSlide = document.querySelector('.carousel-item.selectOfferTemplate') as HTMLElement;
      orgSlide.style.display = 'none';
      orgSlide.classList.remove('active');

      this.showDownloadPdfBtn = false;
      this.showNextBtn = true;
      this.showPrevBtn = true;
    }
    else {
      if (this.employeeObj.date && this.employeeObj.designation && this.employeeObj.email
        && this.employeeObj.deptCode && this.employeeObj.empDateOfJoin
        && this.employeeObj.empName && this.employeeObj.empAddress) {
        // this.carouselRef.next();
        const redSlide = document.querySelector('.carousel-item.red') as HTMLElement;
        redSlide.style.display = 'none';
        redSlide.classList.remove('active');
        // Show the slide with 'blue' class
        const orgSlide = document.querySelector('.carousel-item.orange') as HTMLElement;
        orgSlide.style.display = 'block';
        orgSlide.classList.add('active');

        this.showDownloadPdfBtn = false;
        this.showPrevBtn = true;
        this.showNextBtn = true;

      } else {
        Swal.fire({
          title: 'Info!',
          html: 'Please Enter Required (*) fields',
          icon: 'info',
        });
        // this.carouselRef.pause();

      }
    }
  }
  Prev() {
    const firstCarouselItem = this.carouselElement.nativeElement.querySelector('.active');
    if (firstCarouselItem.classList.contains('orange')) {
      const redSlide = document.querySelector('.carousel-item.red') as HTMLElement;
      redSlide.style.display = 'block';
      redSlide.classList.add('active');
      // Show the slide with 'blue' class
      const orgSlide = document.querySelector('.carousel-item.orange') as HTMLElement;
      orgSlide.style.display = 'none';
      orgSlide.classList.remove('active');

      this.showDownloadPdfBtn = false;
      this.showNextBtn = true;

      // this.carouselRef.prev();
      this.showPrevBtn = true;
    }
    else if (firstCarouselItem.classList.contains('blue')) {
      const blueSlide = document.querySelector('.carousel-item.blue') as HTMLElement;
      blueSlide.style.display = 'none';
      blueSlide.classList.remove('active');
      // Show the slide with 'blue' class
      const orgSlide = document.querySelector('.carousel-item.orange') as HTMLElement;
      orgSlide.style.display = 'block';
      orgSlide.classList.add('active');

      this.showDownloadPdfBtn = false;
      this.showNextBtn = true;

      this.showPrevBtn = true;
      // this.carouselRef.prev();
    }
    else if (firstCarouselItem.classList.contains('red')) {
      const redSlide = document.querySelector('.carousel-item.red') as HTMLElement;
      redSlide.style.display = 'none';
      redSlide.classList.remove('active');
      // Show the slide with 'blue' class
      const orgSlide = document.querySelector('.carousel-item.selectOfferTemplate') as HTMLElement;
      orgSlide.style.display = 'block';
      orgSlide.classList.add('active');

      this.showDownloadPdfBtn = false;
      this.showNextBtn = true;

      this.showPrevBtn = false;
      // this.carouselRef.prev();
    }
    else {
      const redSlide = document.querySelector('.carousel-item.selectOfferTemplate') as HTMLElement;
      redSlide.style.display = 'block';
      redSlide.classList.add('active');
      // Show the slide with 'blue' class
      const orgSlide = document.querySelector('.carousel-item.red') as HTMLElement;
      orgSlide.style.display = 'none';
      orgSlide.classList.remove('active');

      // this.carouselRef.prev();
      this.showPrevBtn = false;
      this.showDownloadPdfBtn = true;
      this.showNextBtn = false;

    }
  }
  getTemplate() {
    this.spinner.show();
    this.process = false;
    this.httpGet.getMasterList('emailTemplate?templateName=OfferLetter').subscribe((res: any) => {
      this.Offertemplates = res.response;
      this.process = true;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();

        console.error(err);

      })
  }
  ngOnInit() {
    // company / logo
    this.getTemplate();
    this.getCompanyInfo();
    this.getDesignation();
    this.getDetpCodes();
    this.getPayrollCodes();
    this.init();
  }
  init() {
    if (this.utilServ.editData) {
      this.update = true;
      this.employeeObj.id = this.utilServ.editData.id;
      this.employeeObj.date = this.utilServ.editData.date;
      this.employeeObj.deptCode = this.utilServ.editData.deptCode;
      this.employeeObj.designation = this.utilServ.editData.designation;
      this.employeeObj.email = this.utilServ.editData.email;
      this.employeeObj.empAddress = this.utilServ.editData.empAddress;
      this.employeeObj.empDateOfJoin = this.utilServ.editData.dateOfJoin;
      this.employeeObj.empName = this.utilServ.editData.employeeName;
      this.employeeObj.payrollCode = this.utilServ.editData.payrollCode;

      // this.salaryComponents
    }
  }
  getDetpCodes() {
    this.httpGet.getMasterList('depts/active').subscribe((res: any) => {
      this.deptCodes = res.response;
    },
      err => {
        console.error(err);
      })
  }
  makeOffer(row) {
    this.templatebody = row.templateBody;
    this.nextSlide();
  // this.replacePlaceholders(this.templatebody);
  }


  replacePlaceholders(html: string): { firstPart: string, secondPart: string } {
    if (!html) return { firstPart: '', secondPart: '' };
    html = html.replace(/@Company_Name/g, `${this.companyInfo?.companyName}` || '');
    html = html.replace(/@Designation/g, `${this.employeeObj?.designation}` || '');
    html = html.replace(/@Salary/g, `${this.employeeObj?.salary}` || '');
    html = html.replace(/@Join_Date/g, `${this.employeeObj?.empDateOfJoin}` || '');
    html = html.replace(/@Applicant_Address/g, `${this.employeeObj?.empAddress}` || '');
    html = html.replace(/@Applicant_Name/g, `${this.employeeObj?.empName}` || '');
    html = html.replace(/@Date/g, `${this.employeeObj?.date}` || '');
    if (this.pageProfileLogo) {
      html = html.replace('@Logo', `<img [src]="pageProfileLogo" width="40" height="50" class='widthfit' >`);
    }
    // Find the index of @table placeholder
    const tableIndex = html.indexOf('@Table');
    if (tableIndex === -1) {
      this.hideSalaryStructure = true;
      // If @table is not found, treat entire html as firstPart
      return { firstPart: html, secondPart: '' };
    } else {
      this.hideSalaryStructure = false;
    }


    // Split html into first and second parts based on @table
    const firstPart = html.substring(0, tableIndex);
    const secondPart = html.substring(tableIndex + '@Table'.length);

    return { firstPart, secondPart };
  }

  getDesignation() {
    this.httpGet.getMasterList('desgs/active').subscribe((res: any) => {
      this.designationList = res.response;
    },
      err => {
        console.error(err);
      })
  }
  back() {
    this.router.navigateByUrl('/offerletter');
  }
  openRightModel() {
    this.open = true;

  }
  closeModal(): void {
    this.open = false;
  }
  onTemplateChange(code: string): void {
    this.templateSrc = this.changeTemplate(code);
  }
  changeTemplate(init: any) {
    switch (init) {
      case 'none':
        return '../../assets/templates/whitebg.png'
      case 'green':
        return '../../assets/templates/greenTemplate.png'
      case 'blue':
        return '../../assets/templates/blueDesignTemplate.png'
      case 'blue Lines':
        return '../../assets/templates/bluelinesTemplate.png'
      // case 'none':
      //   return '../../assets/templates/whitebg.png'
      // default:
      //   return '../../assets/templates/greenTemplate.png'
    }
  }

  extractMimeType(dataUrl: string): string {
    const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    return match ? match[1] : '';
  }
  getCompanyInfo() {
    this.httpGet.getMasterList('company/logo').subscribe((res: any) => {
      this.companyInfo = res.response;
      const header = 'data:image/' + res.response?.filetype + ';base64,';
      if (res.response?.content && res.response?.filetype) {
        this.pageProfileLogo = header.concat(res.response?.content);
      } else {
        this.pageProfileLogo = false
      }
    })
  }

  getsalaryComponents() {
    this.spinner.show();
    this.hasRules = false;
    // this.hasDeductions = false;
    this.showComponentCode = false;
    this.salaryComponents = [];
    this.httpGet.getMasterList('salarycomponents?payrollCode=' + this.employeeObj.payrollCode).subscribe(
      // this.httpGetService.getMasterList('getsalbreakup?payrollCode=' + this.payrollForm.controls.payrollCode.value + '&sal=' + this.payrollForm.controls.salary.value).subscribe(
      (res: any) => {
        res.response.map(x => { x.pct = null, x.checkedSalary = false })
        const filteredData = res.response.filter(item => item.componentCode !== "Total Salary" && item.componentCode !== "CTC");
        const ear = [], ded = [];
        filteredData.forEach(element => {
          if (element.isDeduction == true) {
            ded.push(element)
          } else if (element.isDeduction == false) {
            ear.push(element)
          }
        });
        const diff = ear.length - ded.length
        if (diff < 0) {
          // If the difference is negative, push that many rows into earRows
          for (let i = 0; i < Math.abs(diff); i++) {
            ear.push({
              componentCode: '',
              isDeduction: false
            });
          }
        } else if (diff > 0) {
          // If the difference is positive, push that many rows into dedRows
          for (let i = 0; i < diff; i++) {
            ded.push({
              componentCode: '',
              isDeduction: true
            });
          }
        }
        const trueRecord = filteredData.find(x => x.hasRules === true);
        if (trueRecord) {
          this.hasRules = true;
        }
        const sortData = filteredData.sort((a, b) => a.sortOrder - b.sortOrder);
        this.salaryComponents = sortData;
        this.showComponentCode = true;
        this.spinner.hide();
        if (this.utilServ.editData) {
          this.utilServ.editData.components.forEach(element => {
            const index = this.salaryComponents.findIndex(x => x.componentCode == element.componentCode);
            if (index >= 0) {
              this.salaryComponents[index].checkedSalary = true;
              this.salaryComponents[index].amount = element.amount;
              this.salaryComponents[index].compId = element.id;
              if (this.salaryComponents[index].isDeduction == false) {
                this.employeeObj.salary += element.amount;
              }
            }
          });
          this.salaryComponents.forEach(x => {
            this.onChangeBal(x.amount, x)
          });
        }

        // if (this.utilServ.editData || this.utilServ.viewData) {
        //   this.getEmpSalaryDetails(this.addEmployeeForm.controls.employeeCode.value);
        // }
      },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);

      }
    );
  }

  checkedSalary(val, row) {
    if (this.employeeObj.salary == null
      || this.employeeObj.salary == undefined || this.employeeObj.salary == '') {
      Swal.fire({
        title: 'Info!',
        text: "Please Enter amount in Salary field",
        icon: 'info',
      });
      row.checkedSalary = false;
      val.target.checked = false
    } else {
      if (val.target.checked == false) {
        row.pct = null,
          row.amount = null,
          row.checkedSalary = false
      } else {
        row.checkedSalary = true
      }
      this.calCulateSalary();
    }
  }

  calCulateSalary() {
    let deductAmt = 0, earningAmt = 0, amount = 0;
    this.totalDeduction = 0, this.totalSalary = 0, this.totalearningAmt = 0;
    this.salaryComponents.forEach(x => {
      if (x.isDeduction == true) {
        deductAmt += x.amount ? x.amount : 0;
      } else if (x.isDeduction == false) {
        earningAmt += x.amount ? x.amount : 0;
      }
    })
    amount = earningAmt - deductAmt
    this.totalDeduction = deductAmt;
    this.totalearningAmt = earningAmt;
    this.totalSalary = amount;
    // if (this.utilServ.editData || this.utilServ.viewData) {
    //   this.payrollForm.controls.salary.setValue(amount);
    //   this.salaryValue();
    // }
  }

  onChangeBal(flatamt, row) {
    const amount = this.employeeObj.salary - flatamt;
    const discountPerc = ((this.employeeObj.salary - amount) / this.employeeObj.salary) * 100;
    row.pct = parseFloat(discountPerc.toFixed(2)) == 0 ? null : parseFloat(discountPerc.toFixed(2));
    this.calCulateSalary();
    this.cdr.detectChanges();
  }
  onChangeperct(discperc, row) {
    if (discperc <= 100) {
      const finalAmt = this.employeeObj.salary - (this.employeeObj.salary * discperc) / 100;
      const discountAmt = this.employeeObj.salary - finalAmt;
      row.amount = parseFloat(discountAmt.toFixed(2)) == 0 ? null : parseFloat(discountAmt.toFixed(2));
      this.calCulateSalary();
    } else {
      row.pct = null; row.amount = null;
      this.calCulateSalary();

      Swal.fire({
        title: 'Info!',
        text: "you are entering morethan 100%, Please check",
        icon: 'info',
      });
    }
  }


  getPayrollCodes() {
    this.httpGet.getMasterList('payrollsetups').subscribe((res: any) => {
      this.payrollList = res.response;
      if (res.response.length == 1) {
        if (this.utilServ.editData) {
          this.employeeObj.payrollCode = this.utilServ.editData.payrollCode;
          this.getsalaryComponents();
        } else {
          this.employeeObj.payrollCode = res.response[0].payrollCode;
          this.getsalaryComponents();
        }
      } else {
        if (this.utilServ.editData) {
          this.employeeObj.payrollCode = this.utilServ.editData.payrollCode;
          this.getsalaryComponents();
        }
      }
    },
      err => {
        console.error(err);

      })
  }

  getsalaryComp(ev) {
    this.employeeObj.calculateByRules = ev.target.value
    if (this.employeeObj.calculateByRules) {
      this.getsalaryBreakup();
    } else {
      this.getsalaryComponents();
    }

  }

  getsalaryBreakup() {
    this.spinner.show();
    this.showComponentCode = false;
    this.httpGet.getMasterList('getsalbreakup?payrollCode=' + this.employeeObj.payrollCode + '&sal=' + this.employeeObj.salary).subscribe(
      (res: any) => {
        this.salaryComponents.forEach(x => {
          const found = res.response.find(y => y.componentCode == x.componentCode);
          if (found) {
            x.amount = found.amount,
              x.checkedSalary = true;
            this.onChangeBal(x.amount, x)
          }
        })
        this.showComponentCode = true;
        this.spinner.hide();
        // if (this.utilServ.editData || this.utilServ.viewData) {
        //   this.getEmpSalaryDetails(this.addEmployeeForm.controls.employeeCode.value);
        // }
      },
      err => {
        this.spinner.hide();
        this.showComponentCode = true;
        console.error(err.error.status.message);
        // Swal.fire({
        //   title: 'Error!',
        //   text: err.error.status.message,
        //   icon: 'error',
        // });
      }
    );
  }


  downloadPdf(source): void {
    this.spinner.show();
    this.generatePdf(this.offerLetter.nativeElement, source);
  }

  generatePdf(element: HTMLElement, source): void {
    html2canvas(element, { scale: 5 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      // const imgProps = pdf.getImageProperties(imgData);
      // const imgWidth = pdfWidth;
      // const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      // Ensure the canvas image fits within A4 dimensions
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      // this.submit(imgData);
      const components = [];

      if (source == 'create') {
        this.salaryComponents.forEach(x => {
          if (x.checkedSalary === true) {
            components.push({
              componentCode: x.componentCode,
              amount: x.amount
            })
          }
        })
        const base64 = imgData?.replace(/^data:.*?;base64,/, '');
        const mimeType = this.extractMimeType(imgData);
        const obj = {
          date: this.employeeObj.date,
          employeeName: this.employeeObj.empName,
          designation: this.employeeObj.designation,
          dateOfJoin: this.employeeObj.empDateOfJoin,
          empAddress: this.employeeObj.empAddress,
          email: this.employeeObj.email,
          docType: mimeType,
          fileDir: '',
          deptCode: this.employeeObj.deptCode,
          fileName: this.employeeObj.empName + new Date().getTime(),
          fileType: 'pdf',
          image: base64,
          payrollCode: this.employeeObj.payrollCode,
          components: components
        }
        this.httpPost.create('empOfferLetter', obj).subscribe((res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            pdf.save(`${this.employeeObj.empName} ` + 'offer-letter.pdf');
            Swal.fire({
              title: 'Success!',
              // text: 'Offer letter created successfully',
              text: 'Please, Check your downloads for Offer Letter',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.router.navigateByUrl('/offerletter');
              this.employeeObj = {
                id: null,
                empName: null,
                empAddress: null,
                date: null,
                deptCode: null,
                email: null,
                calculateByRules: false,
                payrollCode: null,
                salary: null,
                designation: null,
                amount: null,
                empDateOfJoin: null,
                components: []
              }
            });
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
      } else if (source == 'update') {
        // const row = this.utilServ.editData.find(x => x.id == this.employeeObj.id);
        this.salaryComponents.forEach(x => {
          if (x.checkedSalary === true) {
            const subRecord = this.utilServ.editData.components.find(y => y.id === x.compId);
            if (subRecord) {
              components.push({
                componentCode: x.componentCode,
                amount: x.amount,
                id: x.compId,
                "offerLetterId": subRecord.offerLetterId,
                "amountStr": null,
                "companyCode": subRecord.companyCode,
                "branchCode": subRecord.branchCode,
                "createdby": subRecord.createdby,
                "createddate": subRecord.createddate,
              })
            } else {
              components.push({
                componentCode: x.componentCode,
                amount: x.amount,
              })
            }
          }
        })
        const base64 = imgData?.replace(/^data:.*?;base64,/, '');
        const mimeType = this.extractMimeType(imgData);
        const obj = {
          id: this.employeeObj.id,
          date: this.employeeObj.date,
          employeeName: this.employeeObj.empName,
          designation: this.employeeObj.designation,
          dateOfJoin: this.employeeObj.empDateOfJoin,
          empAddress: this.employeeObj.empAddress,
          email: this.employeeObj.email,
          docType: mimeType,
          fileDir: '',
          deptCode: this.employeeObj.deptCode,
          fileName: this.employeeObj.empName + new Date().getTime(),
          fileType: 'pdf',
          image: base64,
          payrollCode: this.employeeObj.payrollCode,
          components: components,
          approved: this.utilServ.editData.approve,
          approvedby: this.utilServ.editData.approvedby,
          approveddate: this.utilServ.editData.approveddate,
          branchCode: this.utilServ.editData.branchCode,
          companyCode: this.utilServ.editData.companyCode,
          "createdby": this.utilServ.editData.createdby,
          "createddate": this.utilServ.editData.createddate,
          "lastModifiedby": this.utilServ.editData.lastModifiedby,
          "lastModifieddate": this.utilServ.editData.lastModifieddate,
        }
        this.httpPut.doPut('Offerletter', obj).subscribe((res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            pdf.save(`${this.employeeObj.empName} ` + 'offer-letter.pdf');
            Swal.fire({
              title: 'Updated!',
              // text: 'Offer letter created successfully',
              text: 'Please, Check your downloads for Offer Letter',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.router.navigateByUrl('/offerletter');
              this.employeeObj = {
                id: null,
                empName: null,
                empAddress: null,
                date: null,
                deptCode: null,
                email: null,
                payrollCode: null,
                calculateByRules: false,
                salary: null,
                designation: null,
                amount: null,
                empDateOfJoin: null,
                components: []
              }
            });
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
    });
  }
  onSalaryChange() {
    this.salaryComponents.forEach(x => {
      x.amount = null;
      x.pct = null;
      x.checkedSalary = false;
      this.onChangeBal(0, x);
      this.employeeObj.calculateByRules = false;
    })

  }

}
