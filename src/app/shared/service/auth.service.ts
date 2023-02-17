import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const httpOption = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  public newToken(refresh_token: string) {
    return this.http.post(`${environment.apiPath}/users/refreshtoken`, { refresh_token: refresh_token }, httpOption);
  }
}
