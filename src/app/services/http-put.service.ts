import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpPutService {
  constructor(private http: HttpClient) {}

  doPut(controller: string, reqBody: any): any {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    headers = headers.append('Content-Type', 'application/json');

    return this.http.put(environment.root_url + `api/${controller}`, reqBody, {
      headers,
    });
  }
  userRole(obj): any {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    headers = headers.append('Content-Type', 'application/json');

    return this.http.put(environment.root_url + 'api/userRole', obj, {
      headers,
    });
  }
  nonTokenApi(master, data) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    return this.http.put(environment.root_url + 'initial/' + master, data, {
      headers,
    });
  }

}
