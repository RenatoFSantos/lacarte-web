import { AbstractControl, FormControl, FormGroup, FormControlName } from '@angular/forms';
import * as moment from 'moment';

export class Validacoes {

  static validaCombo(myControl: FormControl) {

    if (!myControl.errors && myControl.value === null && !myControl.touched) {
      return null;
    }

    if (typeof myControl.value === 'object' && myControl.value !== null) {
      return null;
    } else {
      myControl.markAsTouched();
      return { isValidCombo: true };
    }
  }

  static ValidaCpf(controle: AbstractControl) {
    const cpf = controle.value;

    let soma: number = 0;
    let resto: number;
    let valido: boolean;

    const regex = new RegExp('[0-9]{11}');

    if (
      cpf === '00000000000' ||
      cpf === '11111111111' ||
      cpf === '22222222222' ||
      cpf === '33333333333' ||
      cpf === '44444444444' ||
      cpf === '55555555555' ||
      cpf === '66666666666' ||
      cpf === '77777777777' ||
      cpf === '88888888888' ||
      cpf === '99999999999' ||
      !regex.test(cpf)
    ) {
      valido = false;
    } else {
      for (let i = 1; i <= 9; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
      }
      resto = (soma * 10) % 11;

      if (resto === 10 || resto === 11) {
        resto = 0;
      }

      if (resto !== parseInt(cpf.substring(9, 10), 10)) {
        valido = false;
      }

      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
      }
      resto = (soma * 10) % 11;

      if (resto === 10 || resto === 11) {
        resto = 0;
      }

      if (resto !== parseInt(cpf.substring(10, 11), 10)) {
        valido = false;
      }
      valido = true;
    }

    if (valido) {
      return null;
    }

    return { cpfInvalido: true };
  }

  static MaiorQue18Anos(controle: AbstractControl) {
    const nascimento = controle.value;
    const [ano, mes, dia] = nascimento.split('-');
    const hoje = new Date();
    const dataNascimento = new Date(ano, mes, dia, 0, 0, 0);
    // --- 18 anos em mili segundos...
    const tempoParaTeste = 1000 * 60 * 60 * 24 * 365 * 18;

    if (hoje.getTime() - dataNascimento.getTime() >= tempoParaTeste) {
      return null;
    }

    return { menorDeIdade: true };
  }

  static SenhasCombinam(controlName: string, controlNameCompare: string) {
    return (formGroup: FormGroup) => {
      const senha = formGroup.controls[controlName];
      const confirma = formGroup.controls[controlNameCompare];

      if (confirma.errors && !confirma.errors['mustMatch']) {
        return;
      }

      if (senha.value !== confirma.value) {
        confirma.setErrors({ mustMatch: true });
      } else {
        confirma.setErrors(null);
      }
    };
  }

  static validaAutoComplete(controlName: string) {
    return (formGroup: FormGroup) => {
      const autoComplete = formGroup.controls[controlName];

      if (autoComplete.errors && !autoComplete.errors['mustExist']) {
        return;
      }
      if (typeof autoComplete.value !== 'object' && autoComplete.value !== '') {
        autoComplete.setErrors({ mustExist: true });
      } else {
        autoComplete.setErrors(null);
      }
    };
  }

  static compareDates(dtIni: string, dtFim: string) {
    return (formGroup: FormGroup) => {
      const dtInicio = formGroup.controls[dtIni];
      const dtTermino = formGroup.controls[dtFim];

      // --- Transforma as datas no formato desejado
      if (dtInicio.value && dtTermino.value) {
        const partsIni = moment(dtInicio.value).format('DD/MM/YYYY');
        const partsFim = moment(dtTermino.value).format('DD/MM/YYYY');

        if (dtTermino.errors && !dtTermino.errors['dateInvalid']) {
          return;
        }

        if (partsIni > partsFim) {
          dtTermino.setErrors({ dateInvalid: true });
        } else {
          dtTermino.setErrors(null);
        }
      } else {
        return;
      }
    };
  }

}
