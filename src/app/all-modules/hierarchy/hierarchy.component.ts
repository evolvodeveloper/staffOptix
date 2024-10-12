import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { HttpGetService } from 'src/app/services/http-get.service';
interface Employee {
  employeeId: number;
  name: string;
  title: string;
  departments: string[];
  children: Employee[];
}
// const OrgChart = require('orgchart');

@Component({
  selector: 'app-hierarchy',
  templateUrl: './hierarchy.component.html',
  styleUrls: ['./hierarchy.component.scss']
})
export class HierarchyComponent implements OnInit {
  nodes = [];
  option: any;

  constructor(private httpGet: HttpGetService,
    private spinner: NgxSpinnerService
  ) {
  }

  ngOnInit() {
    this.getOrg();
  }

  getOrg() {
    this.spinner.show();
    this.httpGet.getMasterList('managersHierarchy').subscribe((res: any) => {
      if (res.response) {
        const nodes = res.response
        // .find(x => x.name == 'DHANU')

        const transformedObject = this.transformJson(nodes);
        this.nodes = transformedObject
        let modified = [];
        if (this.nodes.length > 1) {
          modified = [
            {
              name: 'Organization',
              children: this.nodes,
              departments: [],
              title: "Root"
            }]
        } else {
          modified = this.nodes
        }

        this.option = {
          title: {
            text: 'Organization Chart',
            // subtext: 'Employee check-in times'
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            bottom: '2%',
            left: 'center'
          },
          series: [
            {
              type: 'tree',
              data: modified,
              top: '1%',
              left: '7%',
              bottom: '1%',
              right: '20%',
              symbolSize: 7,
              label: {
                position: 'left',
                verticalAlign: 'middle',
                align: 'right',
                fontSize: 12
              },
              leaves: {
                label: {
                  position: 'right',
                  verticalAlign: 'middle',
                  align: 'left'
                }
              },
              emphasis: {
                focus: 'descendant'
              },
              expandAndCollapse: true,
              animationDuration: 550,
              animationDurationUpdate: 750
            }
          ]
        };
        this.spinner.hide();

      }
    },
      err => {
        console.error(err.error.status.message);
        this.spinner.hide();
      }
    )
  }

  transformJson(originalJson: any[]): Employee[] {
    return originalJson?.map((item) => {
      const transformedJson: Employee = {
        employeeId: item.employeeId,
        name: item.employeeName,
        title: item.designation,
        departments: item.departments || [],
        children: item.childs ? this.transformJson(item.childs) : [],
      };

      return transformedJson;
    })
  }
}
