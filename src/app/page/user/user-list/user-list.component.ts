import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserModel } from '../shared/user.model';
import { UserService } from '../shared/user.service';
import { Constants } from 'src/app/shared/config/constants';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import swal from 'sweetalert2'
import compare from 'src/app/shared/helper/utils';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {

  pageTitle = 'Cadastro de Usuários';
  columns: string[] = ['userSgUser', 'userNmName', 'userNmLastname', 'userCdType', 'uid'];
  displayedColumns: string[] = ['Sigla', 'Nome', 'Sobrenome', 'Tipo', 'uid'];
  dataResource: MatTableDataSource<UserModel>;
  sortedData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('fieldSearch') fieldSearch: ElementRef<HTMLInputElement>;
  searchFilter: string = "";
  usersList: Array<UserModel> = new Array<UserModel>();
  usersListFull: Array<UserModel> = new Array<UserModel>();
  userLogged: UserModel = new UserModel();

  // MatPaginator Output
  pageEvent: PageEvent;
  // MatPaginator Inputs
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private userService: UserService,
  ) {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  async ngOnInit() {
    this.usersListFull = await this.loadingResource();
    this.bind(this.usersList);
  }

  async bind(newList?: Array<UserModel>): Promise<void> {
    let users: iResultHttp;
    if (this.searchFilter === '') {
      this.usersList = await this.loadingResource();
    } else {
      this.usersList = this.usersListFull.filter((res) => {
        return res.userNmName.trim().toLowerCase().indexOf(this.searchFilter) >= 0
      })
    }

    // Ordenando os registros
    this.usersList = this.usersList.sort((obj1, obj2) => {
      return obj1.userNmName.toUpperCase() < obj2.userNmName.toUpperCase() ? -1 :
        (obj1.userNmName.toUpperCase() > obj2.userNmName.toUpperCase() ? 1 : 0);
    });

    this.dataResource = new MatTableDataSource(this.usersList);
    this.dataResource.paginator = this.paginator;
    this.dataResource.sort = this.sort;
    this.length = this.dataResource.data.length;
    this.sortedData = this.usersList;
  }

  async loadingResource(): Promise<Array<UserModel>> {
    const users = await this.userService.getAll();
    let listUsers: Array<UserModel> = [];
    if (users.success) {
      listUsers = users.data as Array<UserModel>;
    }
    return listUsers;
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

  async delete(user: UserModel): Promise<void> {
    const options: any = {
      ...Constants.delete_swal_options, text: `Deseja realmente excluir o usuário ${user.userNmName}`
    }
    const { value } = await swal.fire(options);
    if (value && user.uid) {
      const result = await this.userService.delete(user.uid);
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
        case 'Nome': return compare(a.userNmName.toUpperCase(), b.userNmName.toUpperCase(), isAsc);
        default: return 0;
      }
    });
  }

}
