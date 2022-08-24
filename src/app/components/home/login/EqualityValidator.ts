import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Validator for ReactiveForms to check if control_a and control_b have equal form values
 * @param control_a The name of the first control object in the FormGroup to check for value equality
 * @param control_b The name of the second control object in the FormGroup to check for value equality
 */
export function EqualityValidator(control_a: string, control_b: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!(control.get(control_a).value === control.get(control_b).value)) {
      return {
        equality: {
          control_a: control.get(control_a).value,
          control_b: control.get(control_b).value,
        },
      };
    } else {
      return null;
    }
  };
}
