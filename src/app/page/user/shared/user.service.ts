import { TokenService } from './../../../shared/service/token.service';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { iResultHttp } from 'src/app/shared/interface/iResultHttp';
import { BaseService } from 'src/app/shared/service/base.service';
import { HttpService } from 'src/app/shared/service/http.service';
import { environment } from 'src/environments/environment';
import { UserModel } from './user.model';
import * as moment from 'moment';
// import 'moment/locale/pt-br';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<UserModel> {

  private loginSubject = new Subject<boolean>();
  private updateLogin = new Subject<UserModel>();

  constructor(
    public httpService: HttpService,
    private tokenService: TokenService
  ) {
    super('users', httpService);
  }

  async login(userDsEmail: string, userCdPassword: string): Promise<iResultHttp> {
    return await this.httpService.post(`${environment.apiPath}/users/auth`, { userDsEmail, userCdPassword })
  }

  configureLogin(dataLogin: any): void {
    const user = dataLogin.data.token.message.user;
    const token = dataLogin.data.token.message.token;
    const refreshToken = dataLogin.data.refreshToken.uid;
    console.log('User', user);
    console.log('Token', token);
    console.log('RefreshToken', refreshToken);
    this.tokenService.saveUser(user);
    this.tokenService.saveRefreshToken(refreshToken);
    this.tokenService.saveToken(token);

    this.loginSubject.next(this.isStaticLogged);
  }

  save(user: UserModel): Promise<iResultHttp> {
    if(user.userDtBirthdate) {
      let birthDate = moment(new Date(user.userDtBirthdate), "YYYY-MM-DD");
      user.userDtBirthdate = birthDate.toDate();
    }
    if (user.uid) {
      // --- User already exist
      return this.httpService.post(`${environment.apiPath}/users`, user);
    } else {
      // --- New user
      return this.httpService.post(`${environment.apiPath}/users/create`, user);
    }
  }

  async getUserByEmail(email: string): Promise<iResultHttp> {
    const url = `${environment.apiPath}/users/email/${email}`;
    try {
      return await this.httpService.get(url);
    } catch (error) {
      return {success: false, data: undefined, error}
    }
  }

  updateUserLogged(user: UserModel) {
    this.updateLogin.next(user);
  }

  get isLogged(): Observable<boolean> {
    return this.loginSubject.asObservable();
  }

  get updateLogged(): Observable<UserModel> {
    return this.updateLogin.asObservable();
  }

  get isStaticLogged(): boolean {
    return !!localStorage.getItem('lacarte:token');
  }

  get userLogged(): string | null {
    return localStorage.getItem('lacarte:user');
  }

  static get token(): string | null {
    return localStorage.getItem('lacarte:token');
  }
}
