import { Injectable } from '@angular/core';
import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { BaseService } from 'src/app/shared/service/base.service';
import { HttpService } from 'src/app/shared/service/http.service';
import { environment } from 'src/environments/environment';
import { MenuModel } from './menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService extends BaseService<MenuModel> {

  constructor(
    public httpService: HttpService
  ) {
    super('menus', httpService);
  }

  async save(menu: MenuModel): Promise<iResultHttp> {
    const url = `${environment.apiPath}/menus`;
    try {
      if(!menu.uid) {
        delete menu.uid;
      }
      return await this.httpService.post(url, menu);
    } catch (error) {
      return {success: false, data: undefined, error}
    }
  }

  async getMenuByCompany(uidCompany: string): Promise<iResultHttp> {
    const url = `${environment.apiPath}/menus/company/${uidCompany}`;
    try {
      return await this.httpService.get(url);
    } catch (error) {
      return {success: false, data: undefined, error}
    }
  }

}
