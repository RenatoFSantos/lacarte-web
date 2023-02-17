import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss']
})
export class ErrorMessageComponent implements OnInit {

  @Input('form-control') formControl: FormControl = new FormControl();

  constructor() { }

  ngOnInit(): void {
  }

  public get errorMessage(): string | null {
    if (this.mustShowErrorMessage()) {
      return this.getErrorMessage();
    } else {
      return null
    }
  }

  private mustShowErrorMessage(): boolean {
    return this.formControl.invalid && this.formControl.touched
  }

  private getErrorMessage(): string | null {
    if (this.formControl.errors?.['required'])
      return 'dado é obrigatório!'
    else if (this.formControl.errors?.['email'])
      return 'formato de email inválido!'
    else if (this.formControl.errors?.['minlength']) {
      const requiredLength = this.formControl.errors?.['minlength'].requiredLength;
      return `deve ter no mínimo ${requiredLength} caracteres`
    }
    else if (this.formControl.errors?.['maxlength']) {
      const requiredLength = this.formControl.errors?.['maxlength'].requiredLength;
      return `deve ter no máximo ${requiredLength} caracteres`
    }
    else if (this.formControl.errors?.['orderExist']) {
      return `número de ordem já existente.`
    }
    else if (this.formControl.errors?.['mustMatch']) {
      return `senhas não conferem!`
    }
    else if (this.formControl.errors?.['birthDate']) {
      return `Data inválida!`
    }
    else if (this.formControl.errors?.['maxPercent']) {
      return `Deve ser menor que 100%`;
    }
    else if (this.formControl.errors?.['diffDate']) {
      return `Período inválido. Verifique as datas.`;
    }
    return null;
  }

}
