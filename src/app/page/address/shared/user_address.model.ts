import { BaseModel } from "src/app/shared/model/base.model"
import { UserModel } from "../../user/shared/user.model";
import { AddressModel } from "./address.model";

export class UserAddressModel extends BaseModel {

  user: UserModel;
  address: AddressModel;
  usadInDefault: boolean;

  constructor() {
    super();
    this.user = new UserModel();
    this.address = new AddressModel();
  }
}
