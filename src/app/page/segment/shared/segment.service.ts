import { Injectable, resolveForwardRef } from '@angular/core';
import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { BaseService } from 'src/app/shared/service/base.service';
import { HttpService } from 'src/app/shared/service/http.service';
import { environment } from 'src/environments/environment';
import { SegmentModel } from './segment.model';

@Injectable({
  providedIn: 'root'
})
export class SegmentService extends BaseService<SegmentModel> {

  constructor(public httpService: HttpService) {
    super('segments', httpService);
  }

  async save(segment: SegmentModel): Promise<iResultHttp> {
    const url = `${environment.apiPath}/segments`;
    try {
      if(!segment.uid) {
        delete segment.uid;
      }
      return await this.httpService.post(url, segment);
    } catch (error) {
      return {success: false, data: undefined, error}
    }
  }
}
