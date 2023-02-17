import { HttpService } from './../../../shared/service/http.service';
import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/shared/service/base.service';
import { CompanyModel } from './company.model';
import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CompanyService extends BaseService<CompanyModel> {

  constructor(
    public httpService: HttpService,
    ) {
    super('companies', httpService)
  }

  save(company: CompanyModel): Promise<iResultHttp> {
    const urlAddress = `${environment.apiPath}/address`;
    const urlCompany = `${environment.apiPath}/companies`;
    return new Promise(async (resolve) => {
      try {
        if (company.address.uid === null || company.address.uid === undefined) {
          delete company.address.uid;
        }
        this.http.post(urlAddress, company.address)
          .then(async (result) => {
            if (result.success) {
              company.address = result.data;
              if (company.uid === null || company.uid === undefined) {
                delete company.uid;
              }
              const resCompany = await this.http.post(urlCompany, company);
              resolve({ success: true, data: resCompany.data, error: undefined });
            }
          })
          .catch(error => {
            resolve({ success: false, data: {}, error });
          });
      } catch (error) {
        resolve({ success: false, data: {}, error });
      }
    });
  }

}
