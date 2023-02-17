import { Injectable } from '@angular/core';
import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { BaseService } from 'src/app/shared/service/base.service';
import { HttpService } from 'src/app/shared/service/http.service';
import { environment } from 'src/environments/environment';
import { ProductModel } from './product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService<ProductModel> {

  constructor(
    public httpService: HttpService
  ) {
    super('products', httpService)
  }

  async save(product: ProductModel): Promise<iResultHttp> {
    const url = `${environment.apiPath}/products`;
    try {
      if(!product.uid) {
        delete product.uid;
      }
      return await this.httpService.post(url, product);
    } catch (error) {
      return {success: false, data: undefined, error}
    }
  }

  async getProductByName(search: string): Promise<iResultHttp> {
    const url = `${environment.apiPath}/products/name/${search}`;
    try {
      return await this.httpService.get(url);
    } catch (error) {
      return {success: false, data: undefined, error};
    }
  }
}
