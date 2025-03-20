import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-visit-mapping',
  templateUrl: './visit-mapping.component.html',
  styleUrl: './visit-mapping.component.scss'
})
export class VisitMappingComponent implements OnInit {

  config: any;
  rows = [];
  temp = [];
  stopSpinner = true;
  searchedFor: string;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;

  constructor(
    private router: Router,
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

   ngOnInit(): void {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.getVisitConfigs();

   }

   getVisitConfigs() {
    this.spinner.show();
    this.httpGetService.getMasterList('emp/visit/mapping').subscribe((res: any) => {
      const rows = res.response;
      this.utilServ.allVisitConfigs = res.response;
      this.temp = [...rows];
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = rows.filter(function (d) {
          return d.empcode.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = rows;        
      }
      // const groupedByConfigId = rows.reduce((acc, visit) => {
      //   // if (visit.empCode ) { // Check if empCode is not null
      //     if (!acc[visit.visitConfigId]) {
      //   acc[visit.visitConfigId] = { ...visit, empcodes: [] };
      //     }
      //     acc[visit.visitConfigId].empcodes.push(visit.empCode);
      //   // } 
      //   return acc;
      // }, {});

      // const rows = res.response;
      const groupedByConfigId = {};

      // First pass: Collect empCodes and deptCodes along with other fields
      rows.forEach(visit => {
        if (!groupedByConfigId[visit.visitConfigId]) {
          groupedByConfigId[visit.visitConfigId] = { 
            empcodes: [], 
            deptCode: null,
            branchCode: visit.branchCode,
            companyCode: visit.companyCode,
            id: visit.id // Keep the first id for this visitConfigId
          };
        }
    
        // Collect empCodes
        if (visit.empCode) {
          groupedByConfigId[visit.visitConfigId].empcodes.push(visit.empCode);
        }
    
        // Collect deptCode, if present
        if (visit.deptCode) {
          groupedByConfigId[visit.visitConfigId].deptCode = visit.deptCode;
        }
      });
    
      // Second pass: Prepare final output
      this.rows = [];
      for (const visitConfigId in groupedByConfigId) {
        const entry = groupedByConfigId[visitConfigId];
    
        // If there are empCodes, add an entry for them
        if (entry.empcodes.length > 0) {
          this.rows.push({
            visitConfigId: parseInt(visitConfigId),
            empcodes: entry.empcodes,
            deptCode: null,
            branchCode: entry.branchCode,
            companyCode: entry.companyCode,
            id: entry.id
          });
        }
    
        // If there is a deptCode, add a separate entry for it
        if (entry.deptCode) {
          this.rows.push({
            visitConfigId: parseInt(visitConfigId),
            empcodes: [],
            deptCode: entry.deptCode,
            branchCode: entry.branchCode,
            companyCode: entry.companyCode,
            id: entry.id
          });
        }
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

  addMapping() {

    this.router.navigateByUrl('setup/visit-mapping/create-mapping');
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
    this.router.navigateByUrl('setup/visit-mapping/create-mapping');
  }
  editData(row) {
    this.UtilServ.editData = row;
    this.router.navigateByUrl('setup/visit-mapping/create-mapping');
  }

  back() {
    this.router.navigateByUrl('/setup');
  }

  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }

   updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.empcode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }

}
