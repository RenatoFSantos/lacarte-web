import { environment } from './../../../../environments/environment';
import { AddressModel } from './../shared/address.model';
import { AddressService } from './../shared/address.service';
import { UserService } from './../../user/shared/user.service';
import { UserModel } from './../../user/shared/user.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserAddressModel } from '../shared/user_address.model';
import { MatSelectionList } from '@angular/material/list';
import { AddressType } from 'src/app/shared/model/enum/AddressType';
import { State } from 'src/app/shared/model/enum/State';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Constants } from 'src/app/shared/config/constants';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss']
})
export class AddressListComponent implements OnInit {

  pageTitle = "Lista de Endereços"
  user: UserModel = new UserModel();
  listAddress: Array<UserAddressModel>;
  @ViewChild(MatSelectionList, { static: true }) address: MatSelectionList;
  @ViewChild('form') form: any;

  formAddress: FormGroup;
  selectTypeAddress = 'R';
  typesAddress = AddressType;
  states = State;
  keys = Object.keys;
  userAddress: UserAddressModel = new UserAddressModel();
  addressSel: UserAddressModel;
  addressDefault: UserAddressModel;
  title = '';
  subMain: Subscription;
  avatar = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private addressService: AddressService,
    private matSnack: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(p => this.getUser(p['id']));
    // **** Initialize Default Address Class
    this.addressDefault = new UserAddressModel();
    this.createForm();
  }

  createForm() {
    this.formAddress = this.fb.group({
      addrNmAddress: [null, Validators.required],
      addrCdType: [this.selectTypeAddress],
      addrDsAddress: [null, Validators.required],
      addrDsNumber: [null, Validators.required],
      addrDsComplement: [null],
      addrNmDistrict: [null],
      addrNmCity: [null, Validators.required],
      addrSgState: [null],
      addrCdZipcode: [null, Validators.required],
      usadInDefault: [false]
    });
  }

  async getUser(uid: string) {
    const result = await this.userService.getById(uid);
    if (result.success) {
      this.user = result.data as UserModel;
      if (this.user.userTxAvatar) {
        this.avatar = `${environment.apiPath}/storage/${this.user.userTxAvatar}`;
      } else {
        this.avatar = `${environment.apiPath}/storage/photo_default.jpg`;
      }
    }
    this.bind();
  }

  async bind() {
    const address = await this.addressService.getAddressByUser(this.user.uid!);
    let inAddress = '';
    this.listAddress = new Array<UserAddressModel>();
    if (address.data?.address) {
      for (const element of address.data.address) {
        const userAddress: UserAddressModel = new UserAddressModel();
        const objAddress: AddressModel = new AddressModel();
        objAddress.uid = element.address.uid;
        objAddress.addrNmAddress = element.address.addrNmAddress;
        objAddress.addrDsAddress = element.address.addrDsAddress;
        objAddress.addrDsNumber = element.address.addrDsNumber;
        objAddress.addrDsComplement = element.address.addrDsComplement;
        objAddress.addrNmDistrict = element.address.addrNmDistrict;
        objAddress.addrNmCity = element.address.addrNmCity;
        objAddress.addrSgState = element.address.addrSgState;
        objAddress.addrCdZipcode = element.address.addrCdZipcode;
        objAddress.addrCdType = element.address.addrCdType;
        userAddress.uid = element.uid;
        userAddress.user = this.user;
        userAddress.address = objAddress;
        userAddress.usadInDefault = element.usadInDefault;

        if (element.usadInDefault && this.addressDefault.uid === null) {
          Object.assign(this.addressDefault, userAddress);
          inAddress = element.address.uid;
        }
        this.listAddress.push(userAddress);
      }
    }
    await this.getAddress('new');
  }

  async delete(model: any): Promise<void> {
    const options: any = {
      ...Constants.delete_swal_options, text: `Deseja realmente excluir o endereço ${model.address?.addrNmAddress}`
    };
    const { value } = await Swal.fire(options);
    if (value) {
      const result = await this.addressService.deleteUserAddress(model);
      if (result.success) {
        this.bind();
      }
    }
  }

  async getAddress(addrUid: string): Promise<void> {
    this.addressSel = new UserAddressModel();
    if (addrUid === 'new' || addrUid === undefined) {
      this.title = 'Novo Endereço';
      this.formAddress.reset();
    } else {
      // Endereço
      this.listAddress.map(e => {
        if (e.address.uid === addrUid) {
          // this.formAddress.get('uid')!.setValue(e.address.uid);
          this.formAddress.get('addrNmAddress')!.setValue(e.address.addrNmAddress);
          this.formAddress.get('addrCdType')!.setValue(e.address.addrCdType);
          this.formAddress.get('addrDsAddress')!.setValue(e.address.addrDsAddress);
          this.formAddress.get('addrDsNumber')!.setValue(e.address.addrDsNumber);
          this.formAddress.get('addrDsComplement')!.setValue(e.address.addrDsComplement);
          this.formAddress.get('addrNmDistrict')!.setValue(e.address.addrNmDistrict);
          this.formAddress.get('addrNmCity')!.setValue(e.address.addrNmCity);
          this.formAddress.get('addrSgState')!.setValue(e.address.addrSgState);
          this.formAddress.get('addrCdZipcode')!.setValue(e.address.addrCdZipcode);
          this.formAddress.get('usadInDefault')!.setValue(e.usadInDefault);

          // ****** Copy the selected object
          Object.assign(this.addressSel, e);
        }
      });
    }
  }

  async onFormSubmit() {
    // --- ADDRESS
    this.addressSel.address.addrCdType = this.formAddress.value.addrCdType;
    this.addressSel.address.addrNmAddress = this.formAddress.value.addrNmAddress;
    this.addressSel.address.addrDsAddress = this.formAddress.value.addrDsAddress;
    this.addressSel.address.addrDsNumber = this.formAddress.value.addrDsNumber;
    this.addressSel.address.addrDsComplement = this.formAddress.value.addrDsComplement;
    this.addressSel.address.addrNmDistrict = this.formAddress.value.addrNmDistrict;
    this.addressSel.address.addrNmCity = this.formAddress.value.addrNmCity;
    this.addressSel.address.addrSgState = this.formAddress.value.addrSgState;
    this.addressSel.address.addrCdZipcode = this.formAddress.value.addrCdZipcode;
    if(this.addressSel.user.uid === null || this.addressSel.user.uid === undefined) {
      this.addressSel.user = this.user
    }
    this.addressSel.usadInDefault = this.formAddress.value.usadInDefault === null ? false : this.formAddress.value.usadInDefault;

    // --- Salvando dados
    await this.save();
    // --- List update
    await this.bind();
    // --- Reset Form
    this.form.resetForm();

  }

  async save(): Promise<void> {
    try {
      const result = await this.addressService.save(this.addressSel);
      if (result.success) {
        this.matSnack.open('Endereço salvo com sucesso!', undefined, { duration: 3000 });
        this.bind();
      }
    } catch (error) {
      this.matSnack.open('Problemas na gravação do registro!', undefined, { duration: 3000 });
    }
  }
}
