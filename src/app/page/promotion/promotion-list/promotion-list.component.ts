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
import { CompanyModel } from '../../company/shared/company.model';
import { CompanyService } from '../../company/shared/company.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { PromotionModel } from '../shared/promotion.model';
import { PromotionService } from '../shared/promotion.service';

@Component({
  selector: 'app-promotion-list',
  templateUrl: './promotion-list.component.html',
  styleUrls: ['./promotion-list.component.scss']
})
export class PromotionListComponent implements OnInit {

  pageTitle = 'Cadastro de Promoção';
  userLogged: UserModel = new UserModel();

  // ***** COMPANY
  company: CompanyModel;

  // ***** SETTINGS MAT-TABLE
  columns: string[] = ['promotion.promNmPromotion', 'uid'];
  displayedColumns: string[] = ['Promotion', 'uid'];
  dataResource: MatTableDataSource<PromotionModel>;
  sortedData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('fieldSearch') fieldSearch: ElementRef<HTMLInputElement>;
  searchFilter: string = " ";
  resourceList: Array<PromotionModel> = new Array<PromotionModel>();
  resourceListFull: Array<PromotionModel> = new Array<PromotionModel>();
  // MatPaginator Output
  pageEvent: PageEvent;
  // MatPaginator Inputs
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private promotionService: PromotionService,
    private companyService: CompanyService,
    private userService: UserService,
    private active: ActivatedRoute,
    private matSnack: MatSnackBar
  ) {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  async ngOnInit() {
    this.company = new CompanyModel();
    this.active.params.subscribe(p => this.getPromotionsByCompany(p['id']));
  }

  async getPromotionsByCompany(uid: string) {
    const resCompany = await this.companyService.getById(uid);
    if(resCompany.success) {
      this.company = resCompany.data as CompanyModel;
      const result = await this.promotionService.getPromotionsByCompany(uid);
      if (result.success) {
        this.resourceListFull = result.data.resourceList as Array<PromotionModel>;
        this.bind();
      }
    } else {
      this.matSnack.open('Não consigo localizar a promoção do estabelecimento!', undefined, { duration: 3000 });
    }
  }

  async bind(newList?: Array<PromotionModel>): Promise<void> {
    if (this.searchFilter === '') {
      this.resourceList = this.resourceListFull;
    } else {
      this.resourceList = this.resourceListFull.filter((res) => {
        return res.promNmPromotion.trim().toLowerCase().indexOf(this.searchFilter) >= 0
      })
    }

    // Ordenando os registros
    if(this.resourceList.length>0) {
      this.resourceList = this.resourceList.sort((obj1, obj2) => {
        return obj1.promNmPromotion.toUpperCase() < obj2.promNmPromotion.toUpperCase() ? -1 :
          (obj1.promNmPromotion.toUpperCase() > obj2.promNmPromotion.toUpperCase() ? 1 : 0);
      });
      this.dataResource = new MatTableDataSource(this.resourceList);
      this.dataResource.paginator = this.paginator;
      this.dataResource.sort = this.sort;
      this.length = this.dataResource.data.length;
      this.sortedData = this.resourceList;
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

  async delete(resource: PromotionModel): Promise<void> {
    const options: any = {
      ...Constants.delete_swal_options, text: `Deseja realmente excluir a promoção ${resource.promNmPromotion}`
    }
    const { value } = await Swal.fire(options);
    if (value && resource.uid) {
      const result = await this.promotionService.delete(resource.uid);
      if (result.success) {
        await this.getPromotionsByCompany(this.company.uid!);
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
        case 'Promoção': return compare(a.promNmPromotion.toUpperCase(), b.promNmPromotion.toUpperCase(), isAsc);
        default: return 0;
      }
    });
  }

}
