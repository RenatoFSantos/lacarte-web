import { Injectable } from '@angular/core';
import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { BaseService } from 'src/app/shared/service/base.service';
import { HttpService } from 'src/app/shared/service/http.service';
import { environment } from 'src/environments/environment';
import { AddressModel } from './address.model';
import { UserAddressModel } from './user_address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService extends BaseService<AddressModel> {

  constructor(public httpService: HttpService) {
    super('address', httpService)
  }

  async save(userAddress: UserAddressModel): Promise<iResultHttp> {
    const urlAddress = `${environment.apiPath}/address`;
    const urlUserAddress = `${environment.apiPath}/usersaddress`;
    return new Promise(async (resolve) => {
      try {
        if(!userAddress.uid) {
          delete userAddress.uid;
        }
        const resultAddress = await this.httpService.post(urlAddress, userAddress.address);
        if(resultAddress.success) {
          userAddress.address = resultAddress.data as AddressModel;
          await resolve(await this.httpService.post(urlUserAddress, userAddress));
        }
        // -- Save the UserAddress
      } catch (error) {
          await resolve({success: false, data: {}, error});
      }
    });
  }

  async getAddressByUser(uidUser: string): Promise<iResultHttp> {
    const url = `${environment.apiPath}/usersaddress/users/${uidUser}`;
    return new Promise(async (resolve) => {
      try {
        const result = await this.httpService.get(url)
        resolve({success: true, data: result.data, error: undefined});
      } catch (error) {
        resolve({success: false, data: {}, error});
      }
    })
  }


  async deleteUserAddress(userAddress: any): Promise<iResultHttp> {
    const urlAddress = `${environment.apiPath}/address/${userAddress.address.uid}`;
    const urlUserAddress = `${environment.apiPath}/usersaddress/${userAddress.uid}`;
    return new Promise(async (resolve) => {
      try {
        this.http.delete(urlUserAddress)
          .then(async (result) => {
            if (result.success) {
              const resAddress = await this.http.delete(urlAddress);
              resolve({ success: true, data: resAddress.data, error: undefined });
            }
          })
          .catch(error => {
            resolve({ success: false, data: {}, error });
          });
      } catch (error) {
        resolve({ success: false, data: {}, error });
      }
    });
  }

}
