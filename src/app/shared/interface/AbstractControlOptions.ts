import { AsyncValidatorFn, ValidatorFn } from "@angular/forms"

interface AbstractControlOptions {
  validators?: ValidatorFn | ValidatorFn[] | null
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null
  updateOn?: 'change' | 'blur' | 'submit'
}
