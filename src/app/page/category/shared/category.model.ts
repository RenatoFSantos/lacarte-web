import { BaseModel } from "src/app/shared/model/base.model";

export class CategoryModel extends BaseModel {

  cateNmCategory: string;
  cateTxImage: string;

  constructor() {
    super();
  }
}
