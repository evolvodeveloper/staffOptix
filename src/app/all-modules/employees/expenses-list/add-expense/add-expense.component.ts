import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],

})
export class AddExpenseComponent implements OnInit, OnDestroy {
  @Input() public userdata;
  expenseForm: FormGroup;
  today = moment().format('YYYY-MM-DD')
  view = false;
  update = false;
  itemsArray = [];
  PreviewObject: any;
  totalAmt = 0;
  totalQty = 0;
  receipts = [];
  image = false;
  emp: any = {
    fileName: null,
    fileType: null,
    image: null,
    imageByte: null,
  }
  catagaroyList = [];

  userProfile: any;
  employeeCode: string;

  constructor(
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private httpPost: HttpPostService,
    private httpGetService: HttpGetService,
    private UtilServ: UtilService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private globalServ: GlobalvariablesService,
    private httpPut: HttpPutService,) {
  }

  ngOnDestroy() {
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
  }

  ngOnInit() {
    this.expenseForm = this.fb.group({
      expenseTittle: [null, [Validators.required, this.httpPost.customValidator()]],
      expenseType: [null],
      dateOfExpense: [moment().format('YYYY-MM-DD'), [Validators.required]],
      amount: [null, [Validators.required]],
      comments: [null],
      employeeCode: [null],
      receiptsDocuments: [null],
    });
    this.getCatagiroies();
    this.getUserProfile.call(this);

    this.today = moment().format('YYYY-MM-DD');
    if (this.UtilServ.viewData) {
      this.view = true;
      this.expenseForm.controls.dateOfExpense.setValue(
        moment(this.UtilServ.viewData.row.billDate).format('YYYY-MM-DD')
      );
      this.expenseForm.controls.expenseTittle.setValue(
        this.UtilServ.viewData.row.title
      );
      this.expenseForm.controls.expenseType.setValue(
        this.UtilServ.viewData.row.subcategoryCode
      );
      this.expenseForm.controls.amount.setValue(
        this.UtilServ.viewData.row.totalAmt
      );
      this.expenseForm.controls.comments.setValue(
        this.UtilServ.viewData.row.notes
      );

      this.UtilServ.viewData.row.employeeExpenseLines.forEach((x) => {
        this.itemsArray.push({
          itemName: x.itemName,
          itemQty: x.itemQty,
          itemRate: x.itemRate,
          itemAmount: x.itemAmount,
          createdby: x.createdby,
          createddate: x.createddate,
          billId: x.billId,
          itemStatus: x.itemStatus,
          lastmodifiedby: x.lastmodifiedby,
          lastmodifieddate: x.lastmodifieddate,
          billDate: x.billDate,
          buCode: x.buCode,
          divisionCode: x.divisionCode,
          tenantCode: x.tenantCode,
          lineId: x.lineId,
        });
      });

      this.expenseForm.disable();
      if (this.UtilServ.viewData.row.empExpenseDocuments.length !== null) {
        this.UtilServ.viewData.row.empExpenseDocuments.forEach(element => {
          this.receipts.push({
            documentId: element.documentId,
            image: element.image,
            billId: element.billId,
            buCode: element.buCode,
            createdby: element.createdby,
            documentType: element.documentType,
            createddate: element.createddate,
            fileDir: element.fileDir,
            fileName: element.fileName,
            fileType: element.fileType,
            lastmodifiedby: element.lastmodifiedby,
            lastmodifieddate: element.lastmodifieddate,
            tenantCode: element.tenantCode,
            viewImage: this.sanitizer.bypassSecurityTrustResourceUrl('data:' + element.documentType + ';base64,' + element.image)

          });
        });
      }
    } else if (this.UtilServ.editData) {
      this.update = true;
      this.UtilServ.editData.row.employeeExpenseLines.forEach((x) => {
        this.itemsArray.push({
          itemName: x.itemName,
          itemQty: x.itemQty,
          itemRate: x.itemRate,
          itemAmount: x.itemAmount,
          createdby: x.createdby,
          createddate: x.createddate,
          billId: x.billId,
          itemStatus: x.itemStatus,
          lastmodifiedby: x.lastmodifiedby,
          lastmodifieddate: x.lastmodifieddate,
          billDate: x.billDate,
          buCode: x.buCode,
          divisionCode: x.divisionCode,
          tenantCode: x.tenantCode,
          lineId: x.lineId,
        });
      });

      this.expenseForm.enable();
      this.expenseForm.controls.dateOfExpense.setValue(
        moment(this.UtilServ.editData.row.billDate).format('YYYY-MM-DD')
      );
      this.expenseForm.controls.expenseTittle.setValue(
        this.UtilServ.editData.row.title
      );
      this.expenseForm.controls.expenseType.setValue(
        this.UtilServ.editData.row.subcategoryCode
      );
      this.expenseForm.controls.amount.setValue(
        this.UtilServ.editData.row.totalAmt
      );
      this.expenseForm.controls.comments.setValue(
        this.UtilServ.editData.row.notes
      );

      if (this.UtilServ.editData.row.empExpenseDocuments.length > 0) {
        this.UtilServ.editData.row.empExpenseDocuments.forEach(element => {
          this.receipts.push({
            documentId: element.documentId,
            image: element.image,
            billId: element.billId,
            buCode: element.buCode,
            documentType: element.documentType,
            createdby: element.createdby,
            createddate: element.createddate,
            fileDir: element.fileDir,
            fileName: element.fileName,
            fileType: element.fileType,
            lastmodifiedby: element.lastmodifiedby,
            lastmodifieddate: element.lastmodifieddate,
            tenantCode: element.tenantCode,
            // type.replace('data:image/', '.')
            viewImage: this.sanitizer.bypassSecurityTrustResourceUrl('data:' + element.documentType + ';base64,' + element.image)
          });
        });
      }

    }

  }

