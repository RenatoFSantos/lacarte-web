import { MatTableDataSource } from '@angular/material/table';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyModel } from '../../company/shared/company.model';
import { PromotionModel } from '../../promotion/shared/promotion.model';
import { PromotionService } from '../../promotion/shared/promotion.service';
import { UserService } from '../../user/shared/user.service';
import { FidelityService } from '../shared/fidelity.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { FidelityModel } from '../shared/fidelity.model';
import { UserModel } from '../../user/shared/user.model';
import compare from 'src/app/shared/helper/utils';
import { debounceTime, fromEvent } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import { Constants } from 'src/app/shared/config/constants';

@Component({
  selector: 'app-fidelity-list',
  templateUrl: './fidelity-list.component.html',
  styleUrls: ['./fidelity-list.component.scss']
})
export class FidelityListComponent implements OnInit, AfterViewInit {

  url = '';
  pageTitle = '';
  promotion: PromotionModel;
  company: CompanyModel;
  fidelity: FidelityModel;
  userLogged: UserModel = new UserModel();
  flagUserView = false; // VIEW USER TABLE

  // ***** SETTINGS MAT-TABLE
  columns: string[] = ['fidelity.user.userNmName', 'uid'];
  displayedColumns: string[] = ['User', 'uid'];
  dataResource: MatTableDataSource<FidelityModel>;
  sortedData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('fieldSearch') fieldSearch: ElementRef<HTMLInputElement>;
  @ViewChild('userSearch') userSearch: ElementRef<HTMLInputElement>;
  searchFilter: string = '';
  userFilter: string = '';
  resourceList: Array<FidelityModel> = new Array<FidelityModel>();
  resourceListFull: Array<FidelityModel> = new Array<FidelityModel>();
  // MatPaginator Output
  pageEvent: PageEvent;
  // MatPaginator Inputs
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  // ******** SEARCH USER - TABLE
  userControl = new FormControl();
  listUsers: Array<UserModel> = new Array<UserModel>();
  listUsersFull: Array<UserModel> = new Array<UserModel>();
  user_displayedColumns: string[] = ['name', 'lastname', 'type', 'id'];
  user_dataSource: MatTableDataSource<UserModel>;
  selection = new SelectionModel<UserModel>(true, []);

