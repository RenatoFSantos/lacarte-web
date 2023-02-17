import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/shared/service/base.service';
import { HttpService } from 'src/app/shared/service/http.service';
import { FidelityModel } from './fidelity.model';

@Injectable({
  providedIn: 'root'
})
export class FidelityService extends BaseService<FidelityModel> {

  constructor(public httpService: HttpService) {
    super('fidelities', httpService);
  }

  async getFidelityByPromotion(uid: string): Promise<iResultHttp> {
    const url = `${environment.apiPath}/fidelities/${uid}/promotion`;
    try {
      return await this.httpService.get(url);
    } catch (error) {
      return {success: false, data: undefined, error}
    }
  }

  async save(model: any): Promise<iResultHttp> {
    const url = `${environment.apiPath}/fidelities`;
    try {
      return this.httpService.post(url, model);
    } catch (error) {
      return {success: false, data: undefined, error}
    }
  }

}
