import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { FileManager } from 'src/app/shared/component/input-file/input-file.component';
import { iStatus } from 'src/app/shared/interface/iStatus';
import { environment } from 'src/environments/environment';
import { CategoryModel } from '../../category/shared/category.model';
import { CategoryService } from '../../category/shared/category.service';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';
import { ProductModel } from '../shared/product.model';
import { ProductService } from '../shared/product.service';


@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {

  formResource: FormGroup;
  product: ProductModel = new ProductModel();
  category: CategoryModel = new CategoryModel();
  userLogged: UserModel = new UserModel();
  selected = '';
  pageTitle = '';

  image = 'product_default.jpg';
  @ViewChild('appInput') appInput: ElementRef;

  // ******* SEGMENT *******
  myControl = new FormControl('');
  options: iStatus[];
  listCategories: Array<CategoryModel> = new Array<CategoryModel>();
  filteredCategories: Observable<Array<CategoryModel>>;

  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private fb: FormBuilder,
    private matSnack: MatSnackBar,
    private router: Router,
    private active: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.active.params.subscribe(async p => {
      await this.getId(p['id']);
      await this.loadingCategory();
      await this.createForm();
      await this.bind();
    })
    this.filteredCategories = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    )
  }

  private _filter(value: string): Array<CategoryModel> {
    const filterValue = value.toLowerCase();
    return this.listCategories.filter(option => option.cateNmCategory.toLowerCase().includes(filterValue));
  }

  async getId(uid: string): Promise<void> {
    if (uid === 'new' || typeof uid === 'undefined') {
      this.pageTitle = 'Novo Produto';
    } else {
      const result = await this.productService.getById(uid);
      this.product = result.data as ProductModel;
      this.pageTitle = `Produto: ${this.product.prodNmProduct}`;
    }
  }

  async bind() {
    Object.assign(this.category, this.product.category);
    await this.loadingForm();
    await this.getUserLogged();
    await this.loadingImage();
  }

  getUserLogged(): void {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  loadingImage() {
    if (this.product.prodTxImage && this.product.prodTxImage !== null) {
      this.image = `${environment.apiPath}/storage/${this.product.prodTxImage}`;
    } else {
      this.image = `${environment.apiPath}/storage/product_default.jpg`;
    }
  }

  async loadingCategory(): Promise<void> {
    this.listCategories = new Array<CategoryModel>();
    try {
      let result = await this.categoryService.getAll();
      if(result.success){
        this.listCategories = result.data as Array<CategoryModel>;
        this.selected = this.listCategories[0].uid!;
        // SORT NAME
        this.listCategories.sort((categoryA: CategoryModel, categoryB: CategoryModel) => {
          let a = categoryA.cateNmCategory.toUpperCase();
          let b = categoryB.cateNmCategory.toUpperCase();
          return a == b ? 0 : a > b ? 1 : -1;
        })
      }
    } catch (error) {
      this.matSnack.open('Não consigo localizar as categorias de produtos!', undefined, { duration: 3000 });
    }
  }

  private createForm() {
    this.formResource = this.fb.group({
      uid: ['', null],
      prodCdStandard: ['', null],
      prodNmProduct: ['', [Validators.required]],
      prodDsProduct: ['', null],
      prodDsRecipe: ['', null],
      prodTxImage: ['', null],
      prodDsDescriptor: ['', null],
      category: [this.selected, null]
    })
  }

  async save(): Promise<void> {
    try {
      delete this.product.category.created;
      delete this.product.category.updated;
      const result = await this.productService.save(this.product);
      if(result.success) {
        this.matSnack.open('Registro salvo com sucesso!', undefined, {duration: 3000});
        this.router.navigateByUrl('products');
      }
    } catch (error) {
      this.matSnack.open('Problemas na gravação do registro!', undefined, { duration: 3000 });
    }
  }

  selectedFile(file: FileManager): void {
    if (file.base64Data) {
      this.product.prodTxImage = file.base64Data;
      this.formResource.get('prodTxImage')?.setValue(this.product.prodTxImage);
      this.image = file.base64Data;
    }
  }

  newProduct() {
    this.formResource.reset();
    this.product = new ProductModel();
    this.loadingImage();
    this.getId('new');
  }

  onFormSubmit() {
    this.product.prodCdStandard = this.formResource.get('prodCdStandard')?.value;
    this.product.prodNmProduct = this.formResource.get('prodNmProduct')?.value;
    this.product.prodDsProduct = this.formResource.get('prodDsProduct')?.value;
    this.product.prodDsRecipe = this.formResource.get('prodDsRecipe')?.value;
    this.product.prodTxImage = this.formResource.get('prodTxImage')?.value;
    this.product.prodDsDescriptor = this.formResource.get('prodDsDescriptor')?.value;
    this.category = this.formResource.get('category')?.value;
    this.product.category = this.category;
    this.save();
  }

  loadingForm() {
    this.formResource.get('prodCdStandard')?.setValue(this.product.prodCdStandard);
    this.formResource.get('prodNmProduct')?.setValue(this.product.prodNmProduct);
    this.formResource.get('prodDsProduct')?.setValue(this.product.prodDsProduct);
    this.formResource.get('prodDsRecipe')?.setValue(this.product.prodDsRecipe);
    this.formResource.get('prodTxImage')?.setValue(this.product.prodTxImage);
    this.formResource.get('prodDsDescriptor')?.setValue(this.product.prodDsDescriptor);
    this.formResource.get('category')?.setValue(this.product.category.uid);
    this.selected = this.product?.category.uid || '';
  }

}
