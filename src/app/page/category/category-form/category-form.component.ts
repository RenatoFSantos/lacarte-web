import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FileManager } from 'src/app/shared/component/input-file/input-file.component';
import { environment } from 'src/environments/environment';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';
import { CategoryModel } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {

  formResource: FormGroup;
  category: CategoryModel = new CategoryModel();
  userLogged: UserModel = new UserModel();
  pageTitle = '';
  imgCategory = 'category_default.jpg'


  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private fb: FormBuilder,
    private matSnack: MatSnackBar,
    private router: Router,
    private active: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadingResource();
  }

  async loadingResource() {
    await this.createForm();
    await this.active.params.subscribe(p => {
      this.getId(p['id']);
    })
  }

  async getId(uid: string): Promise<void> {
    if (uid === 'new' || typeof uid === 'undefined') {
      this.pageTitle = 'Nova Categoria';
      this.category = new CategoryModel();
    } else {
      const result = await this.categoryService.getById(uid);
      this.category = result.data as CategoryModel;
      this.formResource.patchValue(this.category);
      this.pageTitle = `Categoria: ${this.category.cateNmCategory}`;
      await this.getUserLogged();
    }
    await this.loadingPhoto();
  }

  getUserLogged(): void {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  private createForm() {
    this.formResource = this.fb.group({
      cateNmCategory: ['', [Validators.required]],
      cateTxImage: ['', null]
    })
  }

  async save(): Promise<void> {
    try {
      this.category.cateNmCategory = this.formResource.get('cateNmCategory')?.value;
      const result = await this.categoryService.save(this.category);
      if (result.success) {
        this.router.navigateByUrl('categories');
      }
    } catch (error) {
      this.matSnack.open('Problemas na gravação do registro!', undefined, { duration: 3000 });
    }
  }

  loadingPhoto() {
    if (this.category.cateTxImage) {
      this.imgCategory = `${environment.apiPath}/storage/${this.category.cateTxImage}`;
    } else {
      this.imgCategory = `${environment.apiPath}/storage/category_default.jpg`;
    }
    this.formResource.get('cateTxImage')?.setValue(this.imgCategory);
  }

  selectedFile(file: FileManager): void {
    if (file.base64Data) {
      this.category.cateTxImage = file.base64Data;
      this.imgCategory = file.base64Data;
    }
  }

}
