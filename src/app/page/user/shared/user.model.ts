import { BaseModel } from "src/app/shared/model/base.model";

export class UserModel extends BaseModel {
  userSgUser: string;
  userNmName: string;
  userNmLastname: string;
  userDtBirthdate: Date;
  userDsEmail: string;
  userDsPhone: string;
  userDsSmartphone: string;
  userDsWhatsapp: string;
  userCdPassword: string;
  userCdType: string;
  userTxAvatar: string;
  userVlCashback: string;
  userVlScore: string;
  userVlRating: string;

  constructor() {
    super();
  }

  public isUserLogged(): boolean {
    return localStorage.getItem('user') != null;
  }
}
