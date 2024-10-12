import { Injectable, Inject } from '@angular/core';
import { ReplaySubject, Observable, forkJoin } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })

@Injectable({
  providedIn: 'root'
})
export class RazorPayService {

  private _loadedLibraries: { [url: string]: ReplaySubject<any> } = {};


  constructor(@Inject(DOCUMENT) private readonly document: any) { }


  lazyLoadLibrary(resourceURL): Observable<any> {
    return forkJoin([
      this.loadScript(resourceURL)
    ]);
  }


  private loadScript(url: string): Observable<any> {
    if (this._loadedLibraries[url]) {
      return this._loadedLibraries[url].asObservable();
    }

    this._loadedLibraries[url] = new ReplaySubject();

    const script = this.document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    script.onload = () => {
      this._loadedLibraries[url].next('loaded');
      this._loadedLibraries[url].complete();
    };

    this.document.body.appendChild(script);
    return this._loadedLibraries[url].asObservable();
  }

}
