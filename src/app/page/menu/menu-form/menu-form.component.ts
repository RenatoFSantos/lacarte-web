import { MatTableDataSource } from '@angular/material/table';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FileManager } from 'src/app/shared/component/input-file/input-file.component';
import { environment } from 'src/environments/environment';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';
import { convertCurrency } from 'src/app/shared/helper/utils';
import { MenuService } from '../shared/menu.service';
import { MenuModel } from '../shared/menu.model';
import { ProductModel } from '../../product/shared/product.model';
import { CompanyModel } from '../../company/shared/company.model';
import { CompanyService } from '../../company/shared/company.service';
import { ProductService } from '../../product/shared/product.service';
import { debounceTime, fromEvent, Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-menu-form',
  templateUrl: './menu-form.component.html',
  styleUrls: ['./menu-form.component.scss']
})
export class MenuFormComponent implements OnInit, AfterViewInit {

  formResource: FormGroup;
  menu: MenuModel = new MenuModel();
  company: CompanyModel = new CompanyModel();
  product: ProductModel = new ProductModel();
  userLogged: UserModel = new UserModel();
  selected = '';
  pageTitle = '';
  url = '';
  productControl = new FormControl();
  listProducts: Array<ProductModel> = new Array<ProductModel>();
  filteredOptions: Observable<ProductModel[]>;
  filterProduct: boolean = false;
  displayedColumns: string[] = ['product', 'category'];
  dataSource = new MatTableDataSource<ProductModel>(this.listProducts);
  selection = new SelectionModel<ProductModel>(true, []);

  image = 'product_default.jpg';
  @ViewChild('appInput') appInput: ElementRef;
  @ViewChild('fieldSearch') fieldSearch: ElementRef<HTMLInputElement>;
  searchFilter: string = "";


  constructor(
    private menuService: MenuService,
    private userService: UserService,
    private companyService: CompanyService,
    private productService: ProductService,
    private fb: FormBuilder,
    private matSnack: MatSnackBar,
    private router: Router,
    private active: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // ***** AUTOCOMPLETE ***********************
    // this.filteredOptions = this.productControl.valueChanges.pipe(
    //   startWith(''),
    //   map((value: any) => value.trim()),
    //   filter((value: any) => value.length > 2),
    //   debounceTime(500),
    //   distinctUntilChanged(),
    //   switchMap((value: any) => this.searchProduct(value || '')),
    //   map((res: any) => res.listProducts)
    // )
    this.url=this.router.url;

    this.active.params.subscribe(async p => {
      await this.getId(p['id']);
      await this.createForm();
      await this.bind();
    })
  }

  ngAfterViewInit(): void {
    fromEvent(this.fieldSearch.nativeElement, 'keyup')
    .pipe(
      debounceTime(1000),
    )
    .subscribe((e: Event) => {
      const target = (e.target as HTMLInputElement).value;
      this.searchFilter = target;
      this.searchProduct();
    });
  }

  async searchProduct(): Promise<void> {
    if (this.searchFilter === '' || this.searchFilter === null) {
      this.searchFilter="vazio";
    }
    this.listProducts = new Array<ProductModel>();
    await this.productService.getProductByName(this.searchFilter).then(result => {
      if(result.success) {
        this.listProducts = result.data.listProducts as Array<ProductModel>;
        this.dataSource = new MatTableDataSource<ProductModel>(this.listProducts);
        this.selection = new SelectionModel<ProductModel>(true, []);
      } else {
        this.matSnack.open('Nenhum produto selecionado!', undefined, { duration: 3000 });
      }
    })
  }

  filterProducts() {
    this.filterProduct = !this.filterProduct;
    this.searchProduct();
  }

  clearFieldsProduct() {
    this.formResource.get('prodUid')?.setValue('');
    this.formResource.get('prodDsProduct')?.setValue('');
    this.formResource.get('prodCategory')?.setValue('');
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    return this.listProducts.filter(product => product.prodNmProduct.toLowerCase().includes(filterValue));
  }

  async getId(uid: string): Promise<void> {
    if (this.url.indexOf('new')>=0) {
      this.pageTitle = 'Novo Produto';
      try {
        const result = await this.companyService.getById(uid);
        if(result.success) {
          this.company = result.data as CompanyModel;
        }
      } catch (error) {
        this.matSnack.open('Problemas para localizar a empresa. Verifique!', '', { duration: 3000 })
      }
    } else {
      const result = await this.menuService.getById(uid);
      this.menu = result.data as MenuModel;
      this.company = this.menu.company;
      this.pageTitle = `Produto: ${this.menu.product.prodNmProduct}`;
    }
  }

  async bind() {
    Object.assign(this.company, this.menu.company);
    Object.assign(this.product, this.menu.product);
    await this.loadingForm();
    await this.getUserLogged();
    await this.loadingImage();
  }

