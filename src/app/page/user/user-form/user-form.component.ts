import { UserModel } from './../shared/user.model';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { iStatus } from 'src/app/shared/interface/iStatus';
import { FileManager } from 'src/app/shared/component/input-file/input-file.component';
import { environment } from 'src/environments/environment';
import { calcDurationDays } from 'src/app/shared/helper/utils';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  formResource: FormGroup;
  user: UserModel = new UserModel();
  userLogged: UserModel = new UserModel();
  pageTitle = '';
  perfil: iStatus[] = [
    { value: "A", viewValue: "Administrador" },
    { value: "E", viewValue: "Editor" },
    { value: "V", viewValue: "Consulta" },
  ]
  selected = this.perfil[0].value;
  avatar = 'photo_default.jpg';
  @ViewChild('appInput') appInput: ElementRef;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private matSnack: MatSnackBar,
    private router: Router,
    private active: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.active.params.subscribe(p => {
      this.getId(p['id']);
      this.createForm();
    })
  }

  async getId(uid: string): Promise<void> {
    if (uid === 'new' || typeof uid === 'undefined') {
      this.pageTitle = 'Novo Usuário';

    } else {
      const result = await this.userService.getById(uid);
      this.user = result.data as UserModel;
      this.formResource.patchValue(this.user);
      this.pageTitle = `Usuário: ${this.user.userNmName}`;
      await this.getUserLogged();
    }
    await this.loadingPhoto();
  }

  getUserLogged(): void {
    this.userLogged = JSON.parse(localStorage.getItem('lacarte:user')!);
  }

  loadingPhoto() {
    if (this.user.userTxAvatar) {
      this.avatar = `${environment.apiPath}/storage/${this.user.userTxAvatar}`;
    } else {
      this.avatar = `${environment.apiPath}/storage/photo_default.jpg`;
    }
  }

  private createForm() {
    this.formResource = this.fb.group({
      uid: [],
      userSgUser: ['', [Validators.required, Validators.maxLength(3)]],
      userCdType: ['', [Validators.required]],
      userDsEmail: ['', [Validators.required, Validators.email]],
      userNmName: ['', [Validators.required]],
      userNmLastname: ['', null],
      userDtBirthdate: [new Date(), null],
      userDsPhone: ['', null],
      userDsSmartphone: ['', null],
      userDsWhatsapp: ['', null],
      userCdPassword: ['', [Validators.required, Validators.maxLength(10)]],
      userCdConfirmPassword: ['', [Validators.required, Validators.maxLength(10)]],
      userTxAvatar: ['', null],
      userVlCashback: ['0', null],
      userVlScore: ['0', null],
      userVlRating: ['0', null],
    }, {
      validators: [
        this.confirmPassword('userCdPassword', 'userCdConfirmPassword'),
        this.validationBirthDate('userDtBirthdate')
      ]
    })
  }

  private confirmPassword(controlName: string, matchingControlName: string): ValidationErrors | null {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (matchingControl.value !== control.value) {
        matchingControl.setErrors({ mustMatch: true })
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  private validationBirthDate(controlName: string): ValidationErrors | null {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];

      if (control.errors && !control.errors['birthDate']) {
        return;
      }

      if(calcDurationDays(new Date(), new Date(control.value)) > 0 ) {
        control.setErrors(null);
      } else {
        control.setErrors({'birthDate': true})
      }

    }
  }

  async save(): Promise<void> {
    try {
      if (this.user.userTxAvatar) {
        this.formResource.get('userTxAvatar')?.setValue(this.user.userTxAvatar);
      }
      const result = await this.userService.save(this.formResource.value);
      if (result.success) {
        const userSave = result.data as UserModel;
        if (this.userLogged.uid === userSave.uid) {
          // --- Update avatar
          const userJson = await this.updateUserLogged(userSave);
          this.userService.updateUserLogged(userSave);
          localStorage.setItem('lacarte:user', JSON.stringify(userJson));
        }
        this.router.navigateByUrl('users');
      }
    } catch (error) {
      this.matSnack.open('Problemas na gravação do registro!', undefined, { duration: 3000 });
    }
  }

  updateUserLogged(user: UserModel) {
    const userJson = {
      uid: user.uid,
      userCdType: user.userCdType,
      userDsEmail: user.userDsEmail,
      userNmName: user.userNmName,
      userSgUser: user.userSgUser,
      userTxAvatar: user.userTxAvatar
    }
    return userJson;
  }

  selectedFile(file: FileManager): void {
    if (file.base64Data) {
      this.user.userTxAvatar = file.base64Data;
      this.avatar = file.base64Data;
    }
  }


}
