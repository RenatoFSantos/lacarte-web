import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { iStatus } from 'src/app/shared/interface/iStatus';
import { FileManager } from 'src/app/shared/component/input-file/input-file.component';
import { environment } from 'src/environments/environment';
import { UserModel } from '../../user/shared/user.model';
import { CompanyModel } from '../shared/company.model';
import { UserService } from '../../user/shared/user.service';
import { CompanyService } from '../shared/company.service';
import { SegmentModel } from '../../segment/shared/segment.model';
import { State } from 'src/app/shared/model/enum/State';
import { SegmentService } from '../../segment/shared/segment.service';
import { debounceTime, fromEvent, map, Observable, startWith } from 'rxjs';
import { AddressModel } from '../../address/shared/address.model';
import { convertCurrency } from 'src/app/shared/helper/utils';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss']
})
export class CompanyFormComponent implements OnInit, AfterViewInit {

  formResource: FormGroup;
  @ViewChild('searchEmail') searchEmail: ElementRef<HTMLInputElement>;
  filterEmail = '';
  company: CompanyModel = new CompanyModel();
  segment: SegmentModel = new SegmentModel();
  address: AddressModel = new AddressModel();
  user: UserModel = new UserModel();
  userLogged: UserModel = new UserModel();
  selected = '';
  pageTitle = '';
  states = State;
  keys = Object.keys;

  typesAddress: iStatus[] = [
    { value: "R", viewValue: "Residencial" },
    { value: "C", viewValue: "Comercial" },
  ]
  typeSelected = this.typesAddress[0].value;

  taxsDelivery: iStatus[] = [
    { value: "V", viewValue: "Valor Fixo" },
    { value: "P", viewValue: "Percentual" },
  ]
  taxSelected = this.taxsDelivery[0].value;

  logo = 'logo_default.jpg';
  showcase = 'showcase_default.jpg';
  @ViewChild('appInput') appInput: ElementRef;

  // ******* SEGMENT *******
  myControl = new FormControl('');
  options: iStatus[];
  listSegments: Array<SegmentModel> = new Array<SegmentModel>();
  filteredSegments: Observable<Array<SegmentModel>>;

  constructor(
    private userService: UserService,
    private segmentService: SegmentService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private matSnack: MatSnackBar,
    private router: Router,
    private active: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadingResource();
  }

  ngAfterViewInit() {
    fromEvent(this.searchEmail.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
      )
      .subscribe((e: Event) => {
        const target = (e.target as HTMLInputElement).value;
        this.filterEmail = target;
        this.getUserByEmail(this.filterEmail);
      });
  }

  async getUserByEmail(email: string): Promise<void> {
    try {
      const result = await this.userService.getUserByEmail(email);
      if(result.success) {
        this.user = result.data as UserModel;
        this.formResource.get('userUid')?.setValue(this.user.uid);
        this.formResource.get('userNmName')?.setValue(this.user.userNmName);
        this.formResource.get('userDsSmartphone')?.setValue(this.user.userDsSmartphone);
      }
    } catch (error) {
      this.matSnack.open('Não consigo localizar o usuário!', undefined, { duration: 3000 });
    }
  }

