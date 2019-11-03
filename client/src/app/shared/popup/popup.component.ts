import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// modal which shows warning
@Component({
  selector: 'bomb-popup',
  templateUrl: './popup.component.pug',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  @Input() modal: NgbModalRef;
  @Input() message: string;
  @Output() closeModalEvent = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() { }

  closeModal(accept: boolean) {
    this.closeModalEvent.emit(accept);
    this.modal.close();
  }

}
