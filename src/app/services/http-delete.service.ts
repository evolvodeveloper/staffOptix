import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class httpDeleteService {
    constructor(private http: HttpClient) { }

    delete(controller: string): any {
        let headers = new HttpHeaders();
        headers = headers.append(
            'Authorization',
            'Bearer ' + localStorage.getItem('token')
        );
        headers = headers.append('Content-Type', 'application/json');

        return this.http.delete(environment.root_url + `api/${controller}`, {
            headers,
        });
    }
}