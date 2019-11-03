import { Component, ContentChildren, Input, OnDestroy, OnInit, QueryList } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';

import { Subscription } from 'rxjs';

import { ValidationErrorComponent } from '@app/shared/validation/validation-error.component';

// main validation component
// it collects changes on observing component
// and transmit it to appropriate children
@Component({
  selector: 'bomb-validation-errors',
  templateUrl: './validation-errors.component.pug'
})
export class ValidationErrorsComponent implements OnInit, OnDestroy {
  @Input() for: NgModel;
  @ContentChildren(ValidationErrorComponent) errorsComponent: QueryList<ValidationErrorComponent>;

  private formStatusChangeSubscription: Subscription;
  private formSubmitSubscription: Subscription;

  // execute on create component
  // it subscribes changes on observing component
  ngOnInit(): void {
    const form: NgForm = this.for.formDirective;
    const input: NgModel = this.for;

    this.formStatusChangeSubscription = form.statusChanges.subscribe(() => this.updateState(input, false));
    this.formSubmitSubscription = form.ngSubmit.subscribe(() => this.updateState(input, true));
  }

  // execute on destroy component
  // it unsubscribes from changes on observing component
  ngOnDestroy(): void {
    this.formStatusChangeSubscription.unsubscribe();
    this.formSubmitSubscription.unsubscribe();
  }

  private updateState(input: NgModel, submitEvent: boolean) {
    this.errorsComponent.forEach(errorComponent => errorComponent.show = false);

    if (input.invalid && (input.touched || input.dirty || submitEvent)) {
      const firstErrorComponent = this.errorsComponent
        .find(errorComponent => errorComponent.showsErrorIncludedIn(Object.keys(this.for.errors)));

      if (firstErrorComponent) firstErrorComponent.show = true;
    }
  }
}
