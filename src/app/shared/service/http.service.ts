import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { iResultHttp } from '../interface/iResultHttp';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService
  ) {

  }

  private createHeader(header?: HttpHeaders): HttpHeaders {
    if (!header) {
      header = new HttpHeaders();
    }

    header = header?.append('Content-Type', 'application/json');
    header = header?.append('Accept', 'application/json');

    const token = localStorage.getItem('lacarte:token');
    if (token) {
      header = header?.append('x-token-access', token);

    }
    return header;
  }

  public get(url: string): Promise<iResultHttp> {
    const header = this.createHeader();
    return new Promise(async (resolve) => {
      try {
        this.spinner.show();
        const res = await this.http.get(url, { headers: header }).toPromise();
        this.spinner.hide();
        resolve({ success: true, data: res, error: undefined });
      } catch (error: any) {
        this.spinner.hide();
        resolve({ success: false, data: undefined, error });
      }
    })
  }

  public post(url: string, model: any): Promise<iResultHttp> {
    const header: any = this.createHeader();
    // const modelPesquisa: any = {
    //   userDsEmail: model.email,
    //   userCdPassword: model.password
    // }
    return new Promise(async (resolve) => {
      try {
        this.spinner.show();
        const res = await this.http.post(url, model, { headers: header }).toPromise();
        this.spinner.hide();
        resolve({ success: true, data: res, error: undefined });
      } catch (error: any) {
        this.spinner.hide();
        if (error.status === 400) {
          let errorsText = '<ul>'
          if (Array.isArray(error.error)) {
            error.error.forEach((element: { message: any; }) => {
              errorsText += `<li style="text-align: left">${element.message || element}</li>`;
            });
            errorsText += '</ul>'
            Swal.fire('Atenção', errorsText, 'warning');
          }
        }
        resolve({ success: false, data: undefined, error });
      }
    });
  }

  public delete(url: string): Promise<iResultHttp> {
    const header: any = this.createHeader();
    return new Promise(async (resolve) => {
      try {
        this.spinner.show();
        const res = await this.http.delete(url, { headers: header }).toPromise();
        this.spinner.hide();
        resolve({ success: true, data: res, error: undefined });
      } catch (error: any) {
        this.spinner.hide();
        if (error.status === 400) {
          resolve({ success: false, data: undefined, error });
        }
      }
    });
  }

}
