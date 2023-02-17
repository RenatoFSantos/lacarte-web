import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { Component, ElementRef, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Constants } from 'src/app/shared/config/constants';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import swal from 'sweetalert2'
import compare from 'src/app/shared/helper/utils';
import { SegmentModel } from '../shared/segment.model';
import { SegmentService } from '../shared/segment.service';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';

@Component({
  selector: 'app-segment-list',
  templateUrl: './segment-list.component.html',
  styleUrls: ['./segment-list.component.scss']
})
export class SegmentListComponent implements OnInit, AfterViewInit {

  pageTitle = 'Cadastro de Segmentos Empresariais';
  userLogged: UserModel = new UserModel();

  // ***** SETTINGS MAT-TABLE
  columns: string[] = ['segNmSegment', 'uid'];
  displayedColumns: string[] = ['Segmento', 'uid'];
  dataResource: MatTableDataSource<SegmentModel>;
  sortedData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('fieldSearch') fieldSearch: ElementRef<HTMLInputElement>;
  searchFilter: string = "";
  segmentList: Array<SegmentModel> = new Array<SegmentModel>();
  segmentListFull: Array<SegmentModel> = new Array<SegmentModel>();
  // MatPaginator Output
  pageEvent: PageEvent;
  // MatPaginator Inputs
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private segmentService: SegmentService,
    private userService: UserService
  ) {
    this.userLogged = JSON.parse(this.userService.userLogged!);
  }

  async ngOnInit() {
    this.segmentListFull = await this.loadingResource();
    this.bind(this.segmentList);
  }

  async bind(newList?: Array<SegmentModel>): Promise<void> {
    let segments: iResultHttp;
    if (this.searchFilter === '') {
      this.segmentList = await this.loadingResource();
    } else {
      this.segmentList = this.segmentListFull.filter((res) => {
        return res.segmNmSegment.trim().toLowerCase().indexOf(this.searchFilter) >= 0
      })
    }

    // Ordenando os registros
    this.segmentList = this.segmentList.sort((obj1, obj2) => {
      return obj1.segmNmSegment.toUpperCase() < obj2.segmNmSegment.toUpperCase() ? -1 :
        (obj1.segmNmSegment.toUpperCase() > obj2.segmNmSegment.toUpperCase() ? 1 : 0);
    });

    this.dataResource = new MatTableDataSource(this.segmentList);
    this.dataResource.paginator = this.paginator;
    this.dataResource.sort = this.sort;
    this.length = this.dataResource.data.length;
    this.sortedData = this.segmentList;
  }

  async loadingResource(): Promise<Array<SegmentModel>> {
    const users = await this.segmentService.getAll();
    let listSegments: Array<SegmentModel> = [];
    if (users.success) {
      listSegments = users.data as Array<SegmentModel>;
    }
    return listSegments;
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

  async delete(segment: SegmentModel): Promise<void> {
    const options: any = {
      ...Constants.delete_swal_options, text: `Deseja realmente excluir o segmento ${segment.segmNmSegment}`
    }
    const { value } = await swal.fire(options);
    if (value && segment.uid) {
      const result = await this.segmentService.delete(segment.uid);
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
        case 'Segmento': return compare(a.segmNmSegment.toUpperCase(), b.segmNmSegment.toUpperCase(), isAsc);
        default: return 0;
      }
    });
  }

}