  getUserLogged(): void {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  loadingImage() {
    if (this.menu.menuTxImage && this.menu.menuTxImage !== null) {
      this.image = `${environment.apiPath}/storage/${this.menu.menuTxImage}`;
    } else {
      this.image = `${environment.apiPath}/storage/product_default.jpg`;
    }
  }

  private createForm() {
    this.formResource = this.fb.group({
      uid: ['', null],
      menuCdMenu: ['', [Validators.required]],
      menuVlPrice: ['', [Validators.required]],
      menuPrDiscount: ['', null],
      menuPrDelivery: ['', null],
      menuTxImage: ['product_default.jpg', null],
      menuPrCashback: ['', Validators.max(100)],
      menuDsDescriptor: ['', Validators.max(100)],
      menuVlRating: ['0', Validators.max(100)],
      company: ['', null],
      prodUid: ['', [Validators.required]],
      prodNmProduct: ['', [Validators.required]],
      prodDsProduct: ['', null],
      prodCategory: ['', [Validators.required]],
    })
  }

  async save(): Promise<void> {
    try {
      delete this.menu.product.created;
      delete this.menu.product.updated;
      delete this.menu.company.created;
      delete this.menu.company.updated;
      const result = await this.menuService.save(this.menu);
      if(result.success) {
        this.matSnack.open('Registro salvo com sucesso!', undefined, {duration: 3000});
        this.router.navigateByUrl(`/companies/${this.company.uid}/menu`);
      }
    } catch (error) {
      this.matSnack.open('Problemas na gravação do registro!', undefined, { duration: 3000 });
    }
  }

  selectedFile(file: FileManager): void {
    if (file.base64Data) {
      this.menu.menuTxImage = file.base64Data;
      this.formResource.get('menuTxImage')?.setValue(this.menu.menuTxImage);
      this.image = file.base64Data;
    }
  }

  selProduct(product: ProductModel) {
    this.formResource.get('prodUid')?.setValue(product.uid);
    this.formResource.get('prodDsProduct')?.setValue(product.prodDsProduct);
    this.formResource.get('prodCategory')?.setValue(product.category.cateNmCategory);
    this.formResource.get('menuTxImage')?.setValue(`${environment.apiPath}/storage/${product.prodTxImage}`);
    console.log('Imagem carregada=', product.prodTxImage);
  }

  onFormSubmit() {
    this.menu.menuCdMenu = this.formResource.get('menuCdMenu')?.value;
    this.menu.menuVlPrice = convertCurrency(this.formResource.get('menuVlPrice')?.value, 'US') || 0;
    this.menu.menuPrDiscount = convertCurrency(this.formResource.get('menuPrDiscount')?.value, 'US') || 0;
    this.menu.menuPrDelivery = convertCurrency(this.formResource.get('menuPrDelivery')?.value, 'US') || 0;
    this.menu.menuTxImage = this.formResource.get('menuTxImage')?.value;
    this.menu.menuPrCashback = convertCurrency(this.formResource.get('menuPrCashback')?.value, 'US') || 0;
    this.menu.menuDsDescriptor = this.formResource.get('menuDsDescriptor')?.value;
    this.menu.menuVlRating = convertCurrency(this.formResource.get('menuVlRating')?.value, 'US') || 0;
    this.menu.company = this.company;
    this.menu.product = this.formResource.get('prodUid')?.value;

    this.save();
  }

  loadingForm() {
    this.formResource.get('menuCdMenu')?.setValue(this.menu.menuCdMenu);
    this.formResource.get('menuVlPrice')?.setValue(this.menu.menuVlPrice);
    this.formResource.get('menuPrDiscount')?.setValue(this.menu.menuPrDiscount);
    this.formResource.get('menuPrDelivery')?.setValue(this.menu.menuPrDelivery);
    this.formResource.get('menuTxImage')?.setValue(this.menu.menuTxImage);
    this.formResource.get('menuPrCashback')?.setValue(this.menu.menuPrCashback);
    this.formResource.get('menuDsDescriptor')?.setValue(this.menu.menuDsDescriptor);
    this.formResource.get('menuVlRating')?.setValue(this.menu.menuVlRating);
    this.formResource.get('product')?.setValue(this.menu.product.uid);
    this.formResource.get('company')?.setValue(this.menu.company.uid);
    this.formResource.get('prodUid')?.setValue(this.menu.product.uid);
    this.formResource.get('prodNmProduct')?.setValue(this.menu.product.prodNmProduct);
    this.formResource.get('prodDsProduct')?.setValue(this.menu.product.prodDsProduct);
    this.formResource.get('prodCategory')?.setValue(this.menu.product.category.cateNmCategory);
    this.selected = this.menu?.product.uid || '';
  }

  // ****** FUNCTIONS SELECTION DATABASE ROW

  selectRow(row: any) {
    this.selection.toggle(row);
    this.formResource.get('prodUid')?.setValue(this.selection.selected[0].uid);
    this.formResource.get('prodNmProduct')?.setValue(this.selection.selected[0].prodNmProduct);
    this.formResource.get('prodDsProduct')?.setValue(this.selection.selected[0].prodDsProduct);
    this.formResource.get('prodCategory')?.setValue(this.selection.selected[0].category.cateNmCategory);
    this.formResource.get('menuTxImage')?.setValue(this.selection.selected[0].prodTxImage);
    this.image = `${environment.apiPath}/storage/${this.selection.selected[0].prodTxImage}`
    console.log('Imagem selecionada=', this.selection.selected[0].prodTxImage);
    this.filterProduct = !this.filterProduct;
  }
}
