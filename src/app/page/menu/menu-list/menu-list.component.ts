import { ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, fromEvent } from 'rxjs';
import { Constants } from 'src/app/shared/config/constants';
import compare from 'src/app/shared/helper/utils';
import Swal from 'sweetalert2';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';
import { MenuModel } from '../shared/menu.model';
import { MenuService } from '../shared/menu.service';
import { CompanyModel } from '../../company/shared/company.model';
import { CompanyService } from '../../company/shared/company.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss']
})
export class MenuListComponent implements OnInit, AfterViewInit {

  pageTitle = 'Cadastro de Menu';
  userLogged: UserModel = new UserModel();

  // ***** COMPANY
  company: CompanyModel;

  // ***** SETTINGS MAT-TABLE
  columns: string[] = ['product.prodNmProduct', 'uid'];
  displayedColumns: string[] = ['Produto', 'uid'];
  dataResource: MatTableDataSource<MenuModel>;
  sortedData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('fieldSearch') fieldSearch: ElementRef<HTMLInputElement>;
  searchFilter: string = "";
  menuList: Array<MenuModel> = new Array<MenuModel>();
  menuListFull: Array<MenuModel> = new Array<MenuModel>();
  // MatPaginator Output
  pageEvent: PageEvent;
  // MatPaginator Inputs
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 25, 100];

  constructor(
    private menuService: MenuService,
    private companyService: CompanyService,
    private userService: UserService,
    private active: ActivatedRoute,
    private matSnack: MatSnackBar
  ) {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  async ngOnInit() {
    this.company = new CompanyModel();
    this.active.params.subscribe(p => this.getMenuByCompany(p['id']));
  }

  async getMenuByCompany(uid: string) {
    const resCompany = await this.companyService.getById(uid);
    if(resCompany.success) {
      this.company = resCompany.data as CompanyModel;
      console.log('company=', this.company);
      const resMenu = await this.menuService.getMenuByCompany(uid);
      if (resMenu.success) {
        this.menuListFull = resMenu.data.menuList as Array<MenuModel>;
        console.log('menu=', this.menuListFull);
        await this.bind();
      }
    } else {
      this.matSnack.open('Não consigo localizar o menu do estabelecimento!', undefined, { duration: 3000 });
    }
  }

  async bind(newList?: Array<MenuModel>): Promise<void> {
    console.log('searchFilter=', this.searchFilter);
    if (this.searchFilter === '') {
      this.menuList = this.menuListFull;
      console.log('menuList 1', this.menuList);
    } else {
      this.menuList = this.menuListFull.filter((res) => {
        return res.product.prodNmProduct.trim().toLowerCase().indexOf(this.searchFilter) >= 0
      })
      console.log('menuList 2', this.menuList);
    }

    // Ordenando os registros
    if(this.menuList.length>0) {
      this.menuList = this.menuList.sort((obj1, obj2) => {
        return obj1.product.prodNmProduct.toUpperCase() < obj2.product.prodNmProduct.toUpperCase() ? -1 :
          (obj1.product.prodNmProduct.toUpperCase() > obj2.product.prodNmProduct.toUpperCase() ? 1 : 0);
      });
      this.dataResource = new MatTableDataSource(this.menuList);
      this.dataResource.paginator = this.paginator;
      this.dataResource.sort = this.sort;
      this.length = this.dataResource.data.length;
      this.sortedData = this.menuList;
    }

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

  async delete(menu: MenuModel): Promise<void> {
    const options: any = {
      ...Constants.delete_swal_options, text: `Deseja realmente excluir o produto do menu ${menu.product.prodNmProduct}`
    }
    const { value } = await Swal.fire(options);
    if (value && menu.uid) {
      const result = await this.menuService.delete(menu.uid);
      if (result.success) {
        await this.getMenuByCompany(this.company.uid!);
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
        case 'Menu': return compare(a.product.prodNmProduct.toUpperCase(), b.product.prodNmProduct.toUpperCase(), isAsc);
        default: return 0;
      }
    });
  }

}
