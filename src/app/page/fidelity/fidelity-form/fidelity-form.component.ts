import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';
import { FidelityModel } from '../shared/fidelity.model';
import { FidelityService } from '../shared/fidelity.service';
import { PromotionModel } from '../../promotion/shared/promotion.model';

@Component({
  selector: 'app-fidelity-form',
  templateUrl: './fidelity-form.component.html',
  styleUrls: ['./fidelity-form.component.scss']
})
export class FidelityFormComponent implements OnInit {

  formResource: FormGroup;
  fidelity: FidelityModel = new FidelityModel();
  user: UserModel = new UserModel();
  promotion: PromotionModel = new PromotionModel();
  userLogged: UserModel = new UserModel();
  pageTitle = '';
  url = '';
  listFidelity: Array<FidelityModel> = new Array<FidelityModel>();

  constructor(
    private fidelityService: FidelityService,
    private userService: UserService,
    private fb: FormBuilder,
    private matSnack: MatSnackBar,
    private router: Router,
    private active: ActivatedRoute
  ) {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  ngOnInit(): void {
    this.url=this.router.url;

    this.active.params.subscribe(async p => {
      await this.getId(p['id']);
      await this.createForm();
      await this.bind();
    })
  }

  async getId(uid: string): Promise<void> {
    if (this.url.indexOf('new')>=0) {
      this.pageTitle = 'Nova Fidelização';
      this.fidelity = new FidelityModel();
    } else {
      const result = await this.fidelityService.getById(uid);
      this.fidelity = result.data as FidelityModel;
      this.pageTitle = `Promoção: ${this.fidelity.promotion.promNmPromotion}`;
    }
  }

  async bind() {
    Object.assign(this.promotion, this.fidelity.promotion);
    Object.assign(this.user, this.fidelity.user);
    await this.loadingForm();
  }

  private createForm() {
    this.formResource = this.fb.group({
      uid: ['', null],
      promNmPromotion: ['', [Validators.required]],
      fideQnVoucher: ['', [Validators.required]],
      fideInValidate: [true, null],
      userUid: ['', null],
      userNmName: [this.userLogged, [Validators.required]]
    });
  }

  async save(): Promise<void> {
    try {
      delete this.fidelity.user.created;
      delete this.fidelity.user.updated;
      delete this.fidelity.promotion.created;
      delete this.fidelity.promotion.updated;
      const result = await this.fidelityService.save(this.fidelity);
      if(result.success) {
        this.matSnack.open('Registro salvo com sucesso!', undefined, {duration: 3000});
        this.router.navigateByUrl(`/companies/${this.promotion.company.uid}/promotion/${this.promotion.uid}/fidelity`);
      }
    } catch (error) {
      this.matSnack.open('Problemas na gravação do registro!', undefined, { duration: 3000 });
    }
  }

  onFormSubmit() {
    this.fidelity.fideQnVoucher = this.formResource.get('fideQnVoucher')?.value;
    this.fidelity.fideInValidate = this.formResource.get('fideInValidate')?.value;
    this.fidelity.promotion = this.promotion;
    this.fidelity.user = this.user;
    this.save();
  }

  loadingForm() {
    this.formResource.get('promNmPromotion')?.setValue(this.fidelity.promotion.promNmPromotion);
    this.formResource.get('fideQnVoucher')?.setValue(this.fidelity.fideQnVoucher);
    this.formResource.get('fideInValidate')?.setValue(this.fidelity.fideInValidate);
    this.formResource.get('userUid')?.setValue(this.fidelity.user.uid);
    this.formResource.get('userNmName')?.setValue(this.fidelity.user.userNmName);
  }


}
