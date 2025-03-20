import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vist-config',
  templateUrl: './vist-config.component.html',
  styleUrl: './vist-config.component.scss'
})
export class VistConfigComponent implements OnInit {

  config: any;
  rows = [];
  temp = [];
  stopSpinner = true;
  searchedFor: string;
  status: string;
  dateFormat: string;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  newrows: unknown[];
  
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
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });


      this.getVisitConfigs();


    

  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.purpose.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }

  getVisitConfigs() {
    this.spinner.show();
    this.httpGetService.getMasterList('hr/visit').subscribe((res: any) => {
      const rows = res.response;
      this.utilServ.allVisitConfigs = rows;
      this.temp = [...rows];
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = rows.filter(function (d) {
          return d.purpose.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = rows;
      }
      // Group by ConfigId and collect empcodes
      // const groupedByConfigId = this.rows.reduce((acc, visit) => {
      //   if (!acc[visit.ConfigId]) {
      //     acc[visit.ConfigId] = { ...visit, empcodes: [] };
      //   }
      //   acc[visit.ConfigId].empcodes.push(visit.empcode);
      //   return acc;
      // }, {});

      // Convert the grouped object back to an array
      // this.newrows = Object.values(groupedByConfigId);
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

  addConfig() {

    let removedEmps = [];
    this.rows.forEach(row => {
      removedEmps = removedEmps.concat(row.empVisitList);
      // or using spread operator: removedEmps.push(...row.empVisitList);
    });  
    const navigationExtras = {
      state: {
        selectedEmployees: removedEmps // Pass the employee list
      }
    };   
    this.router.navigate(['/setup/visit-config/create-vist-config'], navigationExtras);  // Navigate to create component
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
    this.UtilServ.viewData = row;
    this.router.navigateByUrl('/setup/visit-config/create-vist-config');
  }
  editData(row) {
    this.UtilServ.editData = {
      ...row,
      empVisitList: row?.empVisitList // Ensure the employee list is included
    };
    this.router.navigateByUrl('/setup/visit-config/create-vist-config');
  }
  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }

  back() {
    this.router.navigateByUrl('/setup');
  }

}
