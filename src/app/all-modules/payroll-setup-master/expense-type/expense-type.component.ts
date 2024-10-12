import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.scss']
})
export class ExpenseTypeComponent {
  className = 'UserRoleMappingComponent';
  userList = [];
  temp = [];
  usersAre = [];
  selectedRoles = [];
  searchedFor: string;

  update = false;
  view = false;
  config: any;

  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;


  listOfExpTypes = [];
  categoryCodes = [
    { code: 'EXPENSES', name: 'EXPENSES' }
  ];
  subCategoryCode: '';
  expenseForm: FormGroup;

  constructor(
    private httpGetService: HttpGetService,
    private spinner: NgxSpinnerService,
    private acRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private utilServ: UtilService,
    private httpPost: HttpPostService,
    private httpPut: HttpPutService
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.listOfExpTypes.length,
    };
  }

  ngOnInit(): void {
    this.acRoute.data.subscribe(async data => {
      const permission = data.condition
      console.log(permission);

      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove

    });

    this.expenseForm = this.fb.group({
      categoryCode: 'EXPENSES',
      subcategoryCode: [null, [Validators.required, this.httpPost.customValidator()]],
      isactive: true,
      "subcatId": null,
      "partyType": "employee",
      "accountCode": null,
      "companyCode": null,
      "createdby": null,
      "createddate": null,
      "lastmodifiedby": null,
      "lastmodifieddate": null
    })
    this.expenseForm.controls.categoryCode.setValue('EXPENSES');
    this.expenseForm.controls.categoryCode.disable();
    this.getExpenseType();
  }

  getExpenseType() {
    this.spinner.show();
    this.temp = [];
    this.listOfExpTypes = [];
    this.httpGetService.getMasterList('empexpsubcategory').subscribe(
      (res: any) => {
        this.listOfExpTypes = res.response;
        this.temp = res.response;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.error.status.message,
          showConfirmButton: true
        });
      }
    );
  }
  saveChanges() {
    this.spinner.show();
    const obj = {
      // "subcatId": 214,
      "partyType": "employee",
      "categoryCode": "EXPENSES",
      "subcategoryCode": this.expenseForm.controls.subcategoryCode.value,
      "accountCode": null,
      // "companyCode": "SPRINGLOGIX",
      "isactive": this.expenseForm.controls.isactive.value,
      // "createdby": "admin",
      // "createddate": "2024-03-04T13:10:55.000+00:00",
      // "lastmodifiedby": null,
      // "lastmodifieddate": null
    }
    this.httpPost.create('subcategory', obj).subscribe(
      (res: any) => {
        this.spinner.hide();

        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.expenseForm.controls.subcategoryCode.value + ' Created',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.expenseForm.controls.subcategoryCode.setValue(null);
            this.expenseForm.controls.isactive.setValue(true);
            this.closeModel();
            this.getExpenseType();
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
        console.error(err.error.status.message);
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }


  back() {
    this.router.navigateByUrl('/setup');
  }


  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.listOfExpTypes = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.subcategoryCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.listOfExpTypes = temp;
    }
    this.config.totalItems = this.listOfExpTypes.length;
    this.config.currentPage = 1;
  }


  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }

  create() {
    this.update = false;
    this.view = false;
    this.expenseForm.controls.subcategoryCode.setValue(null);
    this.expenseForm.controls.subcategoryCode.enable();
    this.expenseForm.controls.isactive.setValue(true);
    this.expenseForm.controls.isactive.enable();
  }
  viewData(row) {
    this.update = false;
    this.view = true;
    this.expenseForm.disable();
    this.patchRow(row);
  }
  editData(row) {
    this.update = true;
    this.view = false;
    this.patchRow(row);
  }
  patchRow(row) {
    this.expenseForm.controls.subcategoryCode.setValue(row.subcategoryCode);
    this.expenseForm.controls.isactive.setValue(row.isactive);
    this.expenseForm.controls.subcatId.setValue(row.subcatId);
    this.expenseForm.controls.categoryCode.setValue(row.categoryCode);
    this.expenseForm.controls.partyType.setValue(row.partyType);
    this.expenseForm.controls.companyCode.setValue(row.companyCode);
    this.expenseForm.controls.accountCode.setValue(row.accountCode);
    this.expenseForm.controls.createdby.setValue(row.createdby);
    this.expenseForm.controls.createddate.setValue(row.createddate);
    this.expenseForm.controls.lastmodifiedby.setValue(row.lastmodifiedby);
    this.expenseForm.controls.lastmodifieddate.setValue(row.lastmodifieddate);
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }
  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
  }
  closeModel() {
    const closeButton = document.querySelector('.closeModel') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  }
}
