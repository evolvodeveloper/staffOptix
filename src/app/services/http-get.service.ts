import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root',
})
export class HttpGetService {
  constructor(private http: HttpClient,
    private utilServ: UtilService) { }

  getHeaders() {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    return headers;
  }
  nonTokenApi(master) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.get(environment.root_url + 'initial/' + master, {
      headers,
    });
  }
  generalApiRequestFromDynamicForm(master) {
    return this.http.get(environment.root_url + master, {
      headers: this.getHeaders(),
    });
  }
  getExcel(master): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    };
    return this.http.get(environment.root_url + `api/${master}`, httpOptions);
  }

  getPdf(master): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }),
    };

    return this.http.get(
      environment.root_url + `api/${master}`,
      httpOptions
    );
  }


  getMasterList(master) {
    return this.http.get(environment.root_url + `api/${master}`, { headers: this.getHeaders() });
  }

  getMas(master) {
    return this.http.get(`https://at-api.springlogix.com/api/${master}`, { headers: this.getHeaders() });
  }
  getjson() {
    return this.http.get(`assets/data.json`);
  }
  getMenuAccess() {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    return this.http.get(
      environment.root_url + `api/menuaccess/app?app=portal&module=atlas`,
      { headers }
    );
  }

  getMenuSort() {
    return this.http.get(environment.root_url + `api/menusort`, {
      headers: this.getHeaders(),
    });
  }


  getEmployeesByDepartment(department) {
    return this.http.get(
      environment.root_url + `api/empbydepart?department=${department}`,
      { headers: this.getHeaders() }
    );
  }


  getEmployeeDetails(code) {
    return this.http.get(environment.root_url + `api/empdetails?empCode=${code}`, {
      headers: this.getHeaders(),
    });
  }

  getEmployeeAttendance(year, month, department, projectCode) {
    return this.http.get(
      environment.root_url +
      `api/attendance/employee?month=${month}&year=${year}&department=${department}&project=${projectCode}`,
      { headers: this.getHeaders() }
    );
  }


  getCalenderCodes() {
    return this.http.get(environment.root_url + `api/calendars`, {
      headers: this.getHeaders(),
    });
  }
  timeZone() {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    return this.http.get(
      environment.root_url + 'initial/calendar/timezone',
      {
        headers,
      }
    );
  }
}