  async loadingResource() {
    this.active.params.subscribe(async p => {
      await this.getId(p['id'])
    })
    await this.createForm();
    await this.loadingSegment();
    await this.bind();
    this.filteredSegments = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    )
  }

  private _filter(value: string): Array<SegmentModel> {
    const filterValue = value.toLowerCase();
    return this.listSegments.filter(option => option.segmNmSegment.toLowerCase().includes(filterValue));
  }

  async getId(uid: string): Promise<void> {
    if (uid === 'new' || typeof uid === 'undefined') {
      this.pageTitle = 'Nova Empresa';
      // this.company = new CompanyModel();
      // this.segment = new SegmentModel();
      // this.address = new AddressModel();
    } else {
      const result = await this.companyService.getById(uid);
      this.company = result.data as CompanyModel;
      this.pageTitle = `Empresa: ${this.company.compNmTrademark}`;
    }
  }

  async bind() {
    Object.assign(this.address, this.company.address);
    Object.assign(this.segment, this.company.segment);
    Object.assign(this.user, this.company.user);
    await this.loadingForm();
    await this.getUserLogged();
    await this.loadingLogo();
    await this.loadingShowCase();
  }

  getUserLogged(): void {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  loadingLogo() {
    if (this.company.compDsLogo && this.company.compDsLogo !== null) {
      this.logo = `${environment.apiPath}/storage/${this.company.compDsLogo}`;
    } else {
      this.logo = `${environment.apiPath}/storage/logo_default.jpg`;
    }
  }

  loadingShowCase() {
    if(this.company.compTxImage && this.company.compTxImage !== null) {
      this.showcase = `${environment.apiPath}/storage/${this.company.compTxImage}`;
    } else {
      this.showcase = `${environment.apiPath}/storage/showcase_default.jpg`;
    }
  }

  async loadingSegment(): Promise<void> {
    this.listSegments = new Array<SegmentModel>();
    try {
      let result = await this.segmentService.getAll();
      if(result.success){
        this.listSegments = result.data as Array<SegmentModel>;
        // SORT NAME
        this.listSegments.sort((segmentA: SegmentModel, segmentB: SegmentModel) => {
          let a = segmentA.segmNmSegment.toUpperCase();
          let b = segmentB.segmNmSegment.toUpperCase();
          return a == b ? 0 : a > b ? 1 : -1;
        })
      }
    } catch (error) {
      this.matSnack.open('Não consigo localizar os segmentos de negócio!', undefined, { duration: 3000 });
    }
  }

  private createForm() {
    this.formResource = this.fb.group({
      uid: ['', null],
      compNmCompany: ['', [Validators.required]],
      compNmTrademark: ['', null],
      compDsCompany: ['', null],
      compCdCNPJ: ['', [Validators.required]],
      compDsPhone: ['', null],
      compDsSmartphone: ['', null],
      compDsWhatsapp: ['', null],
      compDsEmail: ['', [Validators.required]],
      compDsSite: ['', null],
      compCdPix: ['', null],
      compTxImage: ['', null],
      compInDelivery: [false, null],
      compCdDelivery: [this.taxSelected],
      compVlDelivery: ['0', null],
      compDsTags: ['', null],
      compVlRating: ['0', null],
      compDsLogo: ['', null],
      segment: [this.selected],
      userUid: ['', Validators.required],
      userDsEmail: ['', [Validators.required, Validators.email]],
      userNmName: ['', Validators.required],
      userDsSmartphone: ['', null],
      aadruid: ['', null],
      addrNmAddress: ['', Validators.required],
      addrCdType: [this.typeSelected],
      addrDsAddress: ['', Validators.required],
      addrDsNumber: ['', null],
      addrDsComplement: [null],
      addrNmDistrict: [null],
      addrNmCity: ['', Validators.required],
      addrSgState: [null],
      addrCdZipcode: ['', Validators.required]
    },
    {
      validators: [
        this.valueDelivery('compCdDelivery', 'compVlDelivery')
      ]
    })
  }

  private valueDelivery(cdDelivery: string, vlDelivery: string): ValidationErrors | null {
    return (formGroup: FormGroup) => {
      const cd = formGroup.controls[cdDelivery];
      const vl = formGroup.controls[vlDelivery];

      if(vl.errors && !vl.errors['maxPercent']) {
        return;
      }

      if(cd.value==='P' && vl.value>99) {
        vl.setErrors({ maxPercent: true });
      } else {
        vl.setErrors(null);
      }
    }
  }

  async save(): Promise<void> {
    try {
      delete this.company.segment.created;
      delete this.company.segment.updated;
      const result = await this.companyService.save(this.company);
      if(result.success) {
        this.matSnack.open('Registro salvo com sucesso!', undefined, {duration: 3000});
        this.router.navigateByUrl('companies');
      }
    } catch (error) {
      this.matSnack.open('Problemas na gravação do registro!', undefined, { duration: 3000 });
    }
  }

  selectedFileLogo(file: FileManager): void {
    if (file.base64Data) {
      this.company.compDsLogo = file.base64Data;
      this.formResource.get('compDsLogo')?.setValue(this.company.compDsLogo);
      this.logo = file.base64Data;
    }
  }

  selectedFileShowCase(file: FileManager): void {
    if (file.base64Data) {
      this.company.compTxImage = file.base64Data;
      this.formResource.get('compTxImage')?.setValue(this.company.compTxImage);
      this.showcase = file.base64Data;
    }
  }

  newCompany() {
    this.formResource.reset();
    this.company = new CompanyModel();
    this.company.compVlRating = 0;
    this.company.compVlDelivery = 0;
    this.company.compInDelivery = false;
    this.loadingLogo();
    this.getId('new');
  }

  onFormSubmit() {
    this.company.compNmCompany = this.formResource.get('compNmCompany')?.value;
    this.company.compNmTrademark = this.formResource.get('compNmTrademark')?.value;
    this.company.compDsCompany = this.formResource.get('compDsCompany')?.value;
    this.company.compCdCNPJ = this.formResource.get('compCdCNPJ')?.value;
    this.company.compDsPhone = this.formResource.get('compDsPhone')?.value;
    this.company.compDsSmartphone = this.formResource.get('compDsSmartphone')?.value;
    this.company.compDsWhatsapp = this.formResource.get('compDsWhatsapp')?.value;
    this.company.compDsEmail = this.formResource.get('compDsEmail')?.value;
    this.company.compDsSite = this.formResource.get('compDsSite')?.value;
    this.company.compCdPix = this.formResource.get('compCdPix')?.value;
    this.company.compTxImage = this.formResource.get('compTxImage')?.value;
    this.company.compInDelivery = this.formResource.get('compInDelivery')?.value || false;
    this.company.compCdDelivery = this.formResource.get('compCdDelivery')?.value ||  'P';
    this.company.compVlDelivery = convertCurrency(this.formResource.get('compVlDelivery')?.value, 'US') || 0;
    this.company.compDsTags = this.formResource.get('compDsTags')?.value;
    this.company.compVlRating = convertCurrency(this.formResource.get('compVlRating')?.value, 'US') || 0;
    this.company.compDsLogo = this.formResource.get('compDsLogo')?.value;
    this.address.addrCdType = this.formResource.get('addrCdType')?.value;
    this.address.addrNmAddress = this.formResource.get('addrNmAddress')?.value;
    this.address.addrDsAddress = this.formResource.get('addrDsAddress')?.value;
    this.address.addrDsNumber = this.formResource.get('addrDsNumber')?.value;
    this.address.addrDsComplement = this.formResource.get('addrDsComplement')?.value;
    this.address.addrNmDistrict = this.formResource.get('addrNmDistrict')?.value;
    this.address.addrNmCity = this.formResource.get('addrNmCity')?.value;
    this.address.addrSgState = this.formResource.get('addrSgState')?.value;
    this.address.addrCdZipcode = this.formResource.get('addrCdZipcode')?.value;
    this.company.address = this.address;
    this.company.user = this.user;
    this.segment = this.formResource.get('segment')?.value;
    this.company.segment = this.segment;
    this.save();
  }

  loadingForm() {
    this.formResource.get('compNmCompany')?.setValue(this.company.compNmCompany);
    this.formResource.get('compNmTrademark')?.setValue(this.company.compNmTrademark);
    this.formResource.get('compDsCompany')?.setValue(this.company.compDsCompany);
    this.formResource.get('compCdCNPJ')?.setValue(this.company.compCdCNPJ);
    this.formResource.get('compDsPhone')?.setValue(this.company.compDsPhone);
    this.formResource.get('compDsSmartphone')?.setValue(this.company.compDsSmartphone);
    this.formResource.get('compDsWhatsapp')?.setValue(this.company.compDsWhatsapp);
    this.formResource.get('compDsEmail')?.setValue(this.company.compDsEmail);
    this.formResource.get('compDsSite')?.setValue(this.company.compDsSite);
    this.formResource.get('compCdPix')?.setValue(this.company.compCdPix);
    this.formResource.get('compTxImage')?.setValue(this.company.compTxImage);
    this.formResource.get('compInDelivery')?.setValue(this.company.compInDelivery);
    this.formResource.get('compCdDelivery')?.setValue(this.company.compCdDelivery);
    this.formResource.get('compVlDelivery')?.setValue(this.company.compVlDelivery);
    this.formResource.get('compDsTags')?.setValue(this.company.compDsTags);
    this.formResource.get('compVlRating')?.setValue(this.company.compVlRating);
    this.formResource.get('compDsLogo')?.setValue(this.company.compDsLogo);
    this.formResource.get('addrCdType')?.setValue(this.company.address.addrCdType);
    this.formResource.get('addrNmAddress')?.setValue(this.company.address.addrNmAddress);
    this.formResource.get('addrDsAddress')?.setValue(this.company.address.addrDsAddress);
    this.formResource.get('addrDsNumber')?.setValue(this.company.address.addrDsNumber);
    this.formResource.get('addrDsComplement')?.setValue(this.company.address.addrDsComplement);
    this.formResource.get('addrNmDistrict')?.setValue(this.company.address.addrNmDistrict);
    this.formResource.get('addrNmCity')?.setValue(this.company.address.addrNmCity);
    this.formResource.get('addrSgState')?.setValue(this.company.address.addrSgState);
    this.formResource.get('addrCdZipcode')?.setValue(this.company.address.addrCdZipcode);
    this.formResource.get('userUid')?.setValue(this.company.user.uid);
    this.formResource.get('userDsEmail')?.setValue(this.company.user.userDsEmail);
    this.formResource.get('userNmName')?.setValue(this.company.user.userNmName);
    this.formResource.get('userDsSmartphone')?.setValue(this.company.user.userDsSmartphone);
    this.formResource.get('segment')?.setValue(this.company.segment.uid);
    this.selected = this.company?.segment.uid || '';
  }

}
