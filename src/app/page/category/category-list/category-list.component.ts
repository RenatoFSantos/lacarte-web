import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, fromEvent } from 'rxjs';
import { Constants } from 'src/app/shared/config/constants';
import compare from 'src/app/shared/helper/utils';
import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import Swal from 'sweetalert2';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';
import { CategoryModel } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit, AfterViewInit {

  pageTitle = 'Cadastro de Categorias';
  userLogged: UserModel = new UserModel();

  // ***** SETTINGS MAT-TABLE
  columns: string[] = ['cateNmCategory', 'uid'];
  displayedColumns: string[] = ['Categoria', 'uid'];
  dataResource: MatTableDataSource<CategoryModel>;
  sortedData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('fieldSearch') fieldSearch: ElementRef<HTMLInputElement>;
  searchFilter: string = "";
  categoryList: Array<CategoryModel> = new Array<CategoryModel>();
  categoryListFull: Array<CategoryModel> = new Array<CategoryModel>();
  // MatPaginator Output
  pageEvent: PageEvent;
  // MatPaginator Inputs
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private categoryService: CategoryService,
    private userService: UserService
  ) {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  async ngOnInit() {
    this.categoryListFull = await this.loadingResource();
    this.bind(this.categoryList);
  }

  async bind(newList?: Array<CategoryModel>): Promise<void> {
    let segments: iResultHttp;
    if (this.searchFilter === '') {
      this.categoryList = await this.loadingResource();
    } else {
      this.categoryList = this.categoryListFull.filter((res) => {
        return res.cateNmCategory.trim().toLowerCase().indexOf(this.searchFilter) >= 0
      })
    }

    // Ordenando os registros
    this.categoryList = this.categoryList.sort((obj1, obj2) => {
      return obj1.cateNmCategory.toUpperCase() < obj2.cateNmCategory.toUpperCase() ? -1 :
        (obj1.cateNmCategory.toUpperCase() > obj2.cateNmCategory.toUpperCase() ? 1 : 0);
    });

    this.dataResource = new MatTableDataSource(this.categoryList);
    this.dataResource.paginator = this.paginator;
    this.dataResource.sort = this.sort;
    this.length = this.dataResource.data.length;
    this.sortedData = this.categoryList;
  }

  async loadingResource(): Promise<Array<CategoryModel>> {
    const resources = await this.categoryService.getAll();
    let listCategories: Array<CategoryModel> = [];
    if (resources.success) {
      listCategories = resources.data as Array<CategoryModel>;
    }
    return listCategories;
  }

  ngAfterViewInit() {
    fromEvent(this.fieldSearch.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
      )
      .subscribe((e: Event) => {
        const target = (e.target as HTMLInputElement).value;
        this.searchFilter = target;
        this.bind();
      });
  }

  async delete(category: CategoryModel): Promise<void> {
    const options: any = {
      ...Constants.delete_swal_options, text: `Deseja realmente excluir a categoria ${category.cateNmCategory}`
    }
    const { value } = await Swal.fire(options);
    if (value && category.uid) {
      const result = await this.categoryService.delete(category.uid);
      if (result.success) {
        this.bind();
      }
    }
  }

  sortData(sort: Sort) {
    const data = this.sortedData;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'Category': return compare(a.cateNmCategory.toUpperCase(), b.cateNmCategory.toUpperCase(), isAsc);
        default: return 0;
      }
    });
  }

}
