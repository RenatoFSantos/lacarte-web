import { AfterViewInit, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CompanyModel } from '../shared/company.model';
import { UserService } from '../../user/shared/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { CompanyService } from '../shared/company.service';
import { debounceTime, fromEvent } from 'rxjs';
import { Constants } from 'src/app/shared/config/constants';
import Swal from 'sweetalert2';
import compare from 'src/app/shared/helper/utils';
import { UserModel } from '../../user/shared/user.model';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit, AfterViewInit {

  pageTitle = 'Cadastro de Empresas';
  userLogged: UserModel = new UserModel();

  // ***** SETTINGS MAT-TABLE
  columns: string[] = ['compNmTrademark', 'compCdCnpj', 'compDsPhone', 'compDsSmartphone', 'compDsWhatsapp', 'uid'];
  displayedColumns: string[] = ['EMPRESA', 'CNPJ', 'TELEFONE', 'CELULAR', 'WHATSAPP', 'uid'];
  dataResource: MatTableDataSource<CompanyModel>;
  sortedData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('fieldSearch') fieldSearch: ElementRef<HTMLInputElement>;
  searchFilter: string = "";
  resourceList: Array<CompanyModel> = new Array<CompanyModel>();
  resourceListFull: Array<CompanyModel> = new Array<CompanyModel>();
  // MatPaginator Output
  pageEvent: PageEvent;
  // MatPaginator Inputs
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private companyService: CompanyService,
    private userService: UserService
  ) {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  async ngOnInit() {
    this.resourceListFull = await this.loadingResource();
    this.bind();
  }

  async bind(): Promise<void> {
    // let resources: iResultHttp;
    if (this.searchFilter === '') {
      this.resourceList = await this.loadingResource();
    } else {
      this.resourceList = this.resourceListFull.filter((res) => {
        return res.compNmTrademark.trim().toLowerCase().indexOf(this.searchFilter) >= 0
      })
    }

    // Ordenando os registros
    this.resourceList = this.resourceList.sort((obj1, obj2) => {
      return obj1.compNmTrademark?.toUpperCase() < obj2.compNmTrademark?.toUpperCase() ? -1 :
        (obj1.compNmTrademark?.toUpperCase() > obj2.compNmTrademark?.toUpperCase() ? 1 : 0);
    });

    this.dataResource = new MatTableDataSource(this.resourceList);
    this.dataResource.paginator = this.paginator;
    this.dataResource.sort = this.sort;
    this.length = this.dataResource.data.length;
    this.sortedData = this.resourceList;
  }

  async loadingResource(): Promise<Array<CompanyModel>> {
    const resources = await this.companyService.getAll();
    let listResource: Array<CompanyModel> = [];
    if (resources.success) {
      listResource = resources.data as Array<CompanyModel>;
    }
    return listResource;
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

  async delete(resource: CompanyModel): Promise<void> {
    const options: any = {
      ...Constants.delete_swal_options, text: `Deseja realmente excluir a empresa ${resource.compNmTrademark}`
    }
    const { value } = await Swal.fire(options);
    if (value && resource.uid) {
      const result = await this.companyService.delete(resource.uid);
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
        case 'Empresa': return compare(a.compNmTrademark?.toUpperCase(), b.compNmTrademark?.toUpperCase(), isAsc);
        default: return 0;
      }
    });
  }

}
