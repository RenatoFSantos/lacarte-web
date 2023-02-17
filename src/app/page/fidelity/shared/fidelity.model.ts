import { BaseModel } from "src/app/shared/model/base.model";
import { PromotionModel } from "../../promotion/shared/promotion.model";
import { UserModel } from "../../user/shared/user.model";

export class FidelityModel extends BaseModel {

  fideQnVoucher: number;
  fideInValidate: boolean;
  user: UserModel;
  promotion: PromotionModel;

  constructor() {
    super();
    this.user = new UserModel();
    this.promotion = new PromotionModel();
  }

}
