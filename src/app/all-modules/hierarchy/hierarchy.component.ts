import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { TreeNode } from 'primeng/api';

import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
interface Employee {
  employeeId: number;
  name: string; data: any;
  title: string; expanded: boolean, type: string,
  departments: string[];
  children: Employee[];
}
// const OrgChart = require('orgchart');

@Component({
  selector: 'app-hierarchy',
  templateUrl: './hierarchy.component.html',
  styleUrls: ['./hierarchy.component.scss']
})
export class HierarchyComponent implements AfterViewInit {
  @ViewChild('orgChartWrapper', { static: false }) orgChartWrapper!: ElementRef;
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  private readonly levelColorClasses = [
    'bg-blue1-900',
    'bg-blue2-900',
    'bg-blue3-900',
    'bg-blue4-900',
    'bg-blue5-900',
    'bg-blue6-900'
  ];

  private readonly defaultClass = 'bg-blue6-900';  // Default class for levels beyond 6
  private readonly commonClasses = 'text-white-900 rounded-xl';
  zoomLevel: number = 1;
  minZoom: number = 0.5;
  maxZoom: number = 1;
  zoomStep: number = 0.05;


  isDragging = false;
  startX = 0;
  startY = 0;
  scrollLeft = 0;
  scrollTop = 0;


  nodes:any = [];
  option: any;

  constructor(private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    public global: GlobalvariablesService
  ) {
  }

  ngAfterViewInit() {
    this.getOrg();
  }
  centerHorizontalScrollBar() {
    setTimeout(() => {
      if (this.chartContainer) {
        const container = this.chartContainer.nativeElement as HTMLElement;
        container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      }
    }, 200);
  }

  getOrg() {
    this.spinner.show();
    this.httpGet.getMasterList('managersHierarchy').subscribe((res: any) => {
      if (res.response) {
        const nodes = res.response
        // .find(x => x.name == 'DHANU')

        const transformedObject = this.transformJson(nodes);
        transformedObject.forEach((node:any) => this.applyStyleClass(node, 0));
        this.nodes = transformedObject;
        const container = this.chartContainer.nativeElement as HTMLElement;
        // Add wheel event listener with passive: false
        container.addEventListener("wheel", this.onScrollZoom.bind(this), { passive: false });
        this.centerHorizontalScrollBar();
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
  // ngAfterViewInit() {
  //   const container = this.chartContainer.nativeElement as HTMLElement;

  //   // Add wheel event listener with passive: false
  //   container.addEventListener("wheel", this.onScrollZoom.bind(this), { passive: false });

  //   this.centerHorizontalScrollBar();
  // }


  // onMouseDown(event: MouseEvent) {
  //   this.isDragging = true;
  //   const container = this.chartContainer.nativeElement as HTMLElement;
  //   this.startX = event.pageX;
  //   this.startY = event.pageY;
  //   this.scrollLeft = container.scrollLeft;
  //   this.scrollTop = container.scrollTop;
  // }

  // onMouseMove(event: MouseEvent) {
  //   if (!this.isDragging) return;
  //   event.preventDefault();

  //   const container = this.chartContainer.nativeElement as HTMLElement;
  //   const x = event.pageX - this.startX;
  //   const y = event.pageY - this.startY;

  //   container.scrollLeft = this.scrollLeft - x;
  //   container.scrollTop = this.scrollTop - y;
  // }

  // onMouseUp() {
  //   this.isDragging = false;
  // }

  // onScrollZoom(event: WheelEvent) {
  //   event.preventDefault();

  //   if (!this.chartContainer || !this.orgChartWrapper) return;

  //   const chart = this.orgChartWrapper.nativeElement as HTMLElement;

  //   // Apply a smaller zoom step for smoother zooming
  //   if (event.deltaY < 0 && this.zoomLevel < this.maxZoom) {
  //     this.zoomLevel += this.zoomStep;
  //   } else if (event.deltaY > 0 && this.zoomLevel > this.minZoom) {
  //     this.zoomLevel -= this.zoomStep;
  //   }

  //   // Apply zoom effect
  //   chart.style.transform = `scale(${this.zoomLevel})`;
  //   chart.style.transition = 'transform 0.2s ease-in-out';
  //   chart.style.transformOrigin = 'top left';
  // }


  // // Center the Chart Initially
  // centerHorizontalScrollBar() {
  //   setTimeout(() => {
  //     if (this.chartContainer) {
  //       const container = this.chartContainer.nativeElement as HTMLElement;
  //       container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
  //     }
  //   }, 200);
  // }

  setStyleClass(node: TreeNode, level: number): string {
    const colorClass = level < this.levelColorClasses.length
      ? this.levelColorClasses[level]
      : this.defaultClass;

    return `${colorClass} ${this.commonClasses}`;
  }

  applyStyleClass(node: TreeNode, level: number) {
    node.styleClass = this.setStyleClass(node, level);

    // Recursively apply to children if they exist
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.applyStyleClass(child, level + 1));
    }
  }


  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    const container = this.chartContainer.nativeElement as HTMLElement;
    this.startX = event.pageX;
    this.startY = event.pageY;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();

    const container = this.chartContainer.nativeElement as HTMLElement;
    const x = event.pageX - this.startX;
    const y = event.pageY - this.startY;

    container.scrollLeft = this.scrollLeft - x;
    container.scrollTop = this.scrollTop - y;
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onScrollZoom(event: WheelEvent) {
    event.preventDefault();

    if (!this.chartContainer || !this.orgChartWrapper) return;

    const chart = this.orgChartWrapper.nativeElement as HTMLElement;

    // Apply a smaller zoom step for smoother zooming
    if (event.deltaY < 0 && this.zoomLevel < this.maxZoom) {
      this.zoomLevel += this.zoomStep;
    } else if (event.deltaY > 0 && this.zoomLevel > this.minZoom) {
      this.zoomLevel -= this.zoomStep;
    }

    // Apply zoom effect
    chart.style.transform = `scale(${this.zoomLevel})`;
    chart.style.transition = 'transform 0.2s ease-in-out';
    chart.style.transformOrigin = 'top left';
  }


  

  transformJson(originalJson: any[]): Employee[] {
    return originalJson?.map((item) => {
      const transformedJson: Employee = {
        employeeId: item.employeeId,
        name: item.employeeName,
        title: item.designation,
        type:'person',
        expanded: true,
        data: { name: item.employeeName, title: item.designation, employeeCode: item.employeeId },

        departments: item.departments || [],
        children: item.childs ? this.transformJson(item.childs) : [],
      };

      return transformedJson;
    })
  }
}
