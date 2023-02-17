import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {

    let authReq = req;
    const token = this.tokenService.getToken();
    if (token != null && !this.isRefreshing) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && !authReq.url.includes('users/auth') && !authReq.url.includes('users/refreshtoken') && error.status === 401 && !this.isRefreshing) {
          return this.handle401Error(authReq, next);
        }
        return throwError(error);
      })
    )
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      const refreshToken = this.tokenService.getRefreshToken();
      if (refreshToken) {
        return this.authService.newToken(refreshToken).pipe(
          switchMap((res: any) => {
            this.tokenService.saveToken(res.token.message.token);
            this.isRefreshing = false;
            this.tokenService.saveRefreshToken(res.refreshToken.uid);
            this.refreshTokenSubject.next(res.token.message.token);

            return next.handle(this.addTokenHeader(request, res.token.message.token));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            return throwError(err);
          })
        )
      }
    }
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    )
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('x-token-access', token)
    })
  }
}
