import { BaseModel } from "src/app/shared/model/base.model";
import { AddressModel } from "../../address/shared/address.model";
import { SegmentModel } from "../../segment/shared/segment.model";
import { UserModel } from "../../user/shared/user.model";

export class CompanyModel extends BaseModel {

  compNmCompany: string;
  compNmTrademark: string;
  compDsCompany: string;
  compCdCNPJ: string;
  compDsPhone: string;
  compDsSmartphone: string;
  compDsWhatsapp: string;
  compDsEmail: string;
  compDsSite: string;
  compCdPix: string;
  compTxImage: string;
  compInDelivery: boolean;
  compCdDelivery: string;
  compVlDelivery: number;
  compDsTags: string;
  compVlRating: number;
  compDsLogo: string;
  segment: SegmentModel;
  address: AddressModel;
  user: UserModel;


  constructor() {
    super();
    this.segment = new SegmentModel();
    this.address = new AddressModel();
    this.user = new UserModel();
  }
}
