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
import { ProductModel } from '../shared/product.model';
import { ProductService } from '../shared/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, AfterViewInit {

  pageTitle = 'Cadastro de Produtos';
  userLogged: UserModel = new UserModel();

  // ***** SETTINGS MAT-TABLE
  columns: string[] = ['prodNmProduct', 'uid'];
  displayedColumns: string[] = ['Produto', 'uid'];
  dataResource: MatTableDataSource<ProductModel>;
  sortedData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('fieldSearch') fieldSearch: ElementRef<HTMLInputElement>;
  searchFilter: string = "";
  productList: Array<ProductModel> = new Array<ProductModel>();
  productListFull: Array<ProductModel> = new Array<ProductModel>();
  // MatPaginator Output
  pageEvent: PageEvent;
  // MatPaginator Inputs
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private productService: ProductService,
    private userService: UserService
  ) {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  async ngOnInit() {
    this.productListFull = await this.loadingResource();
    this.bind(this.productList);
  }

  async bind(newList?: Array<ProductModel>): Promise<void> {
    let segments: iResultHttp;
    if (this.searchFilter === '') {
      this.productList = await this.loadingResource();
    } else {
      this.productList = this.productListFull.filter((res) => {
        return res.prodNmProduct.trim().toLowerCase().indexOf(this.searchFilter) >= 0
      })
    }

    // Ordenando os registros
    this.productList = this.productList.sort((obj1, obj2) => {
      return obj1.prodNmProduct.toUpperCase() < obj2.prodNmProduct.toUpperCase() ? -1 :
        (obj1.prodNmProduct.toUpperCase() > obj2.prodNmProduct.toUpperCase() ? 1 : 0);
    });

    this.dataResource = new MatTableDataSource(this.productList);
    this.dataResource.paginator = this.paginator;
    this.dataResource.sort = this.sort;
    this.length = this.dataResource.data.length;
    this.sortedData = this.productList;
  }

  async loadingResource(): Promise<Array<ProductModel>> {
    const resources = await this.productService.getAll();
    let listProducts: Array<ProductModel> = [];
    if (resources.success) {
      listProducts = resources.data as Array<ProductModel>;
    }
    return listProducts;
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

  async delete(product: ProductModel): Promise<void> {
    const options: any = {
      ...Constants.delete_swal_options, text: `Deseja realmente excluir o produto ${product.prodNmProduct}`
    }
    const { value } = await Swal.fire(options);
    if (value && product.uid) {
      const result = await this.productService.delete(product.uid);
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
        case 'Product': return compare(a.prodNmProduct.toUpperCase(), b.prodNmProduct.toUpperCase(), isAsc);
        default: return 0;
      }
    });
  }

}
