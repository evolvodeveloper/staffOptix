
import { Injectable } from '@angular/core';
// import * as XLSX from 'xlsx';
import * as XLSX from 'xlsx-js-style';
import { GlobalvariablesService } from './globalvariables.service';

// const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
    providedIn: 'root',
})
export class ExcelService {
    constructor(
        private globalServ: GlobalvariablesService
    ) {

    }
    public exportAsExcelFile(json: any[], excelFileName: string): void {
        // const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const range = XLSX.utils.decode_range(ws['!ref']);
        // const noRows = range.e.r; // No.of rows
        const noCols = range.e.c + 1; // No. of cols
        const headerCount = noCols;
        for (const i in ws) {
            if (typeof ws[i] != 'object') continue;
            const cell = XLSX.utils.decode_cell(i);
            ws[i].s = {
                // styling for all cells
                font: {
                    name: 'Calibri',
                },
                alignment: {
                    vertical: 'left',
                    horizontal: 'left',
                    wrapText: '0', // any truthy value here
                },
            };

            if (cell.c > 1) {
                ws[i].s.alignment.vertical = 'center',
                    ws[i].s.alignment.horizontal = 'center'
            }
            // if condition starts
            (ws[i].v == 'L') ? ws[i].s = {

                font: {
                    bold: true,
                    color: { rgb: "ed576b" },
                },
                alignment: {
                    vertical: 'center',
                    horizontal: 'center',
                    wrapText: '0', // any truthy value here
                },
            }
                : (ws[i].v == 'W') || (ws[i].v == 'W/P') ? ws[i].s = {
                    font: {
                        bold: false,
                        color: { rgb: "0000ff" },
                    },
                    alignment: {
                        vertical: 'center',
                        horizontal: 'center',
                        wrapText: '0', // any truthy value here
                    },
                }
                    : (ws[i].v == 'P') ? ws[i].s = {
                        font: {
                            bold: true,
                            color: { rgb: "28ba62" },//green
                        },
                        alignment: {
                            vertical: 'center',
                            horizontal: 'center',
                            wrapText: '0', // any truthy value here
                        },
                    }
                        : (ws[i].v == 'H') || (ws[i].v == 'H/P') ? ws[i].s = {
                            font: {
                                bold: true,
                                color: {
                                    rgb: "6a5acd"
                                },
                            },
                            alignment: {
                                vertical: 'center',
                                horizontal: 'center',
                                wrapText: '0', // any truthy value here
                            },
                        }
                            : (ws[i].v == 'X') ? ws[i].s = {
                                font: {
                                    bold: true,
                                    color: {
                                        rgb: "ed576b"
                                    },
                                },
                                alignment: {
                                    vertical: 'center',
                                    horizontal: 'center',
                                    wrapText: '0', // any truthy value here
                                },
                            }
                                : (ws[i].v == 'P/*') ? ws[i].s = {
                                    font: {
                                        bold: true,
                                        color: {
                                            rgb: "28ba62" //green
                                        },
                                    },
                                    alignment: {
                                        vertical: 'center',
                                        horizontal: 'center',
                                        wrapText: '0', // any truthy value here
                                    },
                                } : (ws[i].v == 'HD') ? ws[i].s = {
                                    font: {
                                        bold: false,
                                        color: {
                                            rgb: "ffa500" //orange
                                        },
                                    },
                                    alignment: {
                                        vertical: 'center',
                                        horizontal: 'center',
                                        wrapText: '0', // any truthy value here
                                    },
                                }
                                    : '';

            // if condition ends

            if (cell.r == 0) {
                // first row
                ws[i].s = {
                    border: {
                        bottom: {
                            // bottom border
                            style: 'thin',
                            color: '000000',
                        },
                        right: {
                            style: 'thin',
                            color: '000000',
                        },

                    },
                    alignment: {
                        vertical: 'center',
                        horizontal: 'center',
                        wrapText: '0', // any truthy value here
                    },
                    font: {
                        bold: true,
                        // color: { rgb: "ed576b" },
                    },
                }
            }

            if (cell.r % 2) {
                // every other row
                ws[i].s.fill = {
                    // background color
                    patternType: 'solid',
                    // fgColor: { rgb: '96daff' },
                    // bgColor: { rgb: '5470C6' },
                    fgColor: { rgb: 'cfdbff' },
                    bgColor: { rgb: 'cfdbff' },
                    // fgColor: { rgb: 'b2b2b2' },
                    // bgColor: { rgb: 'b2b2b2' },
                };
            }
        }
        const wscols = Array(headerCount).fill({ wch: 15 });
        ws['!cols'] = wscols;
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, excelFileName + new Date().getTime() + EXCEL_EXTENSION);
        this.globalServ.showSuccessPopUp('Excel', 'success', excelFileName);
    }

    public exportAsExcelFileNoColor(json: any[], excelFileName: string): void {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const range = XLSX.utils.decode_range(ws['!ref']);
        // const noRows = range.e.r; // No.of rows
        const noCols = range.e.c + 1; // No. of cols
        const headerCount = noCols;
        // const whiteBgStyle = { fill: { fgColor: { rgb: 'FFFFFF' } } };

        for (const i in ws) {
            if (typeof ws[i] != 'object') continue;
            const cell = XLSX.utils.decode_cell(i);
            ws[i].s = {
                // styling for all cells
                font: {
                    name: 'Calibri',
                },
                alignment: {
                    vertical: 'left',
                    horizontal: 'left',
                    wrapText: '0',
                },
                border: {
                    right: {
                        style: 'thin',
                        color: '28ba62',
                    },
                    left: {
                        style: 'thin',
                        color: 'cc7b4a',
                    },
                },
            };

            if (cell.c > 1) {
                ws[i].s.alignment.vertical = 'left',
                    ws[i].s.alignment.horizontal = 'left'
            }
            if (cell.r == 0) {
                // first row
                ws[i].s = {
                    border: {
                        bottom: {
                            // bottom border
                            style: 'thin',
                            color: '000000',
                        },
                        right: {
                            style: 'thin',
                            color: '000000',
                        },

                    },
                    alignment: {
                        vertical: 'center',
                        horizontal: 'center',
                        wrapText: '0', // any truthy value here
                    },
                    font: {
                        bold: true,
                        // color: { rgb: "ed576b" },
                    },
                }
            }
        }
        const wscols = Array(headerCount).fill({ wch: 25 });
        ws['!cols'] = wscols;
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, excelFileName + new Date().getTime() + EXCEL_EXTENSION);
        this.globalServ.showSuccessPopUp('Excel', 'success', excelFileName);
    }

    getDatesByMonth(startDateStr: string, endDateStr: string): string[] {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        // Ensure endDate is inclusive
        endDate.setDate(endDate.getDate() + 1);

        const dates: string[] = [];
        let currentDate = startDate;

        // Array of day names
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        while (currentDate < endDate) {
            // Get the day name
            const dayName = dayNames[currentDate.getDay()];

            // Format the date as YYYY-MM-DD and include the day name
            const formattedDate = `${currentDate.toISOString().substring(0, 10)} (${dayName})`;

            dates.push(formattedDate);

            // Move to the next date
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }
}