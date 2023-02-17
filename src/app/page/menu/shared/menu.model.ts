import { BaseModel } from "src/app/shared/model/base.model";
import { CompanyModel } from "../../company/shared/company.model";
import { ProductModel } from "../../product/shared/product.model";

export class MenuModel extends BaseModel {

  menuCdMenu: string;
  menuVlPrice: number;
  menuPrDiscount: number;
  menuPrDelivery: number;
  menuTxImage: string;
  menuPrCashback: number;
  menuDsDescriptor: string;
  menuVlRating: number;
  company: CompanyModel;
  product: ProductModel;

  constructor() {
    super()
    this.company = new CompanyModel();
    this.product = new ProductModel();
  }
}
