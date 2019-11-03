import { Component, Input } from '@angular/core';

// primary validation component
// shows error message when receive info that it should occur
@Component({
  selector: 'bomb-validation-error',
  templateUrl: './validation-error.component.pug',
})
export class ValidationErrorComponent {
  @Input() name: string;
  show = false;

  showsErrorIncludedIn(errors: string[]): boolean {
    return errors.some(error => error === this.name);
  }
}
