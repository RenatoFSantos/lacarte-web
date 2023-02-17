import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from './page/user/shared/user.service';
import { iMenu } from './shared/interface/iMenu';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LoginModel } from './shared/model/login.model';
import { environment } from 'src/environments/environment';
import { UserModel } from './page/user/shared/user.model';
import { Constants } from './shared/config/constants';
import { TokenService } from './shared/service/token.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'lacarte-web';
  isLogger: boolean = false;
  classLogin: string = '';
  formResource: FormGroup;
  crumbPath: string = 'Home';

  userLogged: UserModel = new UserModel();

  menus: iMenu[] = [
    {
      icon: 'account_circle',
      name: 'Usuário',
      url: '/users'
    },
    {
      icon: 'apartment',
      name: 'Empresa',
      url: '/companies',
    },
    {
      icon: 'workspaces',
      name: 'Segmento',
      url: '/segments',
    },
    {
      icon: 'inventory_2',
      name: 'Produto',
      url: '/products',
    },
    {
      icon: 'category',
      name: 'Categoria',
      url: '/categories',
    },
  ]

  titleMenu = '';
  avatar = `${environment.apiPath}/storage/photo_default.jpg` || '../assets/image/avatar_padrao.png';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private tokenService: TokenService
  ) {
    if (this.userService.userLogged) {
      this.userLogged = JSON.parse(this.userService.userLogged);
      this.avatar = `${environment.apiPath}/storage/${this.userLogged.userTxAvatar}`;
    }
    this._createForm();
  }

  private _createForm() {
    this.formResource = this.fb.group({
      emailFormControl: ['', [Validators.required, Validators.email]],
      passwordFormControl: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.isLogger = this.userService.isStaticLogged;
    if(this.isLogger) {
      this.loadingUser(JSON.parse(localStorage.getItem('lacarte:user')!) as LoginModel);
    }
    console.log('Entrei no init');
    this.userService.isLogged.subscribe((res) => {
      this.isLogger = res
      if (this.userService.userLogged) {
        console.log('usuário logado');
        this.userLogged = JSON.parse(this.userService.userLogged);
        this.avatar = `${environment.apiPath}/storage/${this.userLogged.userTxAvatar}`;
      }
    });
    this.userService.updateLogged.subscribe((userUpdate) => {
      this.avatar = `${environment.apiPath}/storage/${userUpdate.userTxAvatar}`;
      this.userLogged.userNmName = userUpdate.userNmName;
    })
  }

  async loadingUser(userLogin: LoginModel) {
    Object.assign(this.userLogged, userLogin);
  }

  async logout() {
    const options: any = {
      ...Constants.exit_swal_options
    }
    const { value } = await Swal.fire(options);
    if (value && this.userLogged.uid) {
      this.tokenService.signOut();
      this.isLogger = false;
      this.router.navigateByUrl('/');
    }
  }

  async login() {
    const email = this.formResource.get('emailFormControl')?.value;
    const password = this.formResource.get('passwordFormControl')?.value;
    const result = await this.userService.login(email, password);
    if (result.success) {
      this.userService.configureLogin(result);
      this.loadingUser(JSON.parse(localStorage.getItem('lacarte:user')!) as LoginModel);
      this.isLogger = true;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Usuário/Senha inválidos!',
      })
      this.isLogger = false;
    }
  }

}