  back() {
    this.router.navigateByUrl('/expenses');
  }

  getUserProfile() {
    if (this.UtilServ.userProfileData !== undefined) {
      this.userProfile = this.UtilServ.userProfileData
      this.employeeCode = this.userProfile.employeeCode;
    }
    else {
      setTimeout(() => {
        this.getUserProfile.call(this)
      })
    }
  }

  getCatagiroies() {
    this.httpGetService.getMasterList('empexpsubcategory').subscribe(
      (res: any) => {
        this.catagaroyList = res.response;
      }, (err) => {
        console.error(err.error.status.message);
      })
  }
  extractMimeType(dataUrl: string): string {
    const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    return match ? match[1] : '';
  }
  onSelectFile(event) {   
    const maxSize = 10485760; // 10 MB in bytes
    if (event.target.files && event.target.files[0] && event.target.files[0].size < maxSize) {
      const file = event.target.files[0];
      // type = extension.replace('image/', '.');
      const filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          //****  hello please dont remove ';' before  'base64' make sure it look like this ';base64' ****
          const base64 = event.target.result?.replace(/^data:.*?;base64,/, '');
          const mimeType = this.extractMimeType(event.target.result);
          // extension.substring(11, extension.indexOf(character));
          this.receipts.push({
            // type.replace('data:image/', '.')
            fileType: file.name.split('.').pop(),
            documentType: mimeType,
            // fileName: event.target.files[i].name,
            // fileName: 'Receipt' + (i + 1) + '.' + type,
            fileName: 'Receipt' + Math.floor(1000 + Math.random() * 9000),
            viewImage: this.sanitizer.bypassSecurityTrustResourceUrl(event.target.result),
            image: base64
          });
        }
        reader.readAsDataURL(event.target.files[i]);
      }
    }
    else {
      Swal.fire({
        title: 'Info',
        html: 'File size exceeds the limit of 10 Mb',
        icon: 'warning',
      })
    }

  }

  forToedit(i, row) {
    if (!this.view) {
      Swal.fire({
        title: 'Are you sure?',
        html: 'Do You Want to Delete ?',
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33', confirmButtonText: 'Yes', allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // this.receipts.splice(i, 1);
          if (row.documentId) {
            this.receipts[i].isDeleted = true;
          }
          else {
            this.receipts.splice(i, 1)
          }

          // this.httpPutService.doPut('expenseDocument?id=' + data.documentId, '').subscribe((res: any) => {
          // }
          //   ,
          //   err => {
          //     console.error(err.error.status.message);
          //   });
        }
      });
    }
  }

  addItem() {
    const length = this.itemsArray.length;
    if (length > 0) {
      const isEmpty =
        this.itemsArray[length - 1].itemName.length == 0 &&
        this.itemsArray[length - 1].itemQty.length == 0 &&
        this.itemsArray[length - 1].itemRate.length == 0;
      if (!isEmpty) {
        this.itemsArray.push({
          itemName: '',
          itemQty: '',
          itemRate: '',
          itemAmount: '',
        });
      }
    } else {
      this.itemsArray.push({
        itemName: '',
        itemQty: '',
        itemRate: '',
        itemAmount: '',
      });
    }
    // this.getTotalAmount()
    this.getTotal();
  }

  getTotal(): void {
    this.totalAmt = 0;
    this.totalQty = 0;
    this.itemsArray.forEach((x) => {
      if (x.isDeleted !== true) {
        x.itemAmount = x.itemQty * x.itemRate;
        this.totalAmt += x.itemAmount;
        this.totalQty += x.itemQty;
      }
    });
  }

  removeItem(index) {
    this.itemsArray[index].isDeleted = true;
    this.getTotal();
  }

  createExpense() {
    if (this.expenseForm.invalid) {
      for (const control of Object.keys(this.expenseForm.controls)) {
        this.expenseForm.controls[control].markAsTouched();
      }
      return;
    } else {
      this.expenseForm.get('expenseTittle')
        .setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.expenseForm.controls.expenseTittle.value), { emitEvent: false });
      this.spinner.show();
      const data = {
        title: this.expenseForm.controls.expenseTittle.value,
        subcategoryCode: this.expenseForm.controls.expenseType.value,
        billDate: this.expenseForm.controls.dateOfExpense.value,
        totalAmt: this.expenseForm.controls.amount.value,
        notes: this.expenseForm.controls.comments.value,
        empExpenseDocuments: this.receipts,
        employeeExpenseLines: this.itemsArray,
        employeeCode: this.userProfile.employeeCode,
      };
      this.httpPost.create('employeeexpenses', data).subscribe((res: any) => {
        if (res.status.message == 'SUCCESS') {
          this.spinner.hide();
          Swal.fire({
            title: 'Success',
            text: 'Expense Created Successfully',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              this.expenseForm.reset();
              this.itemsArray = [];
              this.receipts = [];
              this.totalAmt = 0;
              this.UtilServ.expensesByEmp = [];
              this.UtilServ.AllExpenses = [];
              this.totalQty = 0;
              this.today = moment().format('YYYY-MM-DD');
              this.router.navigateByUrl('/expenses');
            }
          });
        }
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
          console.error(err.error.status.message);
        });
    }
  }

  Update() {
    this.expenseForm.get('expenseTittle').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.expenseForm.controls.expenseTittle.value), { emitEvent: false });
    const documents = [];
    this.spinner.show();
    this.receipts.forEach(img => {
      if (img.documentId === null) {
        documents.push(img);
      }
    });
    const data = {
      billCode: this.UtilServ.editData.row.billCode,
      billDate: this.expenseForm.controls.dateOfExpense.value,
      billId: this.UtilServ.editData.row.billId,
      buCode: this.UtilServ.editData.row.buCode,
      employeeCode: this.userProfile.employeeCode,
      totalAmt: this.expenseForm.controls.amount.value,
      totalQty: this.UtilServ.editData.row.totalQty,
      costCenterCode: this.UtilServ.editData.row.costCenterCode,
      categoryCode: this.UtilServ.editData.row.categoryCode,
      subcategoryCode: this.expenseForm.controls.expenseType.value,
      status: this.UtilServ.editData.row.status,
      paidAmt: this.UtilServ.editData.row.paidAmt,
      paymentStatus: this.UtilServ.editData.row.paymentStatus,
      notes: this.expenseForm.controls.comments.value,
      approvedBy: this.UtilServ.editData.row.approvedBy,
      createdby: this.UtilServ.editData.row.createdby,
      createddate: this.UtilServ.editData.row.createddate,
      divisionCode: this.UtilServ.editData.row.divisionCode,
      lastmodifiedby: this.UtilServ.editData.row.lastmodifiedby,
      lastmodifieddate: this.UtilServ.editData.row.lastmodifieddate,
      approveddate: this.UtilServ.editData.row.approveddate,
      title: this.expenseForm.controls.expenseTittle.value,
      empExpenseDocuments: this.receipts,
      tenantCode: this.UtilServ.editData.row.tenantCode,
      approved: this.UtilServ.editData.row.approved,
      employeeExpenseLines: this.itemsArray,
    };
    this.httpPut.doPut('employeeexpense', data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success',
          text: this.expenseForm.controls.expenseTittle.value + ' Updated',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          this.router.navigateByUrl('/expenses');
          this.expenseForm.reset();
          this.itemsArray = [];
          this.receipts = [];
          this.totalAmt = 0;
          this.UtilServ.expensesByEmp = [];
          this.UtilServ.AllExpenses = [];
          this.totalQty = 0;
        });
      }
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
  previewRow(i, data) {
    this.PreviewObject = data
  }

}
