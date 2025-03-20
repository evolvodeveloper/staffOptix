import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpPostService {
  constructor(private http: HttpClient) {}
  customValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value as string;
      const isValid = /^(?!\s*$)[a-zA-Z0-9_()\s-]*$/.test(value);

      //  /^[a-zA-Z0-9_()\s-]*$/.test(value);
      return isValid ? null : { invalidFormat: { value: control.value } };
    };
  }
  getHeaders() {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    headers = headers.append('Content-Type', 'application/json');
    return headers;
  }
  register(data) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    return this.http.post(
      environment.root_url + 'initial/atlasregister',
      data,
      { headers }
    );
  }

  shiftAssignment(obj) {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    headers = headers.append('Content-Type', 'application/json');

    return this.http.post(environment.root_url + `api/shiftassignment`, obj, {
      headers: headers,
    });
  }
  forgot(master, data) {
    let headers = new HttpHeaders();
    // headers = headers.append("Authorization", "Bearer " + localStorage.getItem('token'));
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(
      environment.root_url + `initial/${master}`,
      data,
      {
        headers,
      }
    );
  }
  saveShift(obj) {
    return this.http.post(environment.root_url + `api/saveshift`, obj, {
      headers: this.getHeaders(),
    });
  }

  // getPdf(master, data) {
  //   const httpOptions = {
  //     responseType: 'blob' as 'json',
  //     headers: new HttpHeaders({
  //       Authorization: `Bearer ${localStorage.getItem('token')}`,
  //       'Content-Type': 'application/json',
  //     }),
  //   };

  //   return this.http.post(
  //     environment.root_url + `api/${master}`,
  //     data,
  //     httpOptions
  //   );
  // }

  create(master, data) {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(environment.root_url + `api/${master}`, data, {
      headers,
    });
  }
  multiPartFileUpload(master, data) {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    return this.http.post(environment.root_url + `api/${master}`, data, {
      headers,
    });
  }



  nonTokenApi(master, data) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    return this.http.post(environment.root_url + 'initial/' + master, data, {
      headers,
    });
  }



}