  constructor(
    private fidelityService: FidelityService,
    private promotionService: PromotionService,
    private userService: UserService,
    private fb: FormBuilder,
    private matSnack: MatSnackBar,
    private router: Router,
    private active: ActivatedRoute
  ) {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  ngOnInit(): void {
    this.url=this.router.url;

    this.active.params.subscribe(async p => {
      await this.getPromotion(p['id']) // --- get Promotion and Company
      await this.getFidelity(p['id']) // --- get Fidelity List
      await this.bind();
      await this.loadingUsers();
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
      this.bind();
    });

    fromEvent(this.userSearch.nativeElement, 'keyup')
    .pipe(
      debounceTime(1000),
    )
    .subscribe((e: Event) => {
      const userTarget = (e.target as HTMLInputElement).value;
      this.userFilter = userTarget;
      this.bindUser();
    })
  }

  async loadingUsers(): Promise<void> {
    try {
      const result = await this.userService.getAll();
      this.listUsersFull = result.data as Array<UserModel>;

      this.user_dataSource = new MatTableDataSource(this.listUsersFull);
    } catch (error) {
      this.matSnack.open(`Problemas na carga de usuários. Verifique! Erro: ${error}`, undefined, { duration: 3000 });
    }
  }

  async bind(newList?: Array<PromotionModel>): Promise<void> {
    if (this.searchFilter === '' || this.searchFilter === undefined || this.searchFilter === null) {
      this.resourceList = this.resourceListFull;
    } else {
      this.resourceList = this.resourceListFull.filter((res) => {
        return res.user.userNmName.trim().toLowerCase().indexOf(this.searchFilter) >= 0
      })
    }

    // Ordenando os registros
    if(this.resourceList.length>0) {
      this.resourceList = this.resourceList.sort((obj1, obj2) => {
        return obj1.user.userNmName.toUpperCase() < obj2.user.userNmName.toUpperCase() ? -1 :
          (obj1.user.userNmName.toUpperCase() > obj2.user.userNmName.toUpperCase() ? 1 : 0);
      });
      this.dataResource = new MatTableDataSource(this.resourceList);
      this.dataResource.paginator = this.paginator;
      this.dataResource.sort = this.sort;
      this.length = this.dataResource.data.length;
      this.sortedData = this.resourceList;
    }
  }

  async bindUser(newList?: Array<PromotionModel>): Promise<void> {
    if (this.userFilter === '' || this.userFilter === undefined || this.userFilter === null) {
      this.listUsers = this.listUsersFull;
    } else {
      this.listUsers = this.listUsersFull.filter((res) => {
        return res.userNmName.trim().toLowerCase().indexOf(this.userFilter) >= 0
      })
    }

    // Ordenando os registros
    if(this.listUsers.length>0) {
      this.listUsers = this.listUsers.sort((obj1, obj2) => {
        return obj1.userNmName.toUpperCase() < obj2.userNmName.toUpperCase() ? -1 :
          (obj1.userNmName.toUpperCase() > obj2.userNmName.toUpperCase() ? 1 : 0);
      });
      this.user_dataSource = new MatTableDataSource(this.listUsers);
      this.user_dataSource.paginator = this.paginator;
      this.user_dataSource.sort = this.sort;
      this.length = this.user_dataSource.data.length;
      this.sortedData = this.listUsers;
    }
  }

  async filterUser(): Promise<boolean> {
    const result = await this.resourceListFull.find(element => element.user.uid === this.selection.selected[0].uid);
    if (result === undefined) {
      return true;
    } else {
      return false;
    }
  }

  async getPromotion(uid: string): Promise<void> {
    this.promotion = new PromotionModel();
    this.company = new CompanyModel();
    if(uid) {
      try {
        const resultPromotion = await this.promotionService.getById(uid);
        if(resultPromotion.success) {
          this.promotion = resultPromotion.data as PromotionModel;
          this.company = this.promotion.company;
        }
      } catch (error) {
        this.matSnack.open('Erro na carga das promoção: ' + error, '', { duration: 3000 });
      }
    }
  }

  async getFidelity(uid: string): Promise<void> {
    if(uid) {
      this.pageTitle = "Promoção: " + this.promotion.promNmPromotion;
      try {
        const resultFidelity = await this.fidelityService.getFidelityByPromotion(uid);
        if(resultFidelity.success) {
          this.resourceListFull = resultFidelity.data.resourceList;
          await this.bind();
        }
      } catch (error) {
        this.matSnack.open('Erro na carga das fidelidades: ' + error, '', { duration: 3000 });
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
        case 'Promoção': return compare(a.user.userNmName.toUpperCase(), b.user.userNmName.toUpperCase(), isAsc);
        default: return 0;
      }
    });
  }

  insertUser() {
    if(this.listUsersFull.length>0) {
      this.flagUserView = true;
    } else {
      Swal.fire('Nenhum usuário encontrado. Verifique!');
    }
  }

  cancelUser() {
    this.flagUserView = false;
    console.log('flagUserView = ', this.flagUserView);
  }

  async selectRow(row: any) {
    this.selection.toggle(row);
    if(await this.filterUser()) {
      this.fidelity = new FidelityModel();
      this.fidelity.promotion = this.promotion;
      this.fidelity.user = this.selection.selected[0];
      this.fidelity.fideQnVoucher = 1;
      await this.save(this.fidelity);
      await this.getFidelity(this.promotion.uid!);
    } else {
      Swal.fire('Usuário já cadastrado!');
    }
    this.selection = new SelectionModel<UserModel>(true, []);
    this.flagUserView = !this.flagUserView;
  }

  async delete(model: FidelityModel): Promise<void> {
    const options: any = {
      ...Constants.delete_swal_options, text: `Deseja realmente excluir o usuário ${model.user.userNmName}`
    }
    const { value } = await Swal.fire(options);
    if (value && model.uid) {
      const result = await this.fidelityService.delete(model.uid!);
      if (result.success) {
        await this.getFidelity(this.promotion.uid!);
      }
    }
  }

  async save(model: FidelityModel): Promise<void> {
    try {
      const result = await this.fidelityService.save(model);
    } catch (error) {
      this.matSnack.open(`Problemas na gravação da fidelização. Erro: ${error}`, '', { duration: 3000 });
    }
  }



}
