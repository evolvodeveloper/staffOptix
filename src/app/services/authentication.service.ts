import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  login(data) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(
      environment.root_url + 'authenticate',
      JSON.stringify(data),
      { headers }
    );
  }

  getIPAdress() {
    return this.http.get('https://api.ipify.org/?format=json');
  }
}
