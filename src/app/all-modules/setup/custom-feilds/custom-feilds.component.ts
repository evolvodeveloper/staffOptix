import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-custom-feilds',
  templateUrl: './custom-feilds.component.html',
  styleUrl: './custom-feilds.component.scss'
})
export class CustomFeildsComponent implements OnInit {

  config: any;
  rows = [];
  temp = [];
  stopSpinner = true;
  searchedFor: string;
  status: string;
  dateFormat: string;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private global: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private utilServ: UtilService,
    private acRoute: ActivatedRoute,
    private UtilServ: UtilService,


  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
   }


  ngOnInit() {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission?.hasPermissionToUpdate
      this.hasPermissionToApprove = permission?.hasPermissionToApprove
    });
    // this.getCustomFeilds();


    if (this.utilServ.allCumstomFeilds.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.allCumstomFeilds.filter(function (d) {
          return d.entityField.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = this.utilServ.allCumstomFeilds
      }
    } else {
      this.getCustomFeilds();
    }

  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.entityField.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }

  getCustomFeilds() {
    this.spinner.show();
    this.httpGetService.getMasterList('hr/visit/ui-mapping/').subscribe((res: any) => {
      const rows = res.response;
      this.utilServ.allCumstomFeilds = res.response;
      this.temp = [...rows];
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = rows.filter(function (d) {
          return d.entityField.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = rows;
        console.log(this.rows);
        
      }
      this.config.totalItems = this.rows.length;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      })
  }

  createCustom() {
    this.router.navigateByUrl('setup/custom-config/create-custom-feilds');
  }

  changeData(type) {
    this.searchedFor = '';
    this.rows = this.temp.filter(row => row.userType == type)
    this.config.totalItems = this.rows.length;
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }
  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }

  viewData(row) {
console.log(row);

    this.UtilServ.viewData = row;
    this.router.navigateByUrl('/setup/custom-config/create-custom-feilds');
  }
  editData(row) {
    console.log(row);
    
 
    this.UtilServ.editData = row;
    this.router.navigateByUrl('/setup/custom-config/create-custom-feilds');
  }

  back() {
    this.router.navigateByUrl('/setup');
  }


}
