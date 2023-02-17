import { BaseModel } from "src/app/shared/model/base.model";
import { CategoryModel } from "../../category/shared/category.model";

export class ProductModel extends BaseModel {

  prodCdStandard: string;
  prodNmProduct: string;
  prodDsProduct: string;
  prodDsRecipe: string;
  prodTxImage: string;
  prodDsDescriptor: string;
  category: CategoryModel;

  constructor() {
    super();
    this.category = new CategoryModel();
  }
}
