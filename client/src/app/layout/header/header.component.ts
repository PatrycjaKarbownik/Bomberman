import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { AuthToken } from '@app/core/storages/auth-token.storage';
import { CurrentUserModel } from '@app/shared/auth/current-user.model';
import { CurrentUserService } from '@app/shared/auth/current-user.service';

// bar on view top -> shows username and gives logout option
@Component({
  selector: 'bomb-header',
  templateUrl: './header.component.pug',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @AuthToken()
  private authToken: string;

  constructor(private router: Router, private modal: NgbModal, private currentUserService: CurrentUserService) { }

  logout() {
    this.authToken = null;
    this.router.navigateByUrl('auth').then(() => location.reload());
  }

  getUsername(): Observable<CurrentUserModel> {
    return this.currentUserService.getCurrentUser();
  }
}
