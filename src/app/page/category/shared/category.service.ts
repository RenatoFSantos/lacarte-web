import { Injectable } from '@angular/core';
import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { BaseService } from 'src/app/shared/service/base.service';
import { HttpService } from 'src/app/shared/service/http.service';
import { environment } from 'src/environments/environment';
import { CategoryModel } from './category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseService<CategoryModel> {

  constructor(public httpService: HttpService) {
    super('categories', httpService);
  }

  async save(category: CategoryModel): Promise<iResultHttp> {
    const url = `${environment.apiPath}/categories`;
    try {
      if(!category.uid) {
        delete category.uid;
      }
      return await this.httpService.post(url, category);
    } catch (error) {
      return {success: false, data: undefined, error}
    }
  }
}
