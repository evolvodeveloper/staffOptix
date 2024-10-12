import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';

import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from '../../services/util.service';
import { LoadMoreComponent } from './load-more/load-more.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // early_checkins_list: any = [];
  // late_comers_list: any = [];
  employee_attendance_list: any = [];
  chart1_options: any;
  chart2_options: any;
  option: any;
  data = {
    attendanceReport: null,
    checkInStatistics: null,
    absents: null,
    employeeLoginDetails: null,
    early_checkins: [],
    late_comers: []
  }
  date = moment().format('YYYY-MM-DD');

  constructor(private httpGet: HttpGetService,
    private acRoute: ActivatedRoute,
    private http: HttpClient,
    public globalServ: GlobalvariablesService,
    private utilServ: UtilService,
    private modalService: NgbModal) { }

  async ngOnInit() {
    this.getAttendanceReport();
    this.getEmployeeReport();
    this.getAbsentees();
    this.globalServ.getMyCompLabels('dashboard')
    this.getEmployeeLoginDetails();
    this.utilServ.universalSerchedData = {
      componentName: null,
      searchedText: ''
    }
  }
  dateModified() {
    this.data = {
      attendanceReport: null,
      checkInStatistics: null,
      absents: null,
      employeeLoginDetails: null,
      early_checkins: [],
      late_comers: []
    }
    this.getAttendanceReport();
    this.getEmployeeReport();
    this.getAbsentees();
    this.getEmployeeLoginDetails();
  }

  loadMore(type, header, data) {
    const modalRef = this.modalService.open(LoadMoreComponent,
      {
        scrollable: true,
        windowClass: 'myCustomModalClass',
        size: 'xl',
        backdrop: 'static',
      });

    modalRef.componentInstance.load_more = {
      type: type,
      data: data,
      header: header
    };

    // modalRef.result.then((result) => {
    // },
    // (reason) => {
    // }
    // );
  }

  getEmployeeLoginDetails() {
    const filteredDetails = [];
    this.httpGet.getMasterList('empLoginDetails?date=' + this.date).subscribe((res: any) => {
      res.response.forEach(element => {
        if (element.attStatus !== 'Leave' && element.attStatus !== 'WEEK OFF') {
          element.totalHours1 = null;
          element.effectiveHrs1 = null;
          // totalHours
          const resultInMinutes = element.totalHours ? element.totalHours * 60 : 0;
          const h = Math.floor(resultInMinutes / 60);
          const hours = h < 10 ? '0' + h : h
          const m = Math.floor(resultInMinutes % 60);
          const minutes = m < 10 ? '0' + m : m
          element.totalHours1 = hours + ':' + minutes
          // effectiveHrs
          const effectiveHrs1 = element.effectiveHrs ? element.effectiveHrs * 60 : 0;
          const h1 = Math.floor(effectiveHrs1 / 60);
          const hours1 = h1 < 10 ? '0' + h1 : h1
          const m1 = Math.floor(effectiveHrs1 % 60);
          const minutes1 = (m1 < 10) ? '0' + m1 : m1
          element.effectiveHrs1 = hours1 + ':' + minutes1
          filteredDetails.push(element)
        }
      });
      this.data.employeeLoginDetails = filteredDetails;
    })
  }

  getAbsentees() {
    this.httpGet.getMasterList('absent?date=' + this.date).subscribe((res: any) => {
      this.data.absents = res.response;
    })
  }

  async getAttendanceReport() {
    this.httpGet.getMasterList('attendanceRpt?date=' + this.date).subscribe((res: any) => {
      this.data.attendanceReport = res.response;
      this.overallAttendancePercentageChart();
    })
  }

  async getEmployeeReport() {
    this.httpGet.getMasterList('employeeReport?date=' + this.date).subscribe((res: any) => {
      res.response.forEach(r => {
        r.entryHrs1 = null;
        // totalHours
        const resultInMinutes = r.entryHrs ? r.entryHrs * 60 : 0;
        const h = Math.floor(resultInMinutes / 60);
        const hours = h < 10 ? '0' + h : h
        const m = Math.floor(resultInMinutes % 60);
        const minutes = m < 10 ? '0' + m : m
        r.entryHrs1 = hours + ':' + minutes

        if (r.employeeStatus == 'EARLY') {
          this.data.early_checkins.push(r);
        } else if (r.employeeStatus == 'LATE') {
          this.data.late_comers.push(r);
        }
      });
      this.data.checkInStatistics = res.response;
      this.checkInTimeStatisticsChart();
    })
  }

  async checkInTimeStatisticsChart() {
    let unique = [...new Set(this.data.checkInStatistics.map((g: any) => g.employeeStatus))];
    unique = unique.sort();
    const chart_data = [];
    unique.forEach(u => {
      let count = 0;
      this.data.checkInStatistics.forEach(c => {
        if (u == c.employeeStatus) {
          ++count;
        }
      });
      chart_data.push({ value: count, name: u })
    });
    // const getOdIndex = chart_data.findIndex(x => x.name == 'OD');
    // const getInTime = chart_data.find(x => x.name == 'IN_TIME');

    // if (getOdIndex !== -1 && getInTime) {
    //   getInTime.value += chart_data[getOdIndex].value;
    //   chart_data.splice(getOdIndex, 1);
    // }
    chart_data.forEach(x => {
      switch (x.name) {
        case 'IN_TIME':
          return x.colorCode = '#55ce63'; // IN_TIME
        case 'LATE':
          return x.colorCode = '#EC8C56'; // LATE
        case 'EARLY':
          return x.colorCode = '#C4A3FC'; // EARLY
        case 'UNASSIGNED':
          return x.colorCode = '#FFBF00'; // UNASSIGNED
        case 'WEEK OFF':
          return x.colorCode = '#2B94DB'; // Week Off  
        case 'OD':
          return x.colorCode = '#db2bbb'; // OD  
      }
    })
    const colorPalette = chart_data.map(x => x.colorCode)
    // const colorPalette = ['#C4A3FC', '#55ce63 ', '#EC8C56', '#FFBF00', '#2B94DB'];
    this.option = {
      title: {
        text: 'Check-in Time Statistics',
        subtext: 'Employee check-in times'
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
          // name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          color: colorPalette,
          avoidLabelOverlap: false,

          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            // borderWidth: 2,
            // shadowBlur: 2,
            // shadowOffsetX: 0,
            // shadowOffsetY: 0,
            shadowColor: '#0080fc'
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chart_data
        }
      ]
    };
    this.chart1_options = {
      title: {
        text: 'Check-in Time Statistics',
        subtext: 'Employee check-in times'
      },
      tooltip: {
        trigger: 'item'
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: '50%',
          center: ['50%', '55%'],
          data: chart_data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  async overallAttendancePercentageChart() {
    let gaugeData;
    let color: string;
    const a = this.data.attendanceReport.present > 0 ? this.data.attendanceReport.present : 0;
    const b = this.data.attendanceReport.reportingEmployees > 0 ? this.data.attendanceReport.reportingEmployees : 0;
    const abc = Number(((a / b) * 100).toFixed(2))
    if (abc < 75) {
      color = '#FF4C6C'
    } else {
      color = '#4bb543'
    }
    if (a > 0 && b > 0) {
      gaugeData = [
        {
          value: ((a / b) * 100).toFixed(2),
          detail: {
            valueAnimation: true,
            offsetCenter: ['0%', '12%']
          }
        }
      ];
    } else {
      gaugeData = [
        {
          value: 0,
          detail: {
            valueAnimation: true,
            offsetCenter: ['0%', '12%']
          }
        }
      ];
    }

    this.chart2_options = {
      title: {
        text: 'Overall Attendance Percentage',
        subtext: '',
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: 'Save',
            icon: 'saveAsImage',
            show: true,
            emphasis: {
              iconStyle: {
                textPosition: 'bottom'
              }
            }
          }
        }
      },
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['50%', '75%'],
          radius: '90%',
          color: color,
          pointer: {
            show: true,
            color: 'yellow',

          },
          progress: {
            show: true,
            overlap: false,
          },
          axisLine: {
            lineStyle: {
              width: 40
            }
          },
          splitLine: {
            show: false,
            distance: 0,
            length: 10
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false,
            distance: 50
          },
          data: gaugeData,
          detail: {
            width: 50,
            height: 14,
            fontSize: 13,
            color: 'inherit',
            formatter: '{value}%'
          },
        }
      ]
    };
  }

  // setChart1() {
  //   this.chart1_options = {
  //     title: {
  //       text: 'Check-in Time Statistics',
  //       subtext: 'Employee check-in times'
  //     },
  //     tooltip: {
  //       trigger: 'item'
  //     },
  //     toolbox: {
  //       feature: {
  //         saveAsImage: {}
  //       }
  //     },
  //     series: [
  //       {
  //         name: 'Access From',
  //         type: 'pie',
  //         radius: '50%',
  //         center: ['50%', '55%'],
  //         data: [
  //           { value: 68, name: 'On Time' },
  //           { value: 18, name: 'Early' },
  //           { value: 6, name: 'Late' },
  //           { value: 8, name: 'Late with Permission' },
  //           // { value: 300, name: 'Video Ads' }
  //         ],
  //         emphasis: {
  //           itemStyle: {
  //             shadowBlur: 10,
  //             shadowOffsetX: 0,
  //             shadowColor: 'rgba(0, 0, 0, 0.5)'
  //           }
  //         }
  //       }
  //     ]
  //   };
  // }

  // setChart2() {
  //   const gaugeData = [
  //     {
  //       value: 82.88,
  //       detail: {
  //         valueAnimation: true,
  //         offsetCenter: ['0%', '12%']
  //       }
  //     }
  //   ];

  //   this.chart2_options = {
  //     title: {
  //       text: 'Overall Attendance Percentage',
  //       subtext: '',
  //     },
  //     toolbox: {
  //       feature: {
  //         saveAsImage: {}
  //       }
  //     },
  //     series: [
  //       {
  //         type: 'gauge',
  //         startAngle: 180,
  //         endAngle: 0,
  //         center: ['50%', '75%'],
  //         radius: '90%',
  //         pointer: {
  //           show: true
  //         },
  //         progress: {
  //           show: true,
  //           overlap: false,
  //         },
  //         axisLine: {
  //           lineStyle: {
  //             width: 40
  //           }
  //         },
  //         splitLine: {
  //           show: false,
  //           distance: 0,
  //           length: 10
  //         },
  //         axisTick: {
  //           show: false
  //         },
  //         axisLabel: {
  //           show: false,
  //           distance: 50
  //         },
  //         data: gaugeData,
  //         detail: {
  //           width: 50,
  //           height: 14,
  //           fontSize: 13,
  //           color: 'inherit',
  //           formatter: '{value}%'
  //         },
  //       }
  //     ]
  //   };
  // }
}
