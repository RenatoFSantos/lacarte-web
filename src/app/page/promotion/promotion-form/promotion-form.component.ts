import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FileManager } from 'src/app/shared/component/input-file/input-file.component';
import { environment } from 'src/environments/environment';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';
import { CompanyModel } from '../../company/shared/company.model';
import { CompanyService } from '../../company/shared/company.service';
import { PromotionModel } from '../shared/promotion.model';
import { PromotionService } from '../shared/promotion.service';
import { iStatus } from 'src/app/shared/interface/iStatus';
import { calcDurationDays } from 'src/app/shared/helper/utils';

@Component({
  selector: 'app-promotion-form',
  templateUrl: './promotion-form.component.html',
  styleUrls: ['./promotion-form.component.scss']
})
export class PromotionFormComponent implements OnInit {

  listStatus: iStatus[] = [
    {value: 'A', viewValue: 'Ativo' },
    {value: 'C', viewValue: 'Concluído' },
    {value: 'P', viewValue: 'Pendente' },
  ]

  formResource: FormGroup;
  promotion: PromotionModel = new PromotionModel();
  company: CompanyModel = new CompanyModel();
  userLogged: UserModel = new UserModel();
  selected = '';
  pageTitle = '';
  url = '';
  listPromotions: Array<PromotionModel> = new Array<PromotionModel>();

  image = 'qrcode_default.jpg';
  @ViewChild('appInput') appInput: ElementRef;

  constructor(
    private promotionService: PromotionService,
    private userService: UserService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private matSnack: MatSnackBar,
    private router: Router,
    private active: ActivatedRoute
  ) { }

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
      this.pageTitle = 'Nova Promoção';
      try {
        const result = await this.companyService.getById(uid);
        if(result.success) {
          this.company = result.data as CompanyModel;
        }
      } catch (error) {
        this.matSnack.open('Problemas para localizar o estabelecimento. Verifique!', '', { duration: 3000 })
      }
    } else {
      const result = await this.promotionService.getById(uid);
      this.promotion = result.data as PromotionModel;
      this.company = this.promotion.company;
      this.pageTitle = `Promoção: ${this.promotion.promNmPromotion}`;
    }
  }

  async bind() {
    Object.assign(this.company, this.promotion.company);
    await this.loadingForm();
    await this.getUserLogged();
    await this.loadingImage();
  }

  getUserLogged(): void {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  loadingImage() {
    if (this.promotion.promCdQrcode && this.promotion.promCdQrcode !== null) {
      this.image = `${environment.apiPath}/storage/${this.promotion.promCdQrcode}`;
    } else {
      this.image = `${environment.apiPath}/storage/qrcode_default.jpg`;
    }
  }

  private createForm() {
    this.formResource = this.fb.group({
      uid: ['', null],
      promNmPromotion: ['', [Validators.required]],
      promDsPromotion: ['', null],
      promCdQrcode: ['qrcode_default.jpg', null],
      promDtStart: [new Date(), [Validators.required]],
      promDtFinish: ['', [Validators.required]],
      promCdStatus: ['', [Validators.required]],
    }, {
      validators: [
        this.diffDates('promDtStart', 'promDtFinish')
      ]
    })
  }

  private diffDates(startName: string, finishName: string): ValidationErrors | null {
    return (formGroup: FormGroup) => {
      const controlStart = formGroup.controls[startName];
      const controlFinish = formGroup.controls[finishName];

      if ((controlStart.errors && !controlStart.errors['diffDate']) && (controlFinish.errors && !controlFinish.errors['diffDate'])) {
        return;
      }

      if(calcDurationDays(new Date(controlStart.value), new Date(controlFinish.value)) < 0 ) {
        controlFinish.setErrors(null);
      } else {
        controlFinish.setErrors({'diffDate': true})
      }
    }
  }

  async save(): Promise<void> {
    try {
      delete this.promotion.company.created;
      delete this.promotion.company.updated;
      console.log('Valor do QrCode=', this.formResource.get('promCdQrcode')?.value);
      const result = await this.promotionService.save(this.promotion);
      if(result.success) {
        this.matSnack.open('Registro salvo com sucesso!', undefined, {duration: 3000});
        this.router.navigateByUrl(`/companies/${this.company.uid}/promotion`);
      }
    } catch (error) {
      this.matSnack.open('Problemas na gravação do registro!', undefined, { duration: 3000 });
    }
  }

  selectedFile(file: FileManager): void {
    if (file.base64Data) {
      this.promotion.promCdQrcode = file.base64Data;
      this.formResource.get('promCdQrcode')?.setValue(this.promotion.promCdQrcode);
      this.image = file.base64Data;
    }
  }

  onFormSubmit() {
    this.promotion.promNmPromotion = this.formResource.get('promNmPromotion')?.value;
    this.promotion.promDsPromotion = this.formResource.get('promDsPromotion')?.value;
    this.promotion.promCdQrcode = this.formResource.get('promCdQrcode')?.value;
    this.promotion.promDtStart = this.formResource.get('promDtStart')?.value;
    this.promotion.promDtFinish = this.formResource.get('promDtFinish')?.value;
    this.promotion.promCdStatus = this.formResource.get('promCdStatus')?.value;
    this.promotion.company = this.company;
    this.save();
  }

  loadingForm() {
    this.formResource.get('promNmPromotion')?.setValue(this.promotion.promNmPromotion);
    this.formResource.get('promDsPromotion')?.setValue(this.promotion.promDsPromotion);
    this.formResource.get('promCdQrcode')?.setValue(this.image);
    this.formResource.get('promDtStart')?.setValue(this.promotion.promDtStart);
    this.formResource.get('promDtFinish')?.setValue(this.promotion.promDtFinish);
    this.formResource.get('promCdStatus')?.setValue(this.promotion.promCdStatus);
    this.formResource.get('company')?.setValue(this.promotion.company.uid);
  }

}
