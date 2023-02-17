import { HttpService } from 'src/app/shared/service/http.service';
import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/shared/service/base.service';
import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { environment } from 'src/environments/environment';
import { PromotionModel } from './promotion.model';

@Injectable({
  providedIn: 'root',
})
export class PromotionService extends BaseService<PromotionModel> {
  constructor(public httpService: HttpService) {
    super('promotions', httpService);
  }

  async save(promotion: PromotionModel): Promise<iResultHttp> {
    const url = `${environment.apiPath}/promotions`;
    try {
      if (!promotion.uid) {
        delete promotion.uid;
      }
      return await this.httpService.post(url, promotion);
    } catch (error) {
      return { success: false, data: undefined, error };
    }
  }

  async getPromotionsByCompany(uidCompany: string): Promise<iResultHttp> {
    const url = `${environment.apiPath}/promotions/company/${uidCompany}`;
    try {
      return await this.httpService.get(url);
    } catch (error) {
      return { success: false, data: undefined, error };
    }
  }
}
